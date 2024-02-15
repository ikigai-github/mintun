import { fromText, toLabel, toUnit } from "lucid-cardano";
import { NFT_TOKEN_LABEL, REFERENCE_TOKEN_LABEL } from "./cip-68";
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
  return `${toLabel(label)}${toPurposeHex(COLLECTION_TOKEN_PURPOSE.NFT)}${toSequenceHex(sequence)}${fromText(content)}`;
}
function toNftUnit(policyId, label, sequence, content) {
  return policyId + toNftAssetName(label, sequence, content);
}
function toNftReferenceAssetName(sequence, content) {
  return toNftAssetName(REFERENCE_TOKEN_LABEL, sequence, content);
}
function toNftReferenceUnit(policyId, sequence, content) {
  return toNftUnit(policyId, REFERENCE_TOKEN_LABEL, sequence, content);
}
function toNftUserAssetName(sequence, content) {
  return toNftAssetName(NFT_TOKEN_LABEL, sequence, content);
}
function toNftUserUnit(policyId, sequence, content) {
  return toNftUnit(policyId, NFT_TOKEN_LABEL, sequence, content);
}
function toManageUnit(policyId, label) {
  const name = `${toPurposeHex(COLLECTION_TOKEN_PURPOSE.Management)}${fromText("Collection")}`;
  return toUnit(policyId, name, label);
}
function toInfoUnit(policyId) {
  return toManageUnit(policyId, REFERENCE_TOKEN_LABEL);
}
function toOwnerUnit(policyId) {
  return toManageUnit(policyId, COLLECTION_OWNER_TOKEN_LABEL);
}
export {
  ASSET_NAME_MAX_BYTES,
  ASSET_NAME_PREFIX_BYTES,
  COLLECTION_OWNER_TOKEN_LABEL,
  COLLECTION_TOKEN_PURPOSE,
  CONTENT_NAME_MAX_BYTES,
  LABEL_NUM_BYTES,
  PURPOSE_NUM_BYTES,
  SEQUENCE_MAX_VALUE,
  SEQUENCE_NUM_BYTES,
  toInfoUnit,
  toNftReferenceAssetName,
  toNftReferenceUnit,
  toNftUserAssetName,
  toNftUserUnit,
  toOwnerUnit,
  toPurposeHex,
  toSequenceHex
};
