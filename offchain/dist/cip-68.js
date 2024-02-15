import { Data } from "lucid-cardano";
const REFERENCE_DATA_VERSION = 1n;
const REFERENCE_TOKEN_LABEL = 100;
const NFT_TOKEN_LABEL = 222;
function createReferenceData(metadata, extra = "") {
  return {
    metadata,
    version: REFERENCE_DATA_VERSION,
    extra
  };
}
const NftMetadataFileSchema = Data.Map(Data.Bytes(), Data.Any());
const NftMetadataFileShape = NftMetadataFileSchema;
const NftMetadataSchema = Data.Map(Data.Bytes(), Data.Any());
const NftMetadataShape = NftMetadataSchema;
const NftMetadataWrappedSchema = Data.Object({
  metadata: NftMetadataSchema,
  version: Data.Integer({ minimum: 1 }),
  extra: Data.Any()
});
const NftMetadataWrappedShape = NftMetadataWrappedSchema;
export {
  NFT_TOKEN_LABEL,
  NftMetadataFileSchema,
  NftMetadataFileShape,
  NftMetadataSchema,
  NftMetadataShape,
  NftMetadataWrappedSchema,
  NftMetadataWrappedShape,
  REFERENCE_DATA_VERSION,
  REFERENCE_TOKEN_LABEL,
  createReferenceData
};
