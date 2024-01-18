// Schema for cip-68 reference token metadata
import { Data } from 'lucid';
import { TSchema } from 'typebox';

export const REFERENCE_DATA_VERSION = 1n;
export const REFERENCE_TOKEN_LABEL = 100;
export const NFT_TOKEN_LABEL = 222;

// Uses the 100 reference token schema and adds in the supplied metadata that
// is specific to the user token (222, 333, 444)
export function createReferenceTokenSchema<T extends TSchema>(metadata: T) {
  return Data.Object({
    metadata,
    version: Data.Integer({ minimum: 1 }),
    extra: Data.Any(),
  });
}

/// Creates reference data from given metadata. Any strings will be hex encoded unless they start with 0x
export function createReferenceData<T>(metadata: T, extra: Data = '') {
  return {
    metadata: metadata,
    version: REFERENCE_DATA_VERSION,
    extra: extra,
  };
}

export type CollectionReferenceData<T> = ReturnType<typeof createReferenceData<T>>;

export const NftMetadataFileSchema = Data.Map(Data.Bytes(), Data.Any());
export type NftMetadataFileType = Data.Static<typeof NftMetadataFileSchema>;
export const NftMetadataFileShape = NftMetadataFileSchema as unknown as NftMetadataFileType;

export const NftMetadataSchema = Data.Map(Data.Bytes(), Data.Any());
export type NftMetadataType = Data.Static<typeof NftMetadataSchema>;
export const NftMetadataShape = NftMetadataSchema as unknown as NftMetadataType;

export const NftMetadataWrappedSchema = createReferenceTokenSchema(NftMetadataSchema);
export type NftMetadataWrappedType = Data.Static<typeof NftMetadataWrappedSchema>;
export const NftMetadataWrappedShape = NftMetadataWrappedSchema as unknown as NftMetadataWrappedType;

export const NftSchema = createReferenceTokenSchema(NftMetadataSchema);
export type NftDataType = Data.Static<typeof NftSchema>;
export const NftShape = NftSchema as unknown as NftDataType;
