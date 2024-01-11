import { Data, fromText, Lucid, toLabel, toText, toUnit, UTxO } from 'lucid';
import {
  asChainAddress,
  asChainTimeWindow,
  ChainAddressSchema,
  PosixTimeIntervalSchema,
  toBech32Address,
  toTimeWindow,
} from './aiken.ts';
import { createReferenceData, createReferenceTokenSchema, NFT_TOKEN_LABEL, REFERENCE_TOKEN_LABEL } from './cip-68.ts';
import { TimeWindow } from './common.ts';
import { asChainCollectionInfo, CollectionInfo, CollectionInfoSchema, toCollectionInfo } from './collection-info.ts';

/// Speical collection owner token label.
/// Selected because it has similar pattern to other labels, there is no standard.
export const COLLECTION_TOKEN_LABEL = 111;

/// Well defined Cardano policy id length in bytes
export const POLICY_ID_BYTE_LENGTH = 28;

/// Number of bytes in asset name allocated for a sequence number
export const SEQUENCE_NUM_BYTES = 3;
export const SEQUENCE_MAX_VALUE = Math.pow(256, SEQUENCE_NUM_BYTES);

export const ASSET_NAME_MAX_BYTES = 32;
export const LABEL_NUM_BYTES = 4;
export const PURPOSE_NUM_BYTES = 1;
export const ASSET_NAME_PREFIX_BYTES = SEQUENCE_NUM_BYTES + LABEL_NUM_BYTES + PURPOSE_NUM_BYTES;
export const CONTENT_NAME_MAX_BYTES = ASSET_NAME_MAX_BYTES - ASSET_NAME_PREFIX_BYTES;

/// Currently there are two purposes for a token minted in a collection
/// Management - Management of collection state and minting
/// NFT - A regular minted NFT in the collection with a sequence number
export const COLLECTION_TOKEN_PURPOSE = {
  Management: 'Management',
  NFT: 'NFT',
} as const;

export type CollectionTokenPurpose = keyof typeof COLLECTION_TOKEN_PURPOSE;

/// On chain schema for the collection state data. For more details on the purpose of the
/// fields see smart contract library docs.
const CollectionStateSchema = Data.Object({
  name: Data.Bytes(),
  group: Data.Nullable(Data.Bytes({ minLength: POLICY_ID_BYTE_LENGTH, maxLength: POLICY_ID_BYTE_LENGTH })),
  mint_window: Data.Nullable(PosixTimeIntervalSchema),
  max_nfts: Data.Nullable(Data.Integer({ minimum: 1, maximum: SEQUENCE_MAX_VALUE })),
  force_locked: Data.Boolean(),
  current_nfts: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  next_sequence: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  reference_address: Data.Nullable(ChainAddressSchema),
  info: Data.Nullable(CollectionInfoSchema),
  extra: Data.Any(),
  // Considered adding an oracle uri but seems uncommon enough that can just go in extra if
});

export type CollectionStateType = Data.Static<typeof CollectionStateSchema>;
export const CollectionStateShape = CollectionStateSchema as unknown as CollectionStateType;

// Wrap state data in CIP-68 reference token schema
export const CollectionStateMetadataSchema = createReferenceTokenSchema(CollectionStateSchema);
export type CollectionStateMetadataType = Data.Static<typeof CollectionStateMetadataSchema>;
export const CollectionStateMetadataShape = CollectionStateMetadataSchema as unknown as CollectionStateMetadataType;

/// The collection state in offchain format.
export type CollectionState = {
  name: string;
  group?: string;
  mintWindow?: TimeWindow;
  maxNfts?: number;
  locked: boolean;
  currentNfts: number;
  nextSequence: number;
  nftReferenceTokenAddress?: string;
  info?: CollectionInfo;
  extra?: unknown;
};

/// Commonly paired reference and owner unit names
export type ManageUnitLookup = {
  reference: string;
  owner: string;
};

/// Commonly paired reference and owner utxos
export type ManageUtxoLookup = {
  reference: UTxO;
  owner: UTxO;
};

/// Convert the sequence number to its on chain hex string
export function toSequenceHex(sequence: number) {
  if (sequence < 0 || sequence > SEQUENCE_MAX_VALUE) {
    throw new Error('Sequence value out of valid range');
  }

  // Return a 3 byte hex string in range (0x000000, 0xFFFFFF)
  return sequence.toString(16).padStart(2 * SEQUENCE_NUM_BYTES, '0');
}

/// Convert the enumerated purpose type to its on chain hex value
export function toPurposeHex(purpose: CollectionTokenPurpose) {
  switch (purpose) {
    case COLLECTION_TOKEN_PURPOSE.Management:
      return '00';
    case COLLECTION_TOKEN_PURPOSE.NFT:
      return '01';
  }
}

/// Construct an asset name from label, sequence, and content name
function toNftAssetName(label: number, sequence: number, content: string) {
  if (content.length > CONTENT_NAME_MAX_BYTES) {
    content = content.substring(0, CONTENT_NAME_MAX_BYTES);
  }

  return `${toLabel(label)}${toPurposeHex(COLLECTION_TOKEN_PURPOSE.NFT)}${toSequenceHex(sequence)}${fromText(content)}`;
}

/// Construct a unit from the collection specific parts that compose the unit name
function toNftUnit(
  policyId: string,
  label: number,
  sequence: number,
  content: string,
) {
  return policyId + toNftAssetName(label, sequence, content);
}

/// Construct NFT asset name from label, sequence number, and content label string
export function toNftReferenceAssetName(sequence: number, content: string) {
  return toNftAssetName(REFERENCE_TOKEN_LABEL, sequence, content);
}

/// Construct NFT reference unit from the parts that compose the unit name
export function toNftReferenceUnit(
  policyId: string,
  sequence: number,
  content: string,
) {
  return toNftUnit(policyId, REFERENCE_TOKEN_LABEL, sequence, content);
}

/// Construct NFT asset name from label, sequence number, and content label string
export function toNftUserAssetName(sequence: number, content: string) {
  return toNftAssetName(NFT_TOKEN_LABEL, sequence, content);
}

/// Construct NFT user unit from the parts that compose the unit name
export function toNftUserUnit(
  policyId: string,
  sequence: number,
  content: string,
) {
  return toNftUnit(policyId, NFT_TOKEN_LABEL, sequence, content);
}

/// Construct management token unit from policy id and label
function toManageUnit(
  policyId: string,
  label: number,
) {
  const name = `${toPurposeHex(COLLECTION_TOKEN_PURPOSE.Management)}${fromText('Collection')}`;
  return toUnit(policyId, name, label);
}

/// Construct management reference unit from policy id with (100) label
export function toManageReferenceUnit(policyId: string) {
  return toManageUnit(policyId, REFERENCE_TOKEN_LABEL);
}

/// Construct management owner unit from policy id with (111) label
export function toManageOwnerUnit(policyId: string) {
  return toManageUnit(policyId, COLLECTION_TOKEN_LABEL);
}

// Decode CBOR datum of passed in UTxO and then convert the plutus data into offchain data
export async function extractCollectionState(lucid: Lucid, utxo: UTxO) {
  const chainState = await lucid.datumOf(utxo, CollectionStateMetadataShape);
  return toCollectionState(lucid, chainState);
}

/// Convert from on chain plutus data to off chain data structure
export function toCollectionState(lucid: Lucid, chainState: CollectionStateMetadataType): CollectionState {
  const { metadata } = chainState;
  const name = toText(metadata.name);
  const group = metadata.group ?? undefined;
  const mintWindow = metadata.mint_window ? toTimeWindow(metadata.mint_window) : undefined;
  const maxNfts = metadata.max_nfts ? Number(metadata.max_nfts) : undefined;
  const currentNfts = Number(metadata.current_nfts);
  const nextSequence = Number(metadata.next_sequence);
  const locked = metadata.force_locked;
  const info = metadata.info ? toCollectionInfo(metadata.info) : undefined;
  const nftReferenceTokenAddress = metadata.reference_address
    ? toBech32Address(lucid, metadata.reference_address)
    : undefined;
  const extra = Data.to(metadata.extra);
  return {
    name,
    group,
    mintWindow,
    maxNfts,
    locked,
    currentNfts,
    nextSequence,
    nftReferenceTokenAddress,
    info,
    extra,
  };
}

// Given the initial state creates the genesis data.
export function asChainState(state: CollectionState) {
  const name = fromText(state.name);
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const force_locked = state.locked;
  const current_nfts = BigInt(state.currentNfts);
  const next_sequence = BigInt(state.nextSequence);
  const reference_address = state.nftReferenceTokenAddress ? asChainAddress(state.nftReferenceTokenAddress) : null;
  const info = state.info ? asChainCollectionInfo(state.info) : null;
  const extra = '';

  const metadata: CollectionStateType = {
    name,
    group,
    mint_window,
    max_nfts,
    force_locked,
    current_nfts,
    next_sequence,
    reference_address,
    info,
    extra,
  };

  return createReferenceData(metadata);
}

/// Update state and validate the state constraints would not be violated
export function addMintsToCollectionState(state: CollectionState, numMints: number) {
  if (state.locked) {
    throw new Error('The state locked flag is set to true so it cannot be udpated with new mints');
  }

  const now = Date.now();
  if (state.mintWindow && (state.mintWindow.startMs > now || state.mintWindow.endMs < now)) {
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
