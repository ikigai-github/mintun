import { Data } from "lucid-cardano";
import { MintRedeemerShape } from "./contract";
import { checkPolicyId } from "./utils";
import { addCip102RoyaltyToTransaction } from "./cip-102";
import { addCip27RoyaltyToTransaction } from "./cip-27";
import { ScriptCache } from "./script";
import { asChainCollectionInfo, CollectionInfoMetadataShape } from "./collection-info";
import { addCip88MetadataToTransaction } from "./cip-88";
import {
  CollectionStateMetadataShape,
  createGenesisStateData,
  toCollectionState
} from "./collection-state";
import { SEQUENCE_MAX_VALUE } from "./collection";
class GenesisTxBuilder {
  #lucid;
  #seed;
  #info;
  #state = {};
  #useCip27 = false;
  #useCip88 = false;
  #useImmutableNftValidator = false;
  #royalties = {};
  #royaltyValidatorAddress;
  #ownerAddress;
  constructor(lucid) {
    this.#lucid = lucid;
  }
  seed(seed) {
    this.#seed = seed;
    return this;
  }
  group(policyId) {
    if (checkPolicyId(policyId)) {
      this.#state.group = policyId;
      return this;
    }
    throw new Error("Group policy id must be a 28 bytes hex string");
  }
  mintWindow(startMs, endMs) {
    if (startMs >= 0 && startMs < endMs) {
      this.#state.mintWindow = {
        startMs,
        endMs
      };
      return this;
    }
    throw new Error("Start and End milliseconds must be positive integers with end > start");
  }
  maxNfts(maxNfts) {
    if (maxNfts > 0 || maxNfts < SEQUENCE_MAX_VALUE) {
      this.#state.maxNfts = maxNfts;
      return this;
    }
    throw new Error(`If using maxNfts it must be between 0 and ${SEQUENCE_MAX_VALUE}`);
  }
  nftValidatorAddress(address) {
    if (address.startsWith("addr")) {
      this.#state.nftValidatorAddress = address;
      return this;
    }
    throw new Error("reference token validator address must be bech32 encoded string");
  }
  nftValidator(validator) {
    this.#state.nftValidatorAddress = this.#lucid.utils.validatorToAddress(validator);
    return this;
  }
  useImmutableNftValidator(useImmutableNftValidator) {
    this.#useImmutableNftValidator = useImmutableNftValidator;
    return this;
  }
  royaltyValidatorAddress(address) {
    if (address.startsWith("addr")) {
      this.#royaltyValidatorAddress = address;
      return this;
    }
    throw new Error("royalty address must be bech32 encoded string");
  }
  royaltyValidator(validator) {
    this.#royaltyValidatorAddress = this.#lucid.utils.validatorToAddress(validator);
    return this;
  }
  ownerAddress(address) {
    if (address.startsWith("addr")) {
      this.#ownerAddress = address;
      return this;
    }
    throw Error("Owner address bust be a bech32 encoded string");
  }
  state(state) {
    this.#state = state;
    return this;
  }
  // Don't bother translating till build step
  info(info) {
    this.#info = info;
    return this;
  }
  // When called the builder will include a null token and CIP-27 transaction metadata, if royalties are set
  useCip27(useCip27) {
    this.#useCip27 = useCip27;
    return this;
  }
  // When called the builder will include CIP-88 data in transaction metadta
  useCip88(useCip88) {
    this.#useCip88 = useCip88;
    return this;
  }
  royalty(address, variableFee, minFee = void 0, maxFee = void 0) {
    if (variableFee < 0.1) {
      throw new Error(
        "Royalty percent must be greater than 0.1%. If you want a fixed fee set min fee equal to max fee and percent to any postive number"
      );
    }
    if (!address.startsWith("addr")) {
      throw new Error("This is not a valid bech32 address");
    }
    if (this.#royalties[address]) {
      throw new Error("Can only add royalties for an address once");
    }
    this.#royalties[address] = { address, variableFee, minFee, maxFee };
    const total = Object.values(this.#royalties).map((royalty) => royalty.variableFee).reduce(
      (acc, next) => acc + next,
      0
    );
    if (total > 100) {
      throw new Error(
        "Total royalty percent must be less than 100"
      );
    }
    return this;
  }
  async build() {
    if (!this.#seed) {
      throw new Error("Missing required field seed. Did you forget to call `seed(utxo)`?");
    }
    if (!this.#info) {
      throw new Error("Missing required collection information. Did you call `info(info)`?");
    }
    const cache = ScriptCache.cold(this.#lucid, this.#seed);
    const mintScript = cache.mint();
    const stateScript = cache.state();
    const infoScript = cache.immutableInfo();
    const unit = cache.unit();
    const recipient = this.#ownerAddress ? this.#ownerAddress : await this.#lucid.wallet.address();
    const stateValidatorAssets = { [unit.state]: 1n };
    const infoValidatorAssets = { [unit.info]: 1n };
    const recipientAssets = { [unit.owner]: 1n };
    const assets = { ...stateValidatorAssets, ...infoValidatorAssets, ...recipientAssets };
    const redeemer = Data.to({
      "EndpointGenesis": {
        state_validator_policy_id: stateScript.policyId,
        info_validator_policy_id: infoScript.policyId
      }
    }, MintRedeemerShape);
    const tx = this.#lucid.newTx().attachMintingPolicy(mintScript.script).collectFrom([this.#seed]);
    const royalties = Object.values(this.#royalties);
    if (royalties.length > 0) {
      if (this.#useCip27) {
        if (royalties.length > 1) {
          throw new Error("Cannot use cip-27 royalty when there is more than one royalty recipient");
        }
        recipientAssets[mintScript.policyId] = 1n;
        addCip27RoyaltyToTransaction(tx, mintScript.policyId, royalties[0], redeemer);
      }
      const royaltyAddress = this.#royaltyValidatorAddress ? this.#royaltyValidatorAddress : await this.#lucid.wallet.address();
      addCip102RoyaltyToTransaction(tx, mintScript.policyId, royaltyAddress, royalties, redeemer);
    }
    if (this.#useCip88) {
      const config = {
        info: this.#info,
        cip102Royalties: royalties
      };
      if (this.#useCip27 && royalties.length === 1) {
        config.cip27Royalty = royalties[0];
      }
      addCip88MetadataToTransaction(this.#lucid, tx, mintScript.script, unit.owner, config);
    }
    if (!this.#state.nftValidatorAddress && this.#useImmutableNftValidator) {
      this.#state.nftValidatorAddress = cache.immutableNft().address;
    }
    const genesisStateData = createGenesisStateData(this.#state);
    const genesisStateDatum = Data.to(genesisStateData, CollectionStateMetadataShape);
    const infoData = asChainCollectionInfo(this.#info);
    const infoDatum = Data.to(infoData, CollectionInfoMetadataShape);
    tx.mintAssets(assets, redeemer).payToAddressWithData(stateScript.address, {
      inline: genesisStateDatum
    }, stateValidatorAssets).payToAddressWithData(infoScript.address, {
      inline: infoDatum
    }, infoValidatorAssets).payToAddress(recipient, recipientAssets);
    const state = toCollectionState(this.#lucid, genesisStateData);
    return { cache, tx, state, recipient };
  }
  static create(lucid) {
    return new GenesisTxBuilder(lucid);
  }
}
export {
  GenesisTxBuilder
};