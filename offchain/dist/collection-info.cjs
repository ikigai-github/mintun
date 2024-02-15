"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _utils = require('./utils');
var _image = require('./image');
var _cip68 = require('./cip-68');
const CollectionImagePurposeSchema = _lucidcardano.Data.Enum([
  _lucidcardano.Data.Literal(_image.IMAGE_PURPOSE.Thumbnail),
  _lucidcardano.Data.Literal(_image.IMAGE_PURPOSE.Banner),
  _lucidcardano.Data.Literal(_image.IMAGE_PURPOSE.Avatar),
  _lucidcardano.Data.Literal(_image.IMAGE_PURPOSE.Gallery),
  _lucidcardano.Data.Literal(_image.IMAGE_PURPOSE.General)
]);
const CollectionImageDimensionsSchema = _lucidcardano.Data.Object({
  width: _lucidcardano.Data.Integer({ minimum: 1 }),
  height: _lucidcardano.Data.Integer({ minimum: 1 })
});
const CollectionImageSchema = _lucidcardano.Data.Object({
  purpose: CollectionImagePurposeSchema,
  dimension: CollectionImageDimensionsSchema,
  media_type: _lucidcardano.Data.Bytes(),
  src: _lucidcardano.Data.Array(_lucidcardano.Data.Bytes())
});
const CollectionImageShape = CollectionImageSchema;
const CollectionInfoSchema = _lucidcardano.Data.Object({
  name: _lucidcardano.Data.Bytes(),
  artist: _lucidcardano.Data.Nullable(_lucidcardano.Data.Bytes()),
  project: _lucidcardano.Data.Nullable(_lucidcardano.Data.Bytes()),
  nsfw: _lucidcardano.Data.Boolean(),
  description: _lucidcardano.Data.Array(_lucidcardano.Data.Bytes()),
  images: _lucidcardano.Data.Array(CollectionImageSchema),
  links: _lucidcardano.Data.Map(_lucidcardano.Data.Bytes(), _lucidcardano.Data.Array(_lucidcardano.Data.Bytes())),
  extra: _lucidcardano.Data.Map(_lucidcardano.Data.Bytes(), _lucidcardano.Data.Any())
});
const CollectionInfoShape = CollectionInfoSchema;
const CollectionInfoMetadataSchema = _lucidcardano.Data.Object({
  metadata: CollectionInfoSchema,
  version: _lucidcardano.Data.Integer({ minimum: 1 }),
  extra: _lucidcardano.Data.Any()
});
const CollectionInfoMetadataShape = CollectionInfoMetadataSchema;
function asChainCollectionImage(image) {
  const purpose = image.purpose;
  const dimension = { width: BigInt(image.dimension.width), height: BigInt(image.dimension.height) };
  const media_type = _lucidcardano.fromText.call(void 0, image.mediaType);
  const src = _utils.asChunkedHex.call(void 0, image.src);
  return {
    purpose,
    dimension,
    media_type,
    src
  };
}
function toCollectionImage(chainImage) {
  const purpose = chainImage.purpose;
  const dimension = { width: Number(chainImage.dimension.width), height: Number(chainImage.dimension.height) };
  const mediaType = _lucidcardano.toText.call(void 0, chainImage.media_type);
  const src = _utils.toJoinedText.call(void 0, chainImage.src);
  return {
    purpose,
    dimension,
    mediaType,
    src
  };
}
function asChainCollectionInfo(info) {
  const name = _lucidcardano.fromText.call(void 0, info.name);
  const artist = info.artist ? _lucidcardano.fromText.call(void 0, info.artist) : null;
  const project = info.project ? _lucidcardano.fromText.call(void 0, info.project) : null;
  const nsfw = info.nsfw ? true : false;
  const description = info.description ? _utils.asChunkedHex.call(void 0, info.description) : [];
  const images = info.images ? info.images.map(asChainCollectionImage) : [];
  const links = /* @__PURE__ */ new Map();
  if (info.links) {
    for (const [key, value] of Object.entries(info.links)) {
      links.set(_lucidcardano.fromText.call(void 0, key), _utils.asChunkedHex.call(void 0, value));
    }
  }
  const extra = /* @__PURE__ */ new Map();
  const metadata = {
    name,
    artist,
    project,
    nsfw,
    description,
    images,
    links,
    extra
  };
  return _cip68.createReferenceData.call(void 0, metadata);
}
function toCollectionInfo(chainInfo) {
  const { metadata } = chainInfo;
  const name = _lucidcardano.toText.call(void 0, metadata.name);
  const artist = metadata.artist ? _lucidcardano.toText.call(void 0, metadata.artist) : void 0;
  const project = metadata.project ? _lucidcardano.toText.call(void 0, metadata.project) : void 0;
  const nsfw = metadata.nsfw;
  const description = metadata.description.length ? _utils.toJoinedText.call(void 0, metadata.description) : void 0;
  const images = metadata.images.length ? metadata.images.map(toCollectionImage) : void 0;
  let links = void 0;
  if (metadata.links) {
    links = {};
    for (const [key, value] of metadata.links) {
      links[_lucidcardano.toText.call(void 0, key)] = _utils.toJoinedText.call(void 0, value);
    }
  }
  let extra = void 0;
  if (chainInfo.extra) {
    extra = {};
    for (const [key, value] of metadata.extra) {
      extra[_lucidcardano.toText.call(void 0, key)] = value;
    }
  }
  return {
    name,
    artist,
    project,
    nsfw,
    description,
    images,
    links,
    extra
  };
}
async function extractCollectionInfo(lucid, utxo) {
  const chainInfo = await lucid.datumOf(utxo, CollectionInfoMetadataShape);
  return toCollectionInfo(chainInfo);
}














exports.CollectionImageDimensionsSchema = CollectionImageDimensionsSchema; exports.CollectionImagePurposeSchema = CollectionImagePurposeSchema; exports.CollectionImageSchema = CollectionImageSchema; exports.CollectionImageShape = CollectionImageShape; exports.CollectionInfoMetadataSchema = CollectionInfoMetadataSchema; exports.CollectionInfoMetadataShape = CollectionInfoMetadataShape; exports.CollectionInfoSchema = CollectionInfoSchema; exports.CollectionInfoShape = CollectionInfoShape; exports.asChainCollectionImage = asChainCollectionImage; exports.asChainCollectionInfo = asChainCollectionInfo; exports.extractCollectionInfo = extractCollectionInfo; exports.toCollectionImage = toCollectionImage; exports.toCollectionInfo = toCollectionInfo;
