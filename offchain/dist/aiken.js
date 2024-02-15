import { Constr, Data, fromText, getAddressDetails } from "lucid-cardano";
const PolicyIdSchema = Data.Bytes({ minLength: 28, maxLength: 28 });
const AssetNameSchema = Data.Bytes({ minLength: 0, maxLength: 32 });
const OutputReferenceSchema = Data.Object({
  transaction_id: Data.Object({
    hash: Data.Bytes()
  }),
  output_index: Data.Integer()
});
const PosixTimeIntervalBoundTypeSchema = Data.Enum([
  Data.Literal("NegativeInfinity"),
  Data.Object({ "Finite": Data.Tuple([Data.Integer()]) }),
  Data.Literal("PositiveInfinity")
]);
const PosixTimeIntervalBoundSchema = Data.Object({
  bound_type: PosixTimeIntervalBoundTypeSchema,
  is_inclusive: Data.Boolean()
});
const PosixTimeIntervalSchema = Data.Object({
  lower_bound: PosixTimeIntervalBoundSchema,
  upper_bound: PosixTimeIntervalBoundSchema
});
const PosixTimeIntervalShape = PosixTimeIntervalSchema;
const MetadataSchema = Data.Map(Data.Bytes(), Data.Any());
const MetadataShape = MetadataSchema;
const ChainCredentialSchema = Data.Enum([
  Data.Object({
    VerificationKeyCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 })
    ])
  }),
  Data.Object({
    ScriptCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 })
    ])
  })
]);
const ChainAddressSchema = Data.Object({
  paymentCredential: ChainCredentialSchema,
  stakeCredential: Data.Nullable(Data.Enum([
    Data.Object({ Inline: Data.Tuple([ChainCredentialSchema]) }),
    Data.Object({
      Pointer: Data.Object({
        slotNumber: Data.Integer(),
        transactionIndex: Data.Integer(),
        certificateIndex: Data.Integer()
      })
    })
  ]))
});
const ChainAddress = ChainAddressSchema;
const CHAIN_FALSE = new Constr(0, []);
const CHIAN_TRUE = new Constr(1, []);
function asChainTimeWindow(lowerMs, upperMs, inclusiveLowerBound = true, inclusiveUpperBound = true) {
  if (Number.isInteger(lowerMs) && Number.isInteger(upperMs)) {
    const lower_bound = {
      bound_type: "NegativeInfinity",
      is_inclusive: inclusiveLowerBound
    };
    if (Number.isFinite(lowerMs)) {
      lower_bound.bound_type = { Finite: [BigInt(lowerMs)] };
    } else if (lowerMs !== -Infinity) {
      throw new Error(`${lowerMs} is an invalid lower bound`);
    }
    const upper_bound = {
      bound_type: "PositiveInfinity",
      is_inclusive: inclusiveUpperBound
    };
    if (Number.isFinite(upperMs)) {
      upper_bound.bound_type = { Finite: [BigInt(upperMs)] };
    } else if (upperMs !== Infinity) {
      throw new Error(`${upperMs} is an invalid upper bound`);
    }
    return {
      lower_bound,
      upper_bound
    };
  }
  throw new Error("POSIX time bounds must be integers representing milliseconds since epoch");
}
function toTimeWindow(interval) {
  const { lower_bound, upper_bound } = interval;
  let startMs = -Infinity;
  if (typeof lower_bound.bound_type == "object") {
    startMs = Number(lower_bound.bound_type.Finite);
  } else {
    throw new Error(`Invalid lower bound of type ${lower_bound.bound_type}`);
  }
  let endMs = Infinity;
  if (typeof upper_bound.bound_type == "object") {
    endMs = Number(upper_bound.bound_type.Finite);
  } else {
    throw new Error(`Invalid upper bound of type ${upper_bound.bound_type}`);
  }
  return { startMs, endMs };
}
function asChainMap(data) {
  const metadata = /* @__PURE__ */ new Map();
  for (const [key, value] of Object.entries(data)) {
    const encodedKey = fromText(key);
    const encodedValue = typeof value == "boolean" ? asChainBoolean(value) : Data.fromJson(value);
    metadata.set(encodedKey, encodedValue);
  }
  return metadata;
}
function asChainBoolean(bool) {
  const index = bool ? 1 : 0;
  return new Constr(index, []);
}
function asChainAddress(address) {
  const { paymentCredential, stakeCredential } = getAddressDetails(
    address
  );
  if (!paymentCredential)
    throw new Error("Not a valid payment address.");
  return {
    paymentCredential: paymentCredential?.type === "Key" ? {
      VerificationKeyCredential: [paymentCredential.hash]
    } : { ScriptCredential: [paymentCredential.hash] },
    stakeCredential: stakeCredential ? {
      Inline: [
        stakeCredential.type === "Key" ? {
          VerificationKeyCredential: [stakeCredential.hash]
        } : { ScriptCredential: [stakeCredential.hash] }
      ]
    } : null
  };
}
function toBech32Address(lucid, address) {
  const { utils } = lucid;
  const paymentCredential = (() => {
    if ("VerificationKeyCredential" in address.paymentCredential) {
      return utils.keyHashToCredential(
        address.paymentCredential.VerificationKeyCredential[0]
      );
    } else {
      return utils.scriptHashToCredential(
        address.paymentCredential.ScriptCredential[0]
      );
    }
  })();
  const stakeCredential = (() => {
    if (!address.stakeCredential)
      return void 0;
    if ("Inline" in address.stakeCredential) {
      if ("VerificationKeyCredential" in address.stakeCredential.Inline[0]) {
        return utils.keyHashToCredential(
          address.stakeCredential.Inline[0].VerificationKeyCredential[0]
        );
      } else {
        return utils.scriptHashToCredential(
          address.stakeCredential.Inline[0].ScriptCredential[0]
        );
      }
    } else {
      return void 0;
    }
  })();
  return utils.credentialToAddress(paymentCredential, stakeCredential);
}
export {
  AssetNameSchema,
  CHAIN_FALSE,
  CHIAN_TRUE,
  ChainAddress,
  ChainAddressSchema,
  ChainCredentialSchema,
  MetadataSchema,
  MetadataShape,
  OutputReferenceSchema,
  PolicyIdSchema,
  PosixTimeIntervalSchema,
  PosixTimeIntervalShape,
  asChainAddress,
  asChainBoolean,
  asChainMap,
  asChainTimeWindow,
  toBech32Address,
  toTimeWindow
};
