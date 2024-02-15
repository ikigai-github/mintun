"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _contract = require('./contract');
var _utils = require('./utils');
var _cip102 = require('./cip-102');
var _cip27 = require('./cip-27');
var _script = require('./script');
var _collectioninfo = require('./collection-info');
var _cip88 = require('./cip-88');




var _collectionstate = require('./collection-state');
var _collection = require('./collection');
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
    if (_utils.checkPolicyId.call(void 0, policyId)) {
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
    if (maxNfts > 0 || maxNfts < _collection.SEQUENCE_MAX_VALUE) {
      this.#state.maxNfts = maxNfts;
      return this;
    }
    throw new Error(`If using maxNfts it must be between 0 and ${_collection.SEQUENCE_MAX_VALUE}`);
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
    const cache = _script.ScriptCache.cold(this.#lucid, this.#seed);
    const mintScript = cache.mint();
    const stateScript = cache.state();
    const infoScript = cache.immutableInfo();
    const unit = cache.unit();
    const recipient = this.#ownerAddress ? this.#ownerAddress : await this.#lucid.wallet.address();
    const stateValidatorAssets = { [unit.state]: 1n };
    const infoValidatorAssets = { [unit.info]: 1n };
    const recipientAssets = { [unit.owner]: 1n };
    const assets = { ...stateValidatorAssets, ...infoValidatorAssets, ...recipientAssets };
    const redeemer = _lucidcardano.Data.to({
      "EndpointGenesis": {
        state_validator_policy_id: stateScript.policyId,
        info_validator_policy_id: infoScript.policyId
      }
    }, _contract.MintRedeemerShape);
    const tx = this.#lucid.newTx().attachMintingPolicy(mintScript.script).collectFrom([this.#seed]);
    const royalties = Object.values(this.#royalties);
    if (royalties.length > 0) {
      if (this.#useCip27) {
        if (royalties.length > 1) {
          throw new Error("Cannot use cip-27 royalty when there is more than one royalty recipient");
        }
        recipientAssets[mintScript.policyId] = 1n;
        _cip27.addCip27RoyaltyToTransaction.call(void 0, tx, mintScript.policyId, royalties[0], redeemer);
      }
      const royaltyAddress = this.#royaltyValidatorAddress ? this.#royaltyValidatorAddress : await this.#lucid.wallet.address();
      _cip102.addCip102RoyaltyToTransaction.call(void 0, tx, mintScript.policyId, royaltyAddress, royalties, redeemer);
    }
    if (this.#useCip88) {
      const config = {
        info: this.#info,
        cip102Royalties: royalties
      };
      if (this.#useCip27 && royalties.length === 1) {
        config.cip27Royalty = royalties[0];
      }
      _cip88.addCip88MetadataToTransaction.call(void 0, this.#lucid, tx, mintScript.script, unit.owner, config);
    }
    if (!this.#state.nftValidatorAddress && this.#useImmutableNftValidator) {
      this.#state.nftValidatorAddress = cache.immutableNft().address;
    }
    const genesisStateData = _collectionstate.createGenesisStateData.call(void 0, this.#state);
    const genesisStateDatum = _lucidcardano.Data.to(genesisStateData, _collectionstate.CollectionStateMetadataShape);
    const infoData = _collectioninfo.asChainCollectionInfo.call(void 0, this.#info);
    const infoDatum = _lucidcardano.Data.to(infoData, _collectioninfo.CollectionInfoMetadataShape);
    tx.mintAssets(assets, redeemer).payToAddressWithData(stateScript.address, {
      inline: genesisStateDatum
    }, stateValidatorAssets).payToAddressWithData(infoScript.address, {
      inline: infoDatum
    }, infoValidatorAssets).payToAddress(recipient, recipientAssets);
    const state = _collectionstate.toCollectionState.call(void 0, this.#lucid, genesisStateData);
    return { cache, tx, state, recipient };
  }
  static create(lucid) {
    return new GenesisTxBuilder(lucid);
  }
}


exports.GenesisTxBuilder = GenesisTxBuilder;
