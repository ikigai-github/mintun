"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _utils = require('./utils');
const CIP_27_METADATA_LABEL = 777;
function toCip27Metadata(percentage, address) {
  const rate = `${percentage / 100}`;
  const addr = address.length > 64 ? _utils.chunk.call(void 0, address) : address;
  return { rate, addr };
}
function addCip27RoyaltyToTransaction(tx, policyId, royalty, redeemer) {
  const { variableFee, address, minFee, maxFee } = royalty;
  if (maxFee !== void 0 || minFee !== void 0) {
    throw new Error("CIP-27 royalties do not support min/max fee");
  }
  const cip27Unit = policyId;
  const cip27Asset = { [cip27Unit]: 1n };
  const cip27Metadata = toCip27Metadata(variableFee, address);
  tx.attachMetadata(CIP_27_METADATA_LABEL, cip27Metadata).mintAssets(cip27Asset, redeemer);
}




exports.CIP_27_METADATA_LABEL = CIP_27_METADATA_LABEL; exports.addCip27RoyaltyToTransaction = addCip27RoyaltyToTransaction; exports.toCip27Metadata = toCip27Metadata;
