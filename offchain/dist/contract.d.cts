import { ScriptInfo } from './script.cjs';
import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data, Lucid } from 'lucid-cardano';
import './utils.cjs';

declare const MintRedeemerSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    EndpointGenesis: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        state_validator_policy_id: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
        info_validator_policy_id: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
    }>;
}> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"EndpointMint"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"EndpointBurn">)[]>;
type MintRedeemerType = Data.Static<typeof MintRedeemerSchema>;
declare const MintRedeemerShape: "EndpointMint" | "EndpointBurn" | {
    EndpointGenesis: {
        state_validator_policy_id: string;
        info_validator_policy_id: string;
    };
};
declare const StateValidatorRedeemerSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"EndpointMint"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"EndpointBurn">)[]>;
type StateValidatorRedeemerType = Data.Static<typeof StateValidatorRedeemerSchema>;
declare const StateValidatorRedeemerShape: "EndpointMint" | "EndpointBurn";
declare function paramaterizeMintingPolicy(lucid: Lucid, hash: string, index: number): ScriptInfo;
declare function paramaterizeStateValidator(lucid: Lucid, mintingPolicyId: string): ScriptInfo;
declare function paramaterizeImmutableInfoValidator(lucid: Lucid, mintingPolicyId: string): ScriptInfo;
declare function paramaterizeImmutableNftValidator(lucid: Lucid, mintingPolicyId: string): ScriptInfo;

export { MintRedeemerShape, type MintRedeemerType, StateValidatorRedeemerShape, type StateValidatorRedeemerType, paramaterizeImmutableInfoValidator, paramaterizeImmutableNftValidator, paramaterizeMintingPolicy, paramaterizeStateValidator };
