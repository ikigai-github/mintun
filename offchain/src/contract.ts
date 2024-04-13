import {
  Address,
  applyParamsToScript,
  fromText,
  getAddressDetails,
  MintingPolicy,
  PolicyId,
  Script,
  toLabel,
  type Lucid,
} from 'lucid-cardano';

import { OutputReferenceSchema, PolicyIdSchema } from './aiken';
import { Data } from './data';
import { fetchUtxo, getScript, getScriptInfo } from './script';

export const ScriptName = {
  MintingPolicy: 'mint.mint',
  MintingStateValidator: 'state.spend',
  ImmutableInfoValidator: 'immutable_info.spend',
  ImmutableNftValidator: 'immutable_nft.spend',
  PermissiveNftValidator: 'permissive_nft.spend',
  LockedValidator: 'lock.spend',
} as const;

/// Minting policy paramaterization schema
const MintParameterSchema = Data.Tuple([OutputReferenceSchema]);
type MintParameterType = Data.Static<typeof MintParameterSchema>;
const MintParameterShape = MintParameterSchema as unknown as MintParameterType;

/// Validator paramaterization schema
const PolicyIdValidatorParameterSchema = Data.Tuple([PolicyIdSchema]);
type PolicyIdValidatorParameterType = Data.Static<typeof PolicyIdValidatorParameterSchema>;
const PolicyIdValidatorParameterShape = PolicyIdValidatorParameterSchema as unknown as PolicyIdValidatorParameterType;

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

// Creates a native script minting policy using the passed in lucid instance wallet as the signer
export async function createNativeMintingPolicy(lucid: Lucid, durationSeconds: number): Promise<MintingPolicy> {
  const address = await lucid.wallet.address();
  const details = getAddressDetails(address);
  return lucid.utils.nativeScriptFromJson({
    type: 'all',
    scripts: [
      { type: 'sig', keyHash: details.paymentCredential?.hash },
      {
        type: 'before',
        slot: lucid.utils.unixTimeToSlot(Date.now() + durationSeconds * 1000),
      },
    ],
  });
}

/// Given a minting policy, parameterizes the collection info reference token spending validator and returns its info
function paramaterizePolicyIdValidator(lucid: Lucid, mintingPolicyId: string, scriptName: string) {
  const script = getScript(scriptName);
  const paramertizedMintingPolicy = applyParamsToScript<PolicyIdValidatorParameterType>(
    script.compiledCode,
    [mintingPolicyId],
    PolicyIdValidatorParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}

// Script references are not created under the same main minting policy as the collection and nft tokens.
// The only relationship is they are stored at the an always fail validator that is parameterized by that minting policy.
// In other words the policyId first parameter below is NOT the nft/collection token minting policy id.  It's just
// some native script minting policy.
export function scriptReferenceUnit(policyId: string, assetName: string) {
  return policyId + toLabel(0) + fromText(assetName);
}

// Creates a transaction that uses the passed in minting policy to generate tokens containing
// script references and sends them to a locked spending validator unique to the main minting policy.
export async function createScriptReference(
  lucid: Lucid,
  mintingPolicy: MintingPolicy,
  address: Address,
  reference: { script: Script; assetName: string }[]
) {
  const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);

  const assets: Record<string, bigint> = {};
  for (const { assetName } of reference) {
    const unit = scriptReferenceUnit(policyId, assetName);
    assets[unit] = 1n;
  }

  // Either shrink the scripts so they fit or do it in two transactions or just down the minting policy
  const tx = await lucid
    .newTx()
    .mintAssets(assets)
    .validTo(Date.now() + 2 * 60 * 1000)
    .attachMintingPolicy(mintingPolicy);

  for (const { script, assetName } of reference) {
    const unit = scriptReferenceUnit(policyId, assetName);
    tx.payToContract(
      address,
      {
        inline: Data.void(),
        scriptRef: script,
      },
      { [unit]: 1n }
    );
  }

  const completed = await tx.complete();
  const signed = await completed.sign().complete();
  return await signed.submit();
}

/// Fetches reference utxos given a script name
export async function fetchReferenceUtxo(lucid: Lucid, address: string, policyId: string, scriptName: string) {
  const unit = scriptReferenceUnit(policyId, scriptName);
  return await fetchUtxo(lucid, address, unit);
}

/// Given a unique hash and index from the seed transaction parameterizes the minting policy and returns its info
export function paramaterizeMintingPolicy(lucid: Lucid, hash: string, index: number) {
  const seed = {
    transaction_id: {
      hash,
    },
    output_index: BigInt(index),
  };

  const script = getScript(ScriptName.MintingPolicy);
  const paramertizedMintingPolicy = applyParamsToScript<MintParameterType>(
    script.compiledCode,
    [seed],
    MintParameterShape
  );
  return getScriptInfo(lucid, script.title, paramertizedMintingPolicy);
}

///// Rest of these functions are just some utility functions for readability that aren't strictly needed.

/// Minting Policy
export function mintingPolicyReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.MintingPolicy);
}

export async function fetchMintingPolicyReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.MintingPolicy);
}

export async function createMintingPolicyReference(
  lucid: Lucid,
  mintingPolicy: MintingPolicy,
  address: Address,
  script: Script
) {
  return await createScriptReference(lucid, mintingPolicy, address, [{ script, assetName: ScriptName.MintingPolicy }]);
}

/// State Validator
export function paramaterizeStateValidator(lucid: Lucid, mintingPolicyId: string) {
  return paramaterizePolicyIdValidator(lucid, mintingPolicyId, ScriptName.MintingStateValidator);
}

export function stateValidatorReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.MintingStateValidator);
}

export async function fetchStateValidatorReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.MintingStateValidator);
}

export async function createStateValidatorReference(
  lucid: Lucid,
  mintingPolicy: MintingPolicy,
  address: Address,
  script: Script
) {
  return await createScriptReference(lucid, mintingPolicy, address, [
    { script, assetName: ScriptName.MintingStateValidator },
  ]);
}

/// Immutable Info Validator
export function paramaterizeImmutableInfoValidator(lucid: Lucid, mintingPolicyId: string) {
  return paramaterizePolicyIdValidator(lucid, mintingPolicyId, ScriptName.ImmutableInfoValidator);
}

export function immutableInfoReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.ImmutableInfoValidator);
}

export async function fetchImmutableInfoReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.ImmutableInfoValidator);
}

/// Immutable NFT validator
export function paramaterizeImmutableNftValidator(lucid: Lucid, mintingPolicyId: string) {
  return paramaterizePolicyIdValidator(lucid, mintingPolicyId, ScriptName.ImmutableNftValidator);
}

export function immutableNftReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.ImmutableNftValidator);
}

export async function fetchImmutableNftReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.ImmutableNftValidator);
}

/// Permissive NFT validator
export function paramaterizePermissiveNftValidator(lucid: Lucid, mintingPolicyId: string) {
  return paramaterizePolicyIdValidator(lucid, mintingPolicyId, ScriptName.PermissiveNftValidator);
}

export function permissiveNftReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.PermissiveNftValidator);
}

export async function fetchPermissiveNftReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.PermissiveNftValidator);
}

/// Lock Validator
export function paramaterizeLockValidator(lucid: Lucid, mintingPolicyId: string) {
  return paramaterizePolicyIdValidator(lucid, mintingPolicyId, ScriptName.LockedValidator);
}

export function lockReferenceUnit(policyId: string) {
  return scriptReferenceUnit(policyId, ScriptName.LockedValidator);
}

export async function fetchLockReferenceUtxo(lucid: Lucid, address: Address, policyId: PolicyId) {
  return await fetchReferenceUtxo(lucid, address, policyId, ScriptName.LockedValidator);
}
