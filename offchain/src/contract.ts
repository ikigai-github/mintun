import { applyParamsToScript, Data, Lucid } from 'lucid';
import { getScript } from './validators.ts';
import { OutputReferenceSchema } from './aiken.ts';
import { getScriptInfo } from './script.ts';

/// Minting policy paramaterization schema
const MintParameterSchema = Data.Tuple([OutputReferenceSchema]);
type MintParameterType = Data.Static<typeof MintParameterSchema>;
const MintParameterShape = MintParameterSchema as unknown as MintParameterType;

/// Validator paramaterization schema
const ValidatorParameterSchema = Data.Tuple([Data.Bytes({ minLength: 28, maxLength: 28 })]);
type ValidatorParameterType = Data.Static<typeof ValidatorParameterSchema>;
const ValidatorParameterShape = ValidatorParameterSchema as unknown as ValidatorParameterType;

/// Redeemer schema for minting
const MintRedeemerSchema = Data.Enum([
  Data.Object({
    'EndpointGenesis': Data.Object({ validator_policy_id: Data.Bytes({ minLength: 28, maxLength: 28 }) }),
  }),
  Data.Literal('EndpointMint'),
  Data.Literal('EndpointBurn'),
]);
export type MintRedeemerType = Data.Static<typeof MintRedeemerSchema>;
export const MintRedeemerShape = MintRedeemerSchema as unknown as MintRedeemerType;

const ValidatorRedeemerSchema = Data.Enum([
  Data.Literal('EndpointMint'),
  Data.Literal('EndpointBurn'),
]);
export type ValidatorRedeemerType = Data.Static<typeof ValidatorRedeemerSchema>;
export const ValidatorRedeemerShape = ValidatorRedeemerSchema as unknown as ValidatorRedeemerType;

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
    MintParameterShape,
  );
  return getScriptInfo(lucid, paramertizedMintingPolicy);
}

/// Given a minting policyparameterizes the management token spending validator and returns its info
export function paramaterizeValidator(lucid: Lucid, mintingPolicyId: string) {
  const script = getScript('collection_state_validator.spend');
  const paramertizedMintingPolicy = applyParamsToScript<ValidatorParameterType>(
    script.compiledCode,
    [mintingPolicyId],
    ValidatorParameterShape,
  );
  return getScriptInfo(lucid, paramertizedMintingPolicy);
}
