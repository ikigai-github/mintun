import { Data } from "lucid-cardano";
import { prepareAssets } from "./nft";
import { fetchOwnerUtxo, fetchStateUtxo, ScriptCache } from "./script";
import { MintRedeemerShape, StateValidatorRedeemerShape } from "./contract";
import { NftMetadataWrappedShape } from "./cip-68";
import { toRoyaltyUnit } from "./cip-102";
import {
  addMintsToCollectionState,
  asChainStateData,
  CollectionStateMetadataShape,
  extractCollectionState
} from "./collection-state";
const CIP_25_METADATA_LABEL = 721;
class MintTxBuilder {
  #lucid;
  #seed;
  #cache;
  #recipient;
  #stateUtxo;
  #ownerUtxo;
  #currentState;
  #nfts = [];
  #useCip25 = false;
  constructor(lucid) {
    this.#lucid = lucid;
  }
  seed(seed) {
    this.#seed = seed;
    return this;
  }
  cache(cache) {
    this.#cache = cache;
    return this;
  }
  recipient(recipient) {
    this.#recipient = recipient;
    return this;
  }
  stateUtxo(utxo) {
    this.#stateUtxo = utxo;
    return this;
  }
  ownerUtxo(utxo) {
    this.#ownerUtxo = utxo;
    return this;
  }
  state(state) {
    this.#currentState = state;
    return this;
  }
  nft(metadata, recipient = void 0) {
    this.#nfts.push({ metadata, recipient });
    return this;
  }
  nfts(nfts, recipient = void 0) {
    const mapped = nfts.map((metadata) => ({
      metadata,
      recipient
    }));
    this.#nfts = [...this.#nfts, ...mapped];
    return this;
  }
  // Note: Not sure this is a good idea may just confuse things to have both cip-25 and cip-68 metadata.
  //       Also, if NFT metadata is in any way modifiable then we shouldn't use cip-25.
  useCip25(useCip25) {
    this.#useCip25 = useCip25;
    return this;
  }
  async build() {
    const numMints = this.nfts.length;
    if (numMints === 0) {
      throw new Error("Cannot build a mint transaction with no NFTs to mint");
    }
    let cache;
    if (this.#cache) {
      cache = ScriptCache.copy(this.#lucid, this.#cache);
    } else if (this.#seed) {
      cache = ScriptCache.cold(this.#lucid, this.#seed);
    } else {
      throw new Error("Must either supply a seed utxo or a script cache to build transaction");
    }
    const mint = cache.mint();
    const spend = cache.state();
    const unit = cache.unit();
    const stateUtxo = this.#stateUtxo ? this.#stateUtxo : await fetchStateUtxo(cache);
    if (!stateUtxo) {
      throw new Error("Could not find the utxo holding state. It must be spent to mint");
    }
    let ownerUtxo = this.#ownerUtxo;
    if (!ownerUtxo) {
      const { utxo, wallet } = await fetchOwnerUtxo(cache);
      if (!utxo) {
        throw new Error("Could not find the utxo holding the owner token");
      }
      if (!wallet) {
        throw new Error("Cannot spend owner token because it is not in the current selected lucid wallet");
      }
      ownerUtxo = utxo;
    }
    const royaltyUnit = toRoyaltyUnit(mint.policyId);
    const royaltyFindResult = await this.#lucid.utxoByUnit(royaltyUnit);
    const hasRoyalty = royaltyFindResult !== void 0;
    const currentState = this.#currentState ? this.#currentState : await extractCollectionState(this.#lucid, stateUtxo);
    const defaultRecipientAddress = this.#recipient || await this.#lucid.wallet.address();
    const referenceAddress = currentState.nftValidatorAddress;
    const nextState = addMintsToCollectionState(currentState, numMints);
    const chainState = asChainStateData(nextState);
    const prepared = prepareAssets(
      this.#nfts,
      mint.policyId,
      currentState.nextSequence,
      defaultRecipientAddress,
      hasRoyalty,
      referenceAddress
    );
    const mintRedeemer = Data.to("EndpointMint", MintRedeemerShape);
    const validatorRedeemer = Data.to("EndpointMint", StateValidatorRedeemerShape);
    const ownerAsset = { [unit.owner]: 1n };
    const stateAsset = { [unit.state]: 1n };
    const stateOutput = { inline: Data.to(chainState, CollectionStateMetadataShape) };
    const tx = this.#lucid.newTx().collectFrom([ownerUtxo]).attachSpendingValidator(spend.script).collectFrom([stateUtxo], validatorRedeemer).attachMintingPolicy(mint.script).mintAssets(prepared.mints, mintRedeemer).payToAddress(defaultRecipientAddress, ownerAsset).payToAddressWithData(spend.address, stateOutput, stateAsset);
    for (const payout of prepared.referencePayouts) {
      const outputData = { inline: Data.to(payout.chainData, NftMetadataWrappedShape) };
      const referenceaAsset = { [payout.unit]: 1n };
      tx.payToAddressWithData(payout.address, outputData, referenceaAsset);
    }
    for (const [address, units] of Object.entries(prepared.userPayouts)) {
      const assets = {};
      for (const unit2 of units) {
        assets[unit2] = 1n;
      }
      tx.payToAddress(address, assets);
    }
    if (this.#useCip25) {
      tx.attachMetadata(CIP_25_METADATA_LABEL, prepared.cip25Metadata);
    }
    return { tx, cache };
  }
  static create(lucid) {
    return new MintTxBuilder(lucid);
  }
}
export {
  CIP_25_METADATA_LABEL,
  MintTxBuilder
};
