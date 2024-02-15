import { Data, fromText, toUnit } from "lucid-cardano";
import { asChainAddress, ChainAddressSchema } from "./aiken";
const ROYALTY_TOKEN_LABEL = 500;
const ROYALTY_TOKEN_NAME = fromText("Royalty");
const RoyaltyRecipientSchema = Data.Object({
  address: ChainAddressSchema,
  variableFee: Data.Integer({ minimum: 1 }),
  minFee: Data.Nullable(Data.Integer()),
  maxFee: Data.Nullable(Data.Integer())
});
const RoyaltyRecipientShape = RoyaltyRecipientSchema;
const RoyaltyInfoSchema = Data.Object({
  metadata: Data.Array(RoyaltyRecipientSchema),
  version: Data.Integer({ minimum: 1, maximum: 1 }),
  extra: Data.Any()
});
const RoyaltyInfoShape = RoyaltyInfoSchema;
function toRoyaltyUnit(policyId) {
  return toUnit(policyId, ROYALTY_TOKEN_NAME, ROYALTY_TOKEN_LABEL);
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
    const address = asChainAddress(royalty.address);
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
  return Data.to(info, RoyaltyInfoShape);
}
function addCip102RoyaltyToTransaction(tx, policyId, address, royalties, redeemer) {
  const royaltyUnit = toRoyaltyUnit(policyId);
  const royaltyAsset = { [royaltyUnit]: 1n };
  const royaltyDatum = toCip102RoyaltyDatum(royalties);
  const royaltyOutputData = { inline: royaltyDatum };
  tx.mintAssets(royaltyAsset, redeemer).payToAddressWithData(address, royaltyOutputData, royaltyAsset);
}
export {
  ROYALTY_TOKEN_LABEL,
  ROYALTY_TOKEN_NAME,
  RoyaltyInfoSchema,
  RoyaltyInfoShape,
  RoyaltyRecipientSchema,
  RoyaltyRecipientShape,
  addCip102RoyaltyToTransaction,
  asChainFixedFee,
  asChainVariableFee,
  fromChainVariableFee,
  toCip102RoyaltyDatum,
  toRoyaltyUnit
};
