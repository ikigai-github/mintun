"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
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
const NftMetadataFileSchema = _lucidcardano.Data.Map(_lucidcardano.Data.Bytes(), _lucidcardano.Data.Any());
const NftMetadataFileShape = NftMetadataFileSchema;
const NftMetadataSchema = _lucidcardano.Data.Map(_lucidcardano.Data.Bytes(), _lucidcardano.Data.Any());
const NftMetadataShape = NftMetadataSchema;
const NftMetadataWrappedSchema = _lucidcardano.Data.Object({
  metadata: NftMetadataSchema,
  version: _lucidcardano.Data.Integer({ minimum: 1 }),
  extra: _lucidcardano.Data.Any()
});
const NftMetadataWrappedShape = NftMetadataWrappedSchema;











exports.NFT_TOKEN_LABEL = NFT_TOKEN_LABEL; exports.NftMetadataFileSchema = NftMetadataFileSchema; exports.NftMetadataFileShape = NftMetadataFileShape; exports.NftMetadataSchema = NftMetadataSchema; exports.NftMetadataShape = NftMetadataShape; exports.NftMetadataWrappedSchema = NftMetadataWrappedSchema; exports.NftMetadataWrappedShape = NftMetadataWrappedShape; exports.REFERENCE_DATA_VERSION = REFERENCE_DATA_VERSION; exports.REFERENCE_TOKEN_LABEL = REFERENCE_TOKEN_LABEL; exports.createReferenceData = createReferenceData;
