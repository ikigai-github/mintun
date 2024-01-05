import { Data, fromText, toUnit, UTxO } from 'lucid';
import { ChainAddressSchema, PosixTimeIntervalSchema } from './aiken.ts';
import { createReferenceTokenSchema, NFT_TOKEN_LABEL, REFERENCE_TOKEN_LABEL } from './cip-68.ts';
import { TimeWindow } from './common.ts';

/// Speical collection owner token label.
/// Selected because it has similar pattern to other labels, there is no standard.
export const COLLECTION_TOKEN_LABEL = 111;

/// Well defined Cardano policy id length in bytes
export const POLICY_ID_BYTE_LENGTH = 28;

/// Number of bytes in asset name allocated for a sequence number
export const SEQUENCE_NUM_BYTES = 3;
export const SEQUENCE_MAX_VALUE = Math.pow(256, SEQUENCE_NUM_BYTES);

/// Currently there are two purposes for a token minted in a collection
/// Management - Management of collection state and minting
/// NFT - A regular minted NFT in the collection with a sequence number
export const COLLECTION_TOKEN_PURPOSE = {
  Management: 'Management',
  NFT: 'NFT',
} as const;

export type CollectionTokenPurpose = keyof typeof COLLECTION_TOKEN_PURPOSE;

/// Image purpose are hints at how the creator inteded the image to be used
export const IMAGE_PURPOSE = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Avatar: 'Avatar',
  Gallery: 'Gallery',
  General: 'General',
} as const;

export type ImagePurpose = keyof typeof IMAGE_PURPOSE;

/// On chain data schema for image purpose
const CollectionImagePurposeSchema = Data.Enum([
  Data.Literal(IMAGE_PURPOSE.Thumbnail),
  Data.Literal(IMAGE_PURPOSE.Banner),
  Data.Literal(IMAGE_PURPOSE.Avatar),
  Data.Literal(IMAGE_PURPOSE.Gallery),
  Data.Literal(IMAGE_PURPOSE.General),
]);

/// On chain data schema for image dimensions
const CollectionImageDimensionsSchema = Data.Object({
  width: Data.Integer({ minimum: 1 }),
  height: Data.Integer({ minimum: 1 }),
});

// On chain data schema for a collection image with hints
const CollectionImageSchema = Data.Object({
  purpose: CollectionImagePurposeSchema,
  dimensions: CollectionImageDimensionsSchema,
  media_type: Data.Bytes(),
  src: Data.Array(Data.Bytes()),
});

/// On chain schema for the collection market information.
/// TBD: May be better left as a Map<string, Data>
const CollectionInfoSchema = Data.Object({
  artist: Data.Nullable(Data.Bytes()),
  project: Data.Nullable(Data.Bytes()),
  nsfw: Data.Nullable(Data.Boolean()),
  description: Data.Nullable(Data.Array(Data.Bytes())),
  images: Data.Nullable(Data.Array(CollectionImageSchema)),
  attributes: Data.Nullable(Data.Array(Data.Bytes())),
  tags: Data.Nullable(Data.Array(Data.Bytes())),
  website: Data.Nullable(Data.Array(Data.Bytes())),
  social: Data.Map(Data.Bytes(), Data.Array(Data.Bytes())),
  extra: Data.Any(),
});

export type CollectionInfoType = Data.Static<typeof CollectionInfoSchema>;
export const CollectionInfoShape = CollectionInfoSchema as unknown as CollectionInfoType;

/// On chain schema for the collection state data. For more details on the purpose of the
/// fields see smart contract library docs.
/// Note: Currently undecided on if info should be well defined or just a Map<string, Data>
const CollectionStateSchema = Data.Object({
  name: Data.Bytes(),
  group: Data.Nullable(Data.Bytes({ minLength: POLICY_ID_BYTE_LENGTH, maxLength: POLICY_ID_BYTE_LENGTH })),
  mint_window: Data.Nullable(PosixTimeIntervalSchema),
  max_nfts: Data.Nullable(Data.Integer({ minimum: 1, maximum: SEQUENCE_MAX_VALUE })),
  force_locked: Data.Boolean(),
  current_nfts: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  next_sequence: Data.Integer({ minimum: 0, maximum: SEQUENCE_MAX_VALUE }),
  reference_address: Data.Nullable(ChainAddressSchema),
  info: Data.Nullable(Data.Map(Data.Bytes(), Data.Any())),
  extra: Data.Any(),
});

export type CollectionStateType = Data.Static<typeof CollectionStateSchema>;
export const CollectionStateShape = CollectionStateSchema as unknown as CollectionStateType;

// Wrap state data in CIP-68 reference token schema
export const CollectionStateMetadataSchema = createReferenceTokenSchema(CollectionStateSchema);
export type CollectionStateMetadataType = Data.Static<typeof CollectionStateMetadataSchema>;
export const CollectionStateMetadataShape = CollectionStateMetadataSchema as unknown as CollectionStateMetadataType;

/// Width height of an image in pixels
export type ImageDimensionsType = {
  width: number;
  height: number;
};

/// An image with hints for its format, purpose, and dimensions
export type CollectionImage = {
  purpose: ImagePurpose;
  dimensions: ImageDimensionsType;
  mediaType: string;
  src: string;
};

/// The collection information in offchain format.
export type CollectionInfo = {
  artist?: string;
  nsfw?: boolean;
  project?: string;
  description?: string;
  images?: CollectionImage[];
  attributes?: string[];
  tags?: string[];
  website?: string;
  social?: Record<string, string>;
  extra?: unknown;
};

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

/// Construct a unit from the collection specific parts that compose the unit name
function toNftUnit(
  policyId: string,
  label: number,
  sequence: number,
  content: string,
) {
  const name = `${toPurposeHex(COLLECTION_TOKEN_PURPOSE.NFT)}${toSequenceHex(sequence)}${fromText(content)}`;
  return toUnit(policyId, name, label);
}

/// Construct NFT reference unit from the parts that compose the unit name
export function toNftReferenceUnit(
  policyId: string,
  sequence: number,
  content: string,
) {
  return toNftUnit(policyId, REFERENCE_TOKEN_LABEL, sequence, content);
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
