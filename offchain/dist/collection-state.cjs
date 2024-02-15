"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _lucidcardano = require('lucid-cardano');
var _cip68 = require('./cip-68');
var _common = require('./common');







var _aiken = require('./aiken');
var _collection = require('./collection');
const CollectionStateSchema = _lucidcardano.Data.Object({
  group: _lucidcardano.Data.Nullable(_lucidcardano.Data.Bytes({ minLength: _common.POLICY_ID_BYTE_LENGTH, maxLength: _common.POLICY_ID_BYTE_LENGTH })),
  mint_window: _lucidcardano.Data.Nullable(_aiken.PosixTimeIntervalSchema),
  max_nfts: _lucidcardano.Data.Nullable(_lucidcardano.Data.Integer({ minimum: 1, maximum: _collection.SEQUENCE_MAX_VALUE })),
  force_locked: _lucidcardano.Data.Boolean(),
  current_nfts: _lucidcardano.Data.Integer({ minimum: 0, maximum: _collection.SEQUENCE_MAX_VALUE }),
  next_sequence: _lucidcardano.Data.Integer({ minimum: 0, maximum: _collection.SEQUENCE_MAX_VALUE }),
  reference_address: _lucidcardano.Data.Nullable(_aiken.ChainAddressSchema)
});
const COLLECTION_STATE_TOKEN_LABEL = 600;
const COLLECTION_TOKEN_ASSET_NAME = "00258a50436f6c6c656374696f6e";
const CollectionStateShape = CollectionStateSchema;
const CollectionStateMetadataSchema = _lucidcardano.Data.Object({
  metadata: CollectionStateSchema,
  version: _lucidcardano.Data.Integer({ minimum: 1 }),
  extra: _lucidcardano.Data.Any()
});
const CollectionStateMetadataShape = CollectionStateMetadataSchema;
function toStateUnit(policyId) {
  return policyId + COLLECTION_TOKEN_ASSET_NAME;
}
async function extractCollectionState(lucid, utxo) {
  const chainState = await lucid.datumOf(utxo, CollectionStateMetadataShape);
  return toCollectionState(lucid, chainState);
}
function toCollectionState(lucid, chainState) {
  const { metadata } = chainState;
  const group = _nullishCoalesce(metadata.group, () => ( void 0));
  const mintWindow = metadata.mint_window ? _aiken.toTimeWindow.call(void 0, metadata.mint_window) : void 0;
  const maxNfts = metadata.max_nfts ? Number(metadata.max_nfts) : void 0;
  const currentNfts = Number(metadata.current_nfts);
  const nextSequence = Number(metadata.next_sequence);
  const locked = metadata.force_locked;
  const nftValidatorAddress = metadata.reference_address ? _aiken.toBech32Address.call(void 0, lucid, metadata.reference_address) : void 0;
  return {
    group,
    mintWindow,
    maxNfts,
    locked,
    currentNfts,
    nextSequence,
    nftValidatorAddress
  };
}
function createGenesisStateData(state) {
  const group = _nullishCoalesce(state.group, () => ( null));
  const mint_window = state.mintWindow ? _aiken.asChainTimeWindow.call(void 0, state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const reference_address = state.nftValidatorAddress ? _aiken.asChainAddress.call(void 0, state.nftValidatorAddress) : null;
  const metadata = {
    group,
    mint_window,
    max_nfts,
    force_locked: false,
    current_nfts: 0n,
    next_sequence: 0n,
    reference_address
  };
  return _cip68.createReferenceData.call(void 0, metadata);
}
function asChainStateData(state) {
  const group = _nullishCoalesce(state.group, () => ( null));
  const mint_window = state.mintWindow ? _aiken.asChainTimeWindow.call(void 0, state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const force_locked = state.locked;
  const current_nfts = BigInt(state.currentNfts);
  const next_sequence = BigInt(state.nextSequence);
  const reference_address = state.nftValidatorAddress ? _aiken.asChainAddress.call(void 0, state.nftValidatorAddress) : null;
  const metadata = {
    group,
    mint_window,
    max_nfts,
    force_locked,
    current_nfts,
    next_sequence,
    reference_address
  };
  return _cip68.createReferenceData.call(void 0, metadata);
}
function addMintsToCollectionState(state, numMints) {
  if (state.locked) {
    throw new Error("The state locked flag is set to true so it cannot be udpated with new mints");
  }
  const now = Date.now();
  if (state.mintWindow && (state.mintWindow.startMs > now || state.mintWindow.endMs < now)) {
    throw new Error("The valid mint window for this minting policy has passed. Cannot mint new NFTs.");
  }
  const nextState = {
    ...state,
    currentNfts: state.currentNfts + numMints,
    nextSequence: state.nextSequence + numMints
  };
  if (state.maxNfts && nextState.currentNfts > state.maxNfts) {
    throw new Error("The number of NFTs being minted would exceed the maximum allowed NFTs for this minting policy");
  }
  return nextState;
}












exports.COLLECTION_STATE_TOKEN_LABEL = COLLECTION_STATE_TOKEN_LABEL; exports.COLLECTION_TOKEN_ASSET_NAME = COLLECTION_TOKEN_ASSET_NAME; exports.CollectionStateMetadataSchema = CollectionStateMetadataSchema; exports.CollectionStateMetadataShape = CollectionStateMetadataShape; exports.CollectionStateShape = CollectionStateShape; exports.addMintsToCollectionState = addMintsToCollectionState; exports.asChainStateData = asChainStateData; exports.createGenesisStateData = createGenesisStateData; exports.extractCollectionState = extractCollectionState; exports.toCollectionState = toCollectionState; exports.toStateUnit = toStateUnit;
