"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _lucidcardano = require('lucid-cardano');
const PolicyIdSchema = _lucidcardano.Data.Bytes({ minLength: 28, maxLength: 28 });
const AssetNameSchema = _lucidcardano.Data.Bytes({ minLength: 0, maxLength: 32 });
const OutputReferenceSchema = _lucidcardano.Data.Object({
  transaction_id: _lucidcardano.Data.Object({
    hash: _lucidcardano.Data.Bytes()
  }),
  output_index: _lucidcardano.Data.Integer()
});
const PosixTimeIntervalBoundTypeSchema = _lucidcardano.Data.Enum([
  _lucidcardano.Data.Literal("NegativeInfinity"),
  _lucidcardano.Data.Object({ "Finite": _lucidcardano.Data.Tuple([_lucidcardano.Data.Integer()]) }),
  _lucidcardano.Data.Literal("PositiveInfinity")
]);
const PosixTimeIntervalBoundSchema = _lucidcardano.Data.Object({
  bound_type: PosixTimeIntervalBoundTypeSchema,
  is_inclusive: _lucidcardano.Data.Boolean()
});
const PosixTimeIntervalSchema = _lucidcardano.Data.Object({
  lower_bound: PosixTimeIntervalBoundSchema,
  upper_bound: PosixTimeIntervalBoundSchema
});
const PosixTimeIntervalShape = PosixTimeIntervalSchema;
const MetadataSchema = _lucidcardano.Data.Map(_lucidcardano.Data.Bytes(), _lucidcardano.Data.Any());
const MetadataShape = MetadataSchema;
const ChainCredentialSchema = _lucidcardano.Data.Enum([
  _lucidcardano.Data.Object({
    VerificationKeyCredential: _lucidcardano.Data.Tuple([
      _lucidcardano.Data.Bytes({ minLength: 28, maxLength: 28 })
    ])
  }),
  _lucidcardano.Data.Object({
    ScriptCredential: _lucidcardano.Data.Tuple([
      _lucidcardano.Data.Bytes({ minLength: 28, maxLength: 28 })
    ])
  })
]);
const ChainAddressSchema = _lucidcardano.Data.Object({
  paymentCredential: ChainCredentialSchema,
  stakeCredential: _lucidcardano.Data.Nullable(_lucidcardano.Data.Enum([
    _lucidcardano.Data.Object({ Inline: _lucidcardano.Data.Tuple([ChainCredentialSchema]) }),
    _lucidcardano.Data.Object({
      Pointer: _lucidcardano.Data.Object({
        slotNumber: _lucidcardano.Data.Integer(),
        transactionIndex: _lucidcardano.Data.Integer(),
        certificateIndex: _lucidcardano.Data.Integer()
      })
    })
  ]))
});
const ChainAddress = ChainAddressSchema;
const CHAIN_FALSE = new (0, _lucidcardano.Constr)(0, []);
const CHIAN_TRUE = new (0, _lucidcardano.Constr)(1, []);
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
    const encodedKey = _lucidcardano.fromText.call(void 0, key);
    const encodedValue = typeof value == "boolean" ? asChainBoolean(value) : _lucidcardano.Data.fromJson(value);
    metadata.set(encodedKey, encodedValue);
  }
  return metadata;
}
function asChainBoolean(bool) {
  const index = bool ? 1 : 0;
  return new (0, _lucidcardano.Constr)(index, []);
}
function asChainAddress(address) {
  const { paymentCredential, stakeCredential } = _lucidcardano.getAddressDetails.call(void 0, 
    address
  );
  if (!paymentCredential)
    throw new Error("Not a valid payment address.");
  return {
    paymentCredential: _optionalChain([paymentCredential, 'optionalAccess', _ => _.type]) === "Key" ? {
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



















exports.AssetNameSchema = AssetNameSchema; exports.CHAIN_FALSE = CHAIN_FALSE; exports.CHIAN_TRUE = CHIAN_TRUE; exports.ChainAddress = ChainAddress; exports.ChainAddressSchema = ChainAddressSchema; exports.ChainCredentialSchema = ChainCredentialSchema; exports.MetadataSchema = MetadataSchema; exports.MetadataShape = MetadataShape; exports.OutputReferenceSchema = OutputReferenceSchema; exports.PolicyIdSchema = PolicyIdSchema; exports.PosixTimeIntervalSchema = PosixTimeIntervalSchema; exports.PosixTimeIntervalShape = PosixTimeIntervalShape; exports.asChainAddress = asChainAddress; exports.asChainBoolean = asChainBoolean; exports.asChainMap = asChainMap; exports.asChainTimeWindow = asChainTimeWindow; exports.toBech32Address = toBech32Address; exports.toTimeWindow = toTimeWindow;
