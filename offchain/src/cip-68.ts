// Schema for cip-68 reference token metadata
import { Data, fromText, toLabel } from 'lucid';
import { TSchema } from 'typebox';

export const REFERENCE_DATA_VERSION = 1n;
export const REFERENCE_TOKEN_LABEL = 100;
export const NFT_TOKEN_LABEL = 222;

// Uses the 100 reference token schema and adds in the supplied metadata that
// is specific to the user token (222, 333, 444)
export function createReferenceTokenSchema<T extends TSchema>(metadata: T) {
  return Data.Object({
    metadata,
    version: Data.Integer(),
    extra: Data.Any(),
  });
}

/// Creates reference data from given metadata. Any strings will be hex encoded unless they start with 0x
export function createReferenceData<T>(metadata: T) {
  return {
    metadata: metadata,
    version: REFERENCE_DATA_VERSION,
    extra: Data.void(),
  };
}

// Combines the policyId (already hex encoded), label number, and content (UTF8 string) to create a asset unit
export function makeUnit(policyId: string, label: number, content: string) {
  return `${policyId}${toLabel(label)}${fromText(content)}`;
}

// Combines policy id and content and applies the 222 (user/owner NFT) label to create an asset unit
export function makeNftUnit(policyId: string, content: string) {
  return makeUnit(policyId, 222, content);
}

// Combines policy id and content and applies the 100 (reference NFT) label to create an asset unit
export function makeReferenceUnit(policyId: string, content: string) {
  return makeUnit(policyId, 100, content);
}

const NftMetadataFileSchema = Data.Object({
  name: Data.Nullable(Data.Bytes()),
  mediaType: Data.Bytes(),
  src: Data.Bytes(),
});

export type NftMetadataFile = Data.Static<typeof NftMetadataFileSchema>;
export const NftMetadataFileShape = NftMetadataFileSchema as unknown as NftMetadataFile;

const NftMetadataSchema = Data.Object({
  name: Data.Bytes(),
  image: Data.Bytes(),
  description: Data.Nullable(Data.Any()), // Can be Data.Bytes() or Data.Array(Data.Bytes()) no way to express that
  files: Data.Nullable(Data.Array(NftMetadataFileSchema)),
  // Everything below here is not in the spec but common to genun (maybe still working out that part)
  extra: Data.Object({
    attributes: Data.Nullable(Data.Map(Data.Bytes(), Data.Any())), // Collection of unique properties associated with the NFT
    tags: Data.Nullable(Data.Array(Data.Bytes())), // Can be used group related NFTs (i.e. "upppercut", "ascent", "season-2")
    id: Data.Nullable(Data.Bytes()), // Unique id can be used as a link into offchain data about the NFT
    type: Data.Nullable(Data.Bytes()), // Can be used to classify NFT (i.e. Thruster, Ship Body, etc..)
  
  })
});

export type NftMetadata = Data.Static<typeof NftMetadataSchema>;
export const NftMetdataShape = NftMetadataSchema as unknown as NftMetadata;

// Todo: Actually use this for the mints.  Add custom bit to schema for traits/attributes of the NFT
export const NftSchema = createReferenceTokenSchema(NftMetadataSchema);
export type NftData = Data.Static<typeof NftSchema>;
export const NftShape = NftSchema as unknown as NftData;
