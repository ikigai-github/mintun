import { applyParamsToScript, type Lucid } from 'lucid-cardano';

import { OutputReferenceSchema, PolicyIdSchema } from './aiken';
import { Data } from './data';
import { getScript, getScriptInfo } from './script';

/// Minting policy paramaterization schema
const MintParameterSchema = Data.Tuple([OutputReferenceSchema]);
type MintParameterType = Data.Static<typeof MintParameterSchema>;
const MintParameterShape = MintParameterSchema as unknown as MintParameterType;

/// Validator paramaterization schema
const StateValidatorParameterSchema = Data.Tuple([PolicyIdSchema]);
type StateValidatorParameterType = Data.Static<typeof StateValidatorParameterSchema>;
const StateValidatorParameterShape = StateValidatorParameterSchema as unknown as StateValidatorParameterType;

/// Redeemer schema for minting
const MintRedeemerSchema = Data.Enum([
  Data.Object({
    EndpointGenesis: Data.Object({
      state_validator_policy_id: PolicyIdSchema,
      info_validator_policy_id: PolicyIdSchema,
    }),
  }),
  Data.Literal('EndpointMint'),
  Data.Literal('EndpointBurn'),
]);
export type MintRedeemerType = Data.Static<typeof MintRedeemerSchema>;
export const MintRedeemerShape = MintRedeemerSchema as unknown as MintRedeemerType;

const StateValidatorRedeemerSchema = Data.Enum([Data.Literal('EndpointMint'), Data.Literal('EndpointBurn')]);
export type StateValidatorRedeemerType = Data.Static<typeof StateValidatorRedeemerSchema>;
export const StateValidatorRedeemerShape = StateValidatorRedeemerSchema as unknown as StateValidatorRedeemerType;

/// Given a unique hash and index from the seed transaction parameterizes the minting policy and returns its info
export function paramaterizeMintingPolicy(lucid: Lucid, hash: string, index: number) {
  const seed = {
    transaction_id: {
      hash,
    },
    output_index: BigInt(index),
  };

  const script = getScript('batch_mint.mint');
  const paramertizedMintingPolicy = applyParamsToScript<MintParameterType>(
    script.compiledCode,
    [seed],
    MintParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}

/// Given a minting policy, parameterizes the management token spending validator and returns its info
export function paramaterizeStateValidator(lucid: Lucid, mintingPolicyId: string) {
  const script = getScript('state_validator.spend');
  const paramertizedMintingPolicy = applyParamsToScript<StateValidatorParameterType>(
    script.compiledCode,
    [mintingPolicyId],
    StateValidatorParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}

/// Given a minting policy, parameterizes the collection info reference token spending validator and returns its info
export function paramaterizeImmutableInfoValidator(lucid: Lucid, mintingPolicyId: string) {
  const script = getScript('immutable_info_validator.spend');
  const paramertizedMintingPolicy = applyParamsToScript<StateValidatorParameterType>(script.compiledCode, [
    mintingPolicyId,
  ]);
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}

/// Given a minting policy, parameterizes the nft reference token spending validator and returns its info
export function paramaterizeImmutableNftValidator(lucid: Lucid, mintingPolicyId: string) {
  const script = getScript('immutable_nft.spend');
  const paramertizedMintingPolicy = applyParamsToScript<StateValidatorParameterType>(script.compiledCode, [
    mintingPolicyId,
  ]);
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}
