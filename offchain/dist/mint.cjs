"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _nft = require('./nft');
var _script = require('./script');
var _contract = require('./contract');
var _cip68 = require('./cip-68');
var _cip102 = require('./cip-102');





var _collectionstate = require('./collection-state');
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
      cache = _script.ScriptCache.copy(this.#lucid, this.#cache);
    } else if (this.#seed) {
      cache = _script.ScriptCache.cold(this.#lucid, this.#seed);
    } else {
      throw new Error("Must either supply a seed utxo or a script cache to build transaction");
    }
    const mint = cache.mint();
    const spend = cache.state();
    const unit = cache.unit();
    const stateUtxo = this.#stateUtxo ? this.#stateUtxo : await _script.fetchStateUtxo.call(void 0, cache);
    if (!stateUtxo) {
      throw new Error("Could not find the utxo holding state. It must be spent to mint");
    }
    let ownerUtxo = this.#ownerUtxo;
    if (!ownerUtxo) {
      const { utxo, wallet } = await _script.fetchOwnerUtxo.call(void 0, cache);
      if (!utxo) {
        throw new Error("Could not find the utxo holding the owner token");
      }
      if (!wallet) {
        throw new Error("Cannot spend owner token because it is not in the current selected lucid wallet");
      }
      ownerUtxo = utxo;
    }
    const royaltyUnit = _cip102.toRoyaltyUnit.call(void 0, mint.policyId);
    const royaltyFindResult = await this.#lucid.utxoByUnit(royaltyUnit);
    const hasRoyalty = royaltyFindResult !== void 0;
    const currentState = this.#currentState ? this.#currentState : await _collectionstate.extractCollectionState.call(void 0, this.#lucid, stateUtxo);
    const defaultRecipientAddress = this.#recipient || await this.#lucid.wallet.address();
    const referenceAddress = currentState.nftValidatorAddress;
    const nextState = _collectionstate.addMintsToCollectionState.call(void 0, currentState, numMints);
    const chainState = _collectionstate.asChainStateData.call(void 0, nextState);
    const prepared = _nft.prepareAssets.call(void 0, 
      this.#nfts,
      mint.policyId,
      currentState.nextSequence,
      defaultRecipientAddress,
      hasRoyalty,
      referenceAddress
    );
    const mintRedeemer = _lucidcardano.Data.to("EndpointMint", _contract.MintRedeemerShape);
    const validatorRedeemer = _lucidcardano.Data.to("EndpointMint", _contract.StateValidatorRedeemerShape);
    const ownerAsset = { [unit.owner]: 1n };
    const stateAsset = { [unit.state]: 1n };
    const stateOutput = { inline: _lucidcardano.Data.to(chainState, _collectionstate.CollectionStateMetadataShape) };
    const tx = this.#lucid.newTx().collectFrom([ownerUtxo]).attachSpendingValidator(spend.script).collectFrom([stateUtxo], validatorRedeemer).attachMintingPolicy(mint.script).mintAssets(prepared.mints, mintRedeemer).payToAddress(defaultRecipientAddress, ownerAsset).payToAddressWithData(spend.address, stateOutput, stateAsset);
    for (const payout of prepared.referencePayouts) {
      const outputData = { inline: _lucidcardano.Data.to(payout.chainData, _cip68.NftMetadataWrappedShape) };
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



exports.CIP_25_METADATA_LABEL = CIP_25_METADATA_LABEL; exports.MintTxBuilder = MintTxBuilder;
