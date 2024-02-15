"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
var _aiken = require('./aiken');
const ROYALTY_TOKEN_LABEL = 500;
const ROYALTY_TOKEN_NAME = _lucidcardano.fromText.call(void 0, "Royalty");
const RoyaltyRecipientSchema = _lucidcardano.Data.Object({
  address: _aiken.ChainAddressSchema,
  variableFee: _lucidcardano.Data.Integer({ minimum: 1 }),
  minFee: _lucidcardano.Data.Nullable(_lucidcardano.Data.Integer()),
  maxFee: _lucidcardano.Data.Nullable(_lucidcardano.Data.Integer())
});
const RoyaltyRecipientShape = RoyaltyRecipientSchema;
const RoyaltyInfoSchema = _lucidcardano.Data.Object({
  metadata: _lucidcardano.Data.Array(RoyaltyRecipientSchema),
  version: _lucidcardano.Data.Integer({ minimum: 1, maximum: 1 }),
  extra: _lucidcardano.Data.Any()
});
const RoyaltyInfoShape = RoyaltyInfoSchema;
function toRoyaltyUnit(policyId) {
  return _lucidcardano.toUnit.call(void 0, policyId, ROYALTY_TOKEN_NAME, ROYALTY_TOKEN_LABEL);
}
function asChainVariableFee(percent) {
  if (percent < 0.1 || percent > 100) {
    throw new Error("Royalty fee must be between 0.1 and 100 percent");
  }
  return BigInt(Math.floor(1 / (percent / 1e3)));
}
function fromChainVariableFee(fee) {
  return Math.ceil(Number(10000n / fee)) / 10;
}
function asChainFixedFee(fee) {
  if (fee) {
    if (fee < 0 || !Number.isInteger(fee)) {
      throw new Error("Fixed fee must be an positive integer or 0");
    }
    return BigInt(fee);
  } else {
    return null;
  }
}
function toCip102RoyaltyDatum(royalties) {
  const metadata = royalties.map((royalty) => {
    const address = _aiken.asChainAddress.call(void 0, royalty.address);
    const variableFee = asChainVariableFee(royalty.variableFee);
    const minFee = asChainFixedFee(royalty.minFee);
    const maxFee = asChainFixedFee(royalty.maxFee);
    return {
      address,
      variableFee,
      minFee,
      maxFee
    };
  });
  const info = {
    metadata,
    version: BigInt(1),
    extra: ""
  };
  return _lucidcardano.Data.to(info, RoyaltyInfoShape);
}
function addCip102RoyaltyToTransaction(tx, policyId, address, royalties, redeemer) {
  const royaltyUnit = toRoyaltyUnit(policyId);
  const royaltyAsset = { [royaltyUnit]: 1n };
  const royaltyDatum = toCip102RoyaltyDatum(royalties);
  const royaltyOutputData = { inline: royaltyDatum };
  tx.mintAssets(royaltyAsset, redeemer).payToAddressWithData(address, royaltyOutputData, royaltyAsset);
}













exports.ROYALTY_TOKEN_LABEL = ROYALTY_TOKEN_LABEL; exports.ROYALTY_TOKEN_NAME = ROYALTY_TOKEN_NAME; exports.RoyaltyInfoSchema = RoyaltyInfoSchema; exports.RoyaltyInfoShape = RoyaltyInfoShape; exports.RoyaltyRecipientSchema = RoyaltyRecipientSchema; exports.RoyaltyRecipientShape = RoyaltyRecipientShape; exports.addCip102RoyaltyToTransaction = addCip102RoyaltyToTransaction; exports.asChainFixedFee = asChainFixedFee; exports.asChainVariableFee = asChainVariableFee; exports.fromChainVariableFee = fromChainVariableFee; exports.toCip102RoyaltyDatum = toCip102RoyaltyDatum; exports.toRoyaltyUnit = toRoyaltyUnit;
