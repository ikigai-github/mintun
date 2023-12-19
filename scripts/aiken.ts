// Schema for aiken stdlib types added here as needed.
import { Address, Data, Lucid, getAddressDetails } from "https://deno.land/x/lucid@0.10.7/mod.ts";

export const PolicyIdSchema = Data.Bytes({ minLength: 28, maxLength: 28 });
export const AssetNameSchema = Data.Bytes({ minLength: 0, maxLength: 32 });

export const OutputReferenceSchema = Data.Object({
  transaction_id: Data.Object({
    hash: Data.Bytes()
  }),
  output_index: Data.Integer()
});

const PosixTimeIntervalBoundTypeSchema = Data.Enum([
  Data.Literal('NegativeInfinity'), 
  Data.Object({ 'Finite': Data.Tuple([Data.Integer()]) }), 
  Data.Literal('PositiveInfinity')
]);

const PosixTimeIntervalBoundSchema = Data.Object({
  bound_type: PosixTimeIntervalBoundTypeSchema,
  is_inclusive: Data.Boolean()
})

export const PosixTimeIntervalSchema = Data.Object({
  lower_bound: PosixTimeIntervalBoundSchema,
  uppper_bound: PosixTimeIntervalBoundSchema
});


// The following section was taken from https://github.com/spacebudz/nebula/blob/main/common/utils.ts
// 
export const CredentialSchema = Data.Enum([
  Data.Object({
    VerificationKeyCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
  Data.Object({
    ScriptCredential: Data.Tuple([
      Data.Bytes({ minLength: 28, maxLength: 28 }),
    ]),
  }),
]);

export const ChainAddressSchema = Data.Object({
  paymentCredential: CredentialSchema,
  stakeCredential: Data.Nullable(Data.Enum([
    Data.Object({ Inline: Data.Tuple([CredentialSchema]) }),
    Data.Object({
      Pointer: Data.Object({
        slotNumber: Data.Integer(),
        transactionIndex: Data.Integer(),
        certificateIndex: Data.Integer(),
      }),
    }),
  ])),
});

export type ChainAddress = Data.Static<typeof ChainAddressSchema>;
export const ChainAddress = ChainAddressSchema as unknown as ChainAddress;

export function asChainAddress(address: Address): ChainAddress {
  const { paymentCredential, stakeCredential } = getAddressDetails(
    address,
  );

  if (!paymentCredential) throw new Error("Not a valid payment address.");

  return {
    paymentCredential: paymentCredential?.type === "Key"
      ? {
        VerificationKeyCredential: [paymentCredential.hash],
      }
      : { ScriptCredential: [paymentCredential.hash] },
    stakeCredential: stakeCredential
      ? {
        Inline: [
          stakeCredential.type === "Key"
            ? {
              VerificationKeyCredential: [stakeCredential.hash],
            }
            : { ScriptCredential: [stakeCredential.hash] },
        ],
      }
      : null,
  };
}

export function toBech32Address(address: ChainAddress, lucid: Lucid): Address {
  const paymentCredential = (() => {
    if ("VerificationKeyCredential" in address.paymentCredential) {
      return lucid.utils.keyHashToCredential(
        address.paymentCredential.VerificationKeyCredential[0],
      );
    } else {
      return lucid.utils.scriptHashToCredential(
        address.paymentCredential.ScriptCredential[0],
      );
    }
  })();
  const stakeCredential = (() => {
    if (!address.stakeCredential) return undefined;
    if ("Inline" in address.stakeCredential) {
      if ("VerificationKeyCredential" in address.stakeCredential.Inline[0]) {
        return lucid.utils.keyHashToCredential(
          address.stakeCredential.Inline[0].VerificationKeyCredential[0],
        );
      } else {
        return lucid.utils.scriptHashToCredential(
          address.stakeCredential.Inline[0].ScriptCredential[0],
        );
      }
    } else {
      return undefined;
    }
  })();
  return lucid.utils.credentialToAddress(paymentCredential, stakeCredential);
}

