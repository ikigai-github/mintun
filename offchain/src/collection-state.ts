/// On chain schema for the collection state data. For more details on the purpose of the

import type { Lucid, UTxO } from 'lucid-cardano';

import {
  asChainAddress,
  asChainTimeWindow,
  ChainAddressSchema,
  PosixTimeIntervalSchema,
  toBech32Address,
  toTimeWindow,
} from './aiken';
import { createReferenceData } from './cip-68';
import { SEQUENCE_MAX_VALUE } from './collection';
import { POLICY_ID_BYTE_LENGTH, TimeWindow } from './common';
import { Data } from './data';

/// fields see smart contract library docs.
const CollectionStateSchema = Data.Object({
  group: Data.Nullable(Data.Bytes({ minLength: POLICY_ID_BYTE_LENGTH, maxLength: POLICY_ID_BYTE_LENGTH })),
  mint_window: Data.Nullable(PosixTimeIntervalSchema),
  max_nfts: Data.Nullable(Data.Integer({ minimum: 1, maximum: SEQUENCE_MAX_VALUE })),
  force_locked: Data.Boolean(),
  current_nfts: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  next_sequence: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  reference_address: Data.Nullable(ChainAddressSchema),
});

export const COLLECTION_STATE_TOKEN_LABEL = 600;
export const COLLECTION_TOKEN_ASSET_NAME = '00258a50436f6c6c656374696f6e';

export type CollectionStateType = Data.Static<typeof CollectionStateSchema>;
export const CollectionStateShape = CollectionStateSchema as unknown as CollectionStateType;

// Wrap state data in CIP-68 reference token schema
export const CollectionStateMetadataSchema = Data.Object({
  metadata: CollectionStateSchema,
  version: Data.Integer({ minimum: 1 }),
  extra: Data.Any(),
});

export type CollectionStateMetadataType = Data.Static<typeof CollectionStateMetadataSchema>;
export const CollectionStateMetadataShape = CollectionStateMetadataSchema as unknown as CollectionStateMetadataType;

/// The collection state in offchain format.
export type CollectionState = {
  group?: string;
  mintWindow?: TimeWindow;
  maxNfts?: number;
  locked: boolean;
  currentNfts: number;
  nextSequence: number;
  nftValidatorAddress?: string;
};

export function toStateUnit(policyId: string) {
  return policyId + COLLECTION_TOKEN_ASSET_NAME;
}

// Decode CBOR datum of passed in UTxO and then convert the plutus data into offchain data
export async function extractCollectionState(lucid: Lucid, utxo: UTxO) {
  const chainState = await lucid.datumOf(utxo, CollectionStateMetadataShape);
  return toCollectionState(lucid, chainState);
}

/// Convert from on chain plutus data to off chain data structure
export function toCollectionState(lucid: Lucid, chainState: CollectionStateMetadataType): CollectionState {
  const { metadata } = chainState;
  const group = metadata.group ?? undefined;
  const mintWindow = metadata.mint_window ? toTimeWindow(metadata.mint_window) : undefined;
  const maxNfts = metadata.max_nfts ? Number(metadata.max_nfts) : undefined;
  const currentNfts = Number(metadata.current_nfts);
  const nextSequence = Number(metadata.next_sequence);
  const locked = metadata.force_locked;
  const nftValidatorAddress = metadata.reference_address
    ? toBech32Address(lucid, metadata.reference_address)
    : undefined;
  return {
    group,
    mintWindow,
    maxNfts,
    locked,
    currentNfts,
    nextSequence,
    nftValidatorAddress,
  };
}

// Given the initial state creates the genesis data.
export function createGenesisStateData(state: Partial<CollectionState>) {
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.fromMs, state.mintWindow.toMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const reference_address = state.nftValidatorAddress ? asChainAddress(state.nftValidatorAddress) : null;

  const metadata: CollectionStateType = {
    group,
    mint_window,
    max_nfts,
    force_locked: false,
    current_nfts: 0n,
    next_sequence: 0n,
    reference_address,
  };

  return createReferenceData(metadata);
}

// Given the initial state creates the genesis data.
export function asChainStateData(state: CollectionState) {
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.fromMs, state.mintWindow.toMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const force_locked = state.locked;
  const current_nfts = BigInt(state.currentNfts);
  const next_sequence = BigInt(state.nextSequence);
  const reference_address = state.nftValidatorAddress ? asChainAddress(state.nftValidatorAddress) : null;

  const metadata: CollectionStateType = {
    group,
    mint_window,
    max_nfts,
    force_locked,
    current_nfts,
    next_sequence,
    reference_address,
  };

  return createReferenceData(metadata);
}

/// Update state and validate the state constraints would not be violated
export function addMintsToCollectionState(state: CollectionState, numMints: number) {
  if (state.locked) {
    throw new Error('The state locked flag is set to true so it cannot be udpated with new mints');
  }

  const now = Date.now();
  if (state.mintWindow && (state.mintWindow.fromMs > now || state.mintWindow.toMs < now)) {
    throw new Error('The valid mint window for this minting policy has passed. Cannot mint new NFTs.');
  }

  const nextState = {
    ...state,
    currentNfts: state.currentNfts + numMints,
    nextSequence: state.nextSequence + numMints,
  };

  if (state.maxNfts && nextState.currentNfts > state.maxNfts) {
    throw new Error('The number of NFTs being minted would exceed the maximum allowed NFTs for this minting policy');
  }

  return nextState;
}
