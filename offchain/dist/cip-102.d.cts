import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data, Tx } from 'lucid-cardano';
import { Royalty } from './royalty.cjs';

declare const ROYALTY_TOKEN_LABEL = 500;
declare const ROYALTY_TOKEN_NAME: string;
declare const RoyaltyRecipientSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    address: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        paymentCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            VerificationKeyCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
        }> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            ScriptCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
        }>)[]>;
        stakeCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
            Inline: [{
                VerificationKeyCredential: [string];
            } | {
                ScriptCredential: [string];
            }];
        } | {
            Pointer: {
                slotNumber: bigint;
                transactionIndex: bigint;
                certificateIndex: bigint;
            };
        } | null>;
    }>;
    variableFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    minFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
    maxFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
}>;
type RoyaltyRecipientType = Data.Static<typeof RoyaltyRecipientSchema>;
declare const RoyaltyRecipientShape: {
    address: {
        paymentCredential: {
            VerificationKeyCredential: [string];
        } | {
            ScriptCredential: [string];
        };
        stakeCredential: {
            Inline: [{
                VerificationKeyCredential: [string];
            } | {
                ScriptCredential: [string];
            }];
        } | {
            Pointer: {
                slotNumber: bigint;
                transactionIndex: bigint;
                certificateIndex: bigint;
            };
        } | null;
    };
    variableFee: bigint;
    minFee: bigint | null;
    maxFee: bigint | null;
};
declare const RoyaltyInfoSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    metadata: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        address: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            paymentCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
                VerificationKeyCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
            }> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
                ScriptCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
            }>)[]>;
            stakeCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
                Inline: [{
                    VerificationKeyCredential: [string];
                } | {
                    ScriptCredential: [string];
                }];
            } | {
                Pointer: {
                    slotNumber: bigint;
                    transactionIndex: bigint;
                    certificateIndex: bigint;
                };
            } | null>;
        }>;
        variableFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
        minFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
        maxFee: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
    }>>;
    version: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Data>;
}>;
type RoyaltyInfoType = Data.Static<typeof RoyaltyInfoSchema>;
declare const RoyaltyInfoShape: {
    metadata: {
        address: {
            paymentCredential: {
                VerificationKeyCredential: [string];
            } | {
                ScriptCredential: [string];
            };
            stakeCredential: {
                Inline: [{
                    VerificationKeyCredential: [string];
                } | {
                    ScriptCredential: [string];
                }];
            } | {
                Pointer: {
                    slotNumber: bigint;
                    transactionIndex: bigint;
                    certificateIndex: bigint;
                };
            } | null;
        };
        variableFee: bigint;
        minFee: bigint | null;
        maxFee: bigint | null;
    }[];
    version: bigint;
    extra: Data;
};
declare function toRoyaltyUnit(policyId: string): string;
declare function asChainVariableFee(percent: number): bigint;
declare function fromChainVariableFee(fee: bigint): number;
declare function asChainFixedFee(fee?: number): bigint | null;
declare function toCip102RoyaltyDatum(royalties: Royalty[]): string;
declare function addCip102RoyaltyToTransaction(tx: Tx, policyId: string, address: string, royalties: Royalty[], redeemer?: string): void;

export { ROYALTY_TOKEN_LABEL, ROYALTY_TOKEN_NAME, RoyaltyInfoSchema, RoyaltyInfoShape, type RoyaltyInfoType, RoyaltyRecipientSchema, RoyaltyRecipientShape, type RoyaltyRecipientType, addCip102RoyaltyToTransaction, asChainFixedFee, asChainVariableFee, fromChainVariableFee, toCip102RoyaltyDatum, toRoyaltyUnit };
