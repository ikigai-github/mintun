import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data, Lucid, UTxO } from 'lucid-cardano';
import { TimeWindow } from './common.cjs';

declare const CollectionStateSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    group: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
    mint_window: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
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
    } | null>;
    max_nfts: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
    force_locked: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
    current_nfts: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    next_sequence: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    reference_address: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
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
    } | null>;
}>;
declare const COLLECTION_STATE_TOKEN_LABEL = 600;
declare const COLLECTION_TOKEN_ASSET_NAME = "00258a50436f6c6c656374696f6e";
type CollectionStateType = Data.Static<typeof CollectionStateSchema>;
declare const CollectionStateShape: {
    group: string | null;
    mint_window: {
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
    } | null;
    max_nfts: bigint | null;
    force_locked: boolean;
    current_nfts: bigint;
    next_sequence: bigint;
    reference_address: {
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
    } | null;
};
declare const CollectionStateMetadataSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    metadata: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        group: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
        mint_window: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
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
        } | null>;
        max_nfts: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint | null>;
        force_locked: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
        current_nfts: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
        next_sequence: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
        reference_address: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<{
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
        } | null>;
    }>;
    version: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Data>;
}>;
type CollectionStateMetadataType = Data.Static<typeof CollectionStateMetadataSchema>;
declare const CollectionStateMetadataShape: {
    metadata: {
        group: string | null;
        mint_window: {
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
        } | null;
        max_nfts: bigint | null;
        force_locked: boolean;
        current_nfts: bigint;
        next_sequence: bigint;
        reference_address: {
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
        } | null;
    };
    version: bigint;
    extra: Data;
};
type CollectionState = {
    group?: string;
    mintWindow?: TimeWindow;
    maxNfts?: number;
    locked: boolean;
    currentNfts: number;
    nextSequence: number;
    nftValidatorAddress?: string;
};
declare function toStateUnit(policyId: string): string;
declare function extractCollectionState(lucid: Lucid, utxo: UTxO): Promise<CollectionState>;
declare function toCollectionState(lucid: Lucid, chainState: CollectionStateMetadataType): CollectionState;
declare function createGenesisStateData(state: Partial<CollectionState>): {
    metadata: {
        group: string | null;
        mint_window: {
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
        } | null;
        max_nfts: bigint | null;
        force_locked: boolean;
        current_nfts: bigint;
        next_sequence: bigint;
        reference_address: {
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
        } | null;
    };
    version: bigint;
    extra: Data;
};
declare function asChainStateData(state: CollectionState): {
    metadata: {
        group: string | null;
        mint_window: {
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
        } | null;
        max_nfts: bigint | null;
        force_locked: boolean;
        current_nfts: bigint;
        next_sequence: bigint;
        reference_address: {
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
        } | null;
    };
    version: bigint;
    extra: Data;
};
declare function addMintsToCollectionState(state: CollectionState, numMints: number): {
    currentNfts: number;
    nextSequence: number;
    group?: string | undefined;
    mintWindow?: TimeWindow | undefined;
    maxNfts?: number | undefined;
    locked: boolean;
    nftValidatorAddress?: string | undefined;
};

export { COLLECTION_STATE_TOKEN_LABEL, COLLECTION_TOKEN_ASSET_NAME, type CollectionState, CollectionStateMetadataSchema, CollectionStateMetadataShape, type CollectionStateMetadataType, CollectionStateShape, type CollectionStateType, addMintsToCollectionState, asChainStateData, createGenesisStateData, extractCollectionState, toCollectionState, toStateUnit };
