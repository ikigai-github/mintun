import { applyParamsToScript, Data } from "lucid-cardano";
import { getScript, getScriptInfo } from "./script";
import { OutputReferenceSchema, PolicyIdSchema } from "./aiken";
const MintParameterSchema = Data.Tuple([OutputReferenceSchema]);
const MintParameterShape = MintParameterSchema;
const StateValidatorParameterSchema = Data.Tuple([PolicyIdSchema]);
const StateValidatorParameterShape = StateValidatorParameterSchema;
const MintRedeemerSchema = Data.Enum([
  Data.Object({
    "EndpointGenesis": Data.Object({
      state_validator_policy_id: PolicyIdSchema,
      info_validator_policy_id: PolicyIdSchema
    })
  }),
  Data.Literal("EndpointMint"),
  Data.Literal("EndpointBurn")
]);
const MintRedeemerShape = MintRedeemerSchema;
const StateValidatorRedeemerSchema = Data.Enum([
  Data.Literal("EndpointMint"),
  Data.Literal("EndpointBurn")
]);
const StateValidatorRedeemerShape = StateValidatorRedeemerSchema;
function paramaterizeMintingPolicy(lucid, hash, index) {
  const seed = {
    transaction_id: {
      hash
    },
    output_index: BigInt(index)
  };
  const script = getScript("batch_mint.mint");
  const paramertizedMintingPolicy = applyParamsToScript(
    script.compiledCode,
    [seed],
    MintParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeStateValidator(lucid, mintingPolicyId) {
  const script = getScript("state_validator.spend");
  const paramertizedMintingPolicy = applyParamsToScript(
    script.compiledCode,
    [mintingPolicyId],
    StateValidatorParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeImmutableInfoValidator(lucid, mintingPolicyId) {
  const script = getScript("immutable_info_validator.spend");
  const paramertizedMintingPolicy = applyParamsToScript(
    script.compiledCode,
    [mintingPolicyId]
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}
function paramaterizeImmutableNftValidator(lucid, mintingPolicyId) {
  const script = getScript("immutable_nft.spend");
  const paramertizedMintingPolicy = applyParamsToScript(
    script.compiledCode,
    [mintingPolicyId]
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}
export {
  MintRedeemerShape,
  StateValidatorRedeemerShape,
  paramaterizeImmutableInfoValidator,
  paramaterizeImmutableNftValidator,
  paramaterizeMintingPolicy,
  paramaterizeStateValidator
};
