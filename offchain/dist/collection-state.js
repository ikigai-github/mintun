import { Data } from "lucid-cardano";
import { createReferenceData } from "./cip-68";
import { POLICY_ID_BYTE_LENGTH } from "./common";
import {
  asChainAddress,
  asChainTimeWindow,
  ChainAddressSchema,
  PosixTimeIntervalSchema,
  toBech32Address,
  toTimeWindow
} from "./aiken";
import { SEQUENCE_MAX_VALUE } from "./collection";
const CollectionStateSchema = Data.Object({
  group: Data.Nullable(Data.Bytes({ minLength: POLICY_ID_BYTE_LENGTH, maxLength: POLICY_ID_BYTE_LENGTH })),
  mint_window: Data.Nullable(PosixTimeIntervalSchema),
  max_nfts: Data.Nullable(Data.Integer({ minimum: 1, maximum: SEQUENCE_MAX_VALUE })),
  force_locked: Data.Boolean(),
  current_nfts: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  next_sequence: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  reference_address: Data.Nullable(ChainAddressSchema)
});
const COLLECTION_STATE_TOKEN_LABEL = 600;
const COLLECTION_TOKEN_ASSET_NAME = "00258a50436f6c6c656374696f6e";
const CollectionStateShape = CollectionStateSchema;
const CollectionStateMetadataSchema = Data.Object({
  metadata: CollectionStateSchema,
  version: Data.Integer({ minimum: 1 }),
  extra: Data.Any()
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
  const group = metadata.group ?? void 0;
  const mintWindow = metadata.mint_window ? toTimeWindow(metadata.mint_window) : void 0;
  const maxNfts = metadata.max_nfts ? Number(metadata.max_nfts) : void 0;
  const currentNfts = Number(metadata.current_nfts);
  const nextSequence = Number(metadata.next_sequence);
  const locked = metadata.force_locked;
  const nftValidatorAddress = metadata.reference_address ? toBech32Address(lucid, metadata.reference_address) : void 0;
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
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const reference_address = state.nftValidatorAddress ? asChainAddress(state.nftValidatorAddress) : null;
  const metadata = {
    group,
    mint_window,
    max_nfts,
    force_locked: false,
    current_nfts: 0n,
    next_sequence: 0n,
    reference_address
  };
  return createReferenceData(metadata);
}
function asChainStateData(state) {
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const force_locked = state.locked;
  const current_nfts = BigInt(state.currentNfts);
  const next_sequence = BigInt(state.nextSequence);
  const reference_address = state.nftValidatorAddress ? asChainAddress(state.nftValidatorAddress) : null;
  const metadata = {
    group,
    mint_window,
    max_nfts,
    force_locked,
    current_nfts,
    next_sequence,
    reference_address
  };
  return createReferenceData(metadata);
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
export {
  COLLECTION_STATE_TOKEN_LABEL,
  COLLECTION_TOKEN_ASSET_NAME,
  CollectionStateMetadataSchema,
  CollectionStateMetadataShape,
  CollectionStateShape,
  addMintsToCollectionState,
  asChainStateData,
  createGenesisStateData,
  extractCollectionState,
  toCollectionState,
  toStateUnit
};
