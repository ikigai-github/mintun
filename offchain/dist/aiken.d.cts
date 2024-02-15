import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data, Constr, Address, Lucid } from 'lucid-cardano';
import { TimeWindow } from './common.cjs';

declare const PolicyIdSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
declare const AssetNameSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
declare const OutputReferenceSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    transaction_id: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        hash: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
    }>;
    output_index: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
}>;
declare const PosixTimeIntervalSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    lower_bound: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        bound_type: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"NegativeInfinity"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            Finite: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>]>;
        }> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"PositiveInfinity">)[]>;
        is_inclusive: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
    }>;
    upper_bound: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        bound_type: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"NegativeInfinity"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            Finite: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>]>;
        }> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"PositiveInfinity">)[]>;
        is_inclusive: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
    }>;
}>;
type PosixTimeIntervalType = Data.Static<typeof PosixTimeIntervalSchema>;
declare const PosixTimeIntervalShape: {
    lower_bound: {
        bound_type: "NegativeInfinity" | "PositiveInfinity" | {
            Finite: [bigint];
        };
        is_inclusive: boolean;
    };
    upper_bound: {
        bound_type: "NegativeInfinity" | "PositiveInfinity" | {
            Finite: [bigint];
        };
        is_inclusive: boolean;
    };
};
declare const MetadataSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
type MetadataType = Data.Static<typeof MetadataSchema>;
declare const MetadataShape: Map<string, Data>;
declare const ChainCredentialSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    VerificationKeyCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
}> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    ScriptCredential: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TTuple<[lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>]>;
}>)[]>;
declare const ChainAddressSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
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
type ChainAddress = Data.Static<typeof ChainAddressSchema>;
declare const ChainAddress: {
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
declare const CHAIN_FALSE: Constr<never>;
declare const CHIAN_TRUE: Constr<never>;
declare function asChainTimeWindow(lowerMs: number, upperMs: number, inclusiveLowerBound?: boolean, inclusiveUpperBound?: boolean): PosixTimeIntervalType;
declare function toTimeWindow(interval: PosixTimeIntervalType): TimeWindow;
declare function asChainMap(data: Record<string, unknown>): Map<string, Data>;
declare function asChainBoolean(bool: boolean): Constr<never>;
declare function asChainAddress(address: Address): ChainAddress;
declare function toBech32Address(lucid: Lucid, address: ChainAddress): Address;

export { AssetNameSchema, CHAIN_FALSE, CHIAN_TRUE, ChainAddress, ChainAddressSchema, ChainCredentialSchema, MetadataSchema, MetadataShape, type MetadataType, OutputReferenceSchema, PolicyIdSchema, PosixTimeIntervalSchema, PosixTimeIntervalShape, type PosixTimeIntervalType, asChainAddress, asChainBoolean, asChainMap, asChainTimeWindow, toBech32Address, toTimeWindow };
