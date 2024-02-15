"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _cip68 = require('./cip-68');
var _collection = require('./collection');
var _image = require('./image');
var _utils = require('./utils');
class NftBuilder {
  #nft = {};
  constructor() {
  }
  static nft(name) {
    const builder = new NftBuilder();
    builder.#nft.name = name;
    return builder;
  }
  thumbnail(src, mediaType, dimension = void 0) {
    return this.image(src, mediaType, _image.IMAGE_PURPOSE.Thumbnail, dimension);
  }
  image(src, mediaType, purpose = void 0, dimension = void 0) {
    if (purpose === _image.IMAGE_PURPOSE.Thumbnail) {
      this.#nft.image = src;
      this.#nft.mediaType = mediaType;
    }
    const files = this.#nft.files || [];
    files.push({
      src,
      mediaType,
      purpose,
      dimension
    });
    this.#nft.files = files;
    return this;
  }
  id(id) {
    this.#nft.id = id;
    return this;
  }
  attribute(key, value) {
    const attributes = this.#nft.attributes || {};
    attributes[key] = value;
    return this.attributes(attributes);
  }
  attributes(attributes) {
    this.#nft.attributes = attributes;
    return this;
  }
  tag(tag) {
    const tags = this.#nft.tags || [];
    tags.push(tag);
    return this.tags(tags);
  }
  tags(tags) {
    this.#nft.tags = tags;
    return this;
  }
}
function asChainNftData(nft) {
  const desription = nft.description ? _utils.chunk.call(void 0, nft.description) : [];
  const files = nft.files ? nft.files.map((file) => ({ ...file, src: _utils.chunk.call(void 0, file.src) })) : [];
  const metadata = { ...nft, desription, files };
  return _lucidcardano.Data.castFrom(_lucidcardano.Data.fromJson(metadata), _cip68.NftMetadataShape);
}
function prepareAssets(nfts, policyId, sequence, defaultRecipientAddress, hasRoyalty, referenceAddress) {
  const mints = {};
  const userPayouts = {};
  const cip25Metadata = {};
  const referencePayouts = [];
  let extra = "";
  if (hasRoyalty) {
    extra = /* @__PURE__ */ new Map();
    extra.set(_lucidcardano.fromText.call(void 0, "royalty_included"), 1n);
  }
  for (const nft of nfts) {
    const { metadata, recipient } = nft;
    const userAssetName = _collection.toNftUserAssetName.call(void 0, sequence, metadata.name);
    const userUnit = policyId + userAssetName;
    const referenceAssetName = _collection.toNftReferenceAssetName.call(void 0, sequence, metadata.name);
    const referenceUnit = policyId + referenceAssetName;
    const chainMetadata = asChainNftData(metadata);
    const chainData = _cip68.createReferenceData.call(void 0, chainMetadata, extra);
    const recipientAdress = recipient ? recipient : defaultRecipientAddress;
    const referencePayoutAddress = referenceAddress ? referenceAddress : recipientAdress;
    const userPayout = userPayouts[recipientAdress] || [];
    userPayout.push(userUnit);
    referencePayouts.push({ unit: referenceUnit, address: referencePayoutAddress, chainData });
    cip25Metadata[userAssetName] = metadata;
    userPayouts[recipientAdress] = userPayout;
    mints[userUnit] = 1n;
    mints[referenceUnit] = 1n;
    sequence += 1;
  }
  return {
    mints,
    userPayouts,
    referencePayouts,
    cip25Metadata
  };
}



exports.NftBuilder = NftBuilder; exports.prepareAssets = prepareAssets;
