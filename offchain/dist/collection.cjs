"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _cip68 = require('./cip-68');
const COLLECTION_OWNER_TOKEN_LABEL = 111;
const SEQUENCE_NUM_BYTES = 3;
const SEQUENCE_MAX_VALUE = Math.pow(256, SEQUENCE_NUM_BYTES);
const ASSET_NAME_MAX_BYTES = 32;
const LABEL_NUM_BYTES = 4;
const PURPOSE_NUM_BYTES = 1;
const ASSET_NAME_PREFIX_BYTES = SEQUENCE_NUM_BYTES + LABEL_NUM_BYTES + PURPOSE_NUM_BYTES;
const CONTENT_NAME_MAX_BYTES = ASSET_NAME_MAX_BYTES - ASSET_NAME_PREFIX_BYTES;
const COLLECTION_TOKEN_PURPOSE = {
  Management: "Management",
  NFT: "NFT"
};
function toSequenceHex(sequence) {
  if (sequence < 0 || sequence > SEQUENCE_MAX_VALUE) {
    throw new Error("Sequence value out of valid range");
  }
  return sequence.toString(16).padStart(2 * SEQUENCE_NUM_BYTES, "0");
}
function toPurposeHex(purpose) {
  switch (purpose) {
    case COLLECTION_TOKEN_PURPOSE.Management:
      return "00";
    case COLLECTION_TOKEN_PURPOSE.NFT:
      return "01";
  }
}
function toNftAssetName(label, sequence, content) {
  if (content.length > CONTENT_NAME_MAX_BYTES) {
    content = content.substring(0, CONTENT_NAME_MAX_BYTES);
  }
  return `${_lucidcardano.toLabel.call(void 0, label)}${toPurposeHex(COLLECTION_TOKEN_PURPOSE.NFT)}${toSequenceHex(sequence)}${_lucidcardano.fromText.call(void 0, content)}`;
}
function toNftUnit(policyId, label, sequence, content) {
  return policyId + toNftAssetName(label, sequence, content);
}
function toNftReferenceAssetName(sequence, content) {
  return toNftAssetName(_cip68.REFERENCE_TOKEN_LABEL, sequence, content);
}
function toNftReferenceUnit(policyId, sequence, content) {
  return toNftUnit(policyId, _cip68.REFERENCE_TOKEN_LABEL, sequence, content);
}
function toNftUserAssetName(sequence, content) {
  return toNftAssetName(_cip68.NFT_TOKEN_LABEL, sequence, content);
}
function toNftUserUnit(policyId, sequence, content) {
  return toNftUnit(policyId, _cip68.NFT_TOKEN_LABEL, sequence, content);
}
function toManageUnit(policyId, label) {
  const name = `${toPurposeHex(COLLECTION_TOKEN_PURPOSE.Management)}${_lucidcardano.fromText.call(void 0, "Collection")}`;
  return _lucidcardano.toUnit.call(void 0, policyId, name, label);
}
function toInfoUnit(policyId) {
  return toManageUnit(policyId, _cip68.REFERENCE_TOKEN_LABEL);
}
function toOwnerUnit(policyId) {
  return toManageUnit(policyId, COLLECTION_OWNER_TOKEN_LABEL);
}


















exports.ASSET_NAME_MAX_BYTES = ASSET_NAME_MAX_BYTES; exports.ASSET_NAME_PREFIX_BYTES = ASSET_NAME_PREFIX_BYTES; exports.COLLECTION_OWNER_TOKEN_LABEL = COLLECTION_OWNER_TOKEN_LABEL; exports.COLLECTION_TOKEN_PURPOSE = COLLECTION_TOKEN_PURPOSE; exports.CONTENT_NAME_MAX_BYTES = CONTENT_NAME_MAX_BYTES; exports.LABEL_NUM_BYTES = LABEL_NUM_BYTES; exports.PURPOSE_NUM_BYTES = PURPOSE_NUM_BYTES; exports.SEQUENCE_MAX_VALUE = SEQUENCE_MAX_VALUE; exports.SEQUENCE_NUM_BYTES = SEQUENCE_NUM_BYTES; exports.toInfoUnit = toInfoUnit; exports.toNftReferenceAssetName = toNftReferenceAssetName; exports.toNftReferenceUnit = toNftReferenceUnit; exports.toNftUserAssetName = toNftUserAssetName; exports.toNftUserUnit = toNftUserUnit; exports.toOwnerUnit = toOwnerUnit; exports.toPurposeHex = toPurposeHex; exports.toSequenceHex = toSequenceHex;
