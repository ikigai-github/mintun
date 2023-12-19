import { Address, Data, Lucid, Script, UTxO, applyDoubleCborEncoding, applyParamsToScript, fromText, toLabel } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { ChainAddressSchema, OutputReferenceSchema, PolicyIdSchema, PosixTimeIntervalSchema, asChainAddress } from "./aiken.ts";
import { getScript } from "./validators.ts";
import { createReferenceTokenSchema } from "./cip68.ts";

export const TOKEN_NAME = fromText('state');
export const USER_TOKEN_NAME = `${toLabel(111)}${TOKEN_NAME}`;
export const REFERENCE_TOKEN_NAME = `${toLabel(100)}${TOKEN_NAME}`; 

// State mint policy paramaterization schema
const MintParamsSchema = Data.Tuple([OutputReferenceSchema]);
type MintParams = Data.Static<typeof MintParamsSchema>
const MintParams = MintParamsSchema as unknown as MintParams;

// State validator paramaterization schema
const ValidatorParamsSchema = Data.Tuple([PolicyIdSchema]);
type ValidatorParams = Data.Static<typeof ValidatorParamsSchema>
const ValidatorParams = ValidatorParamsSchema as unknown as ValidatorParams;

// Custom state mint datum type definition
const StateMintMetadataSchema = Data.Object({
  max_tokens: Data.Nullable(Data.Integer()),
  validity_range: Data.Nullable(PosixTimeIntervalSchema),
  reference_address: Data.Nullable(ChainAddressSchema),
  state_policy_id: Data.Bytes({ minLength: 28, maxLength: 28}),
  mint_policy_id: Data.Bytes({ minLength: 28, maxLength: 28 }),
  tokens: Data.Integer(),
  has_minted_royalty: Data.Boolean()
});

const StateMintSchema = createReferenceTokenSchema(StateMintMetadataSchema);
type StateMintData = Data.Static<typeof StateMintSchema>;
export const StateMintShape = StateMintSchema as unknown as StateMintData;

function createInitialStateMintData(mintPolicyId: string, validatorPolicyId: string, referenceAddress: Address | undefined = undefined ): StateMintData {
  const reference_address = referenceAddress ? asChainAddress(referenceAddress) : null;

  return {
    metadata: {
      max_tokens: null,
      validity_range: null,
      reference_address,
      state_policy_id: validatorPolicyId,
      mint_policy_id: mintPolicyId,
      tokens: 0n,
      has_minted_royalty: false
    },
    version: 1n,
    extra: Data.to(Data.void())
  }
}

// Uses the passed in reference utxo to parameterize the state minting policy and returns the paramaterized script
function paramaterizeStateMintingPolicy(lucid: Lucid, referenceUtxo: UTxO) {
  const utxo_reference = {
    transaction_id: {
      hash: referenceUtxo.txHash,
    },
    output_index: BigInt(referenceUtxo.outputIndex)
  }

  const script = getScript('state_mint.state');
  const paramertizedMintingPolicy = applyParamsToScript<MintParams>(script.compiledCode, [utxo_reference], MintParams);

  const mintPolicy: Script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(paramertizedMintingPolicy)
  }

  const mintPolicyId = lucid.utils.validatorToScriptHash(mintPolicy);

  return {
    mintPolicy,
    mintPolicyId
  }
}

function paramaterizeStateValidator(lucid: Lucid, stateMintingPolicyId: string) {
  const script = getScript('state_validator.validate');
  const parameterizedValidator = applyParamsToScript<ValidatorParams>(script.compiledCode, [stateMintingPolicyId], ValidatorParams);

  const validatorPolicy: Script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(parameterizedValidator)
  }

  const validatorPolicyId = lucid.utils.validatorToScriptHash(validatorPolicy);


  return {
    validatorPolicy,
    validatorPolicyId,
  }
}

export function getStateReferenceUnit(policyId: string) {
  return `${policyId}${REFERENCE_TOKEN_NAME}`;
}

export function getStateUserUnit(policyId: string) {
  return `${policyId}${USER_TOKEN_NAME}`;
}

/// Uses the reference Utxo to paramaterize the minting policy and then sets up a minting
/// transaction for the state tokens and returns it uncompleted to allow caller to adjust
/// if needed.
export function buildStateMintTx(lucid: Lucid, referenceUtxo: UTxO, recipientAddress: string) {
  const { mintPolicy, mintPolicyId } = paramaterizeStateMintingPolicy(lucid, referenceUtxo);
  const { validatorPolicyId } = paramaterizeStateValidator(lucid, mintPolicyId);
  const referenceUnit = getStateReferenceUnit(mintPolicyId);
  const userUnit = getStateUserUnit(mintPolicyId);

  const validatorCredential =  lucid.utils.scriptHashToCredential(validatorPolicyId);
  const validatorAddress = lucid.utils.credentialToAddress(validatorCredential);

  // Setup the initial state datum to attach to the reference token
  const initialStateData = createInitialStateMintData(mintPolicyId, validatorPolicyId);
  const initialDatum = Data.to(initialStateData, StateMintShape);

  const mintTx = lucid.newTx()
  .attachMintingPolicy(mintPolicy)
  .collectFrom([referenceUtxo])
  .mintAssets(
    {
      [referenceUnit]: 1n,
      [userUnit]: 1n
    },
    Data.void()
  )
  .payToAddressWithData(validatorAddress, { 
    inline: initialDatum 
  }, {
    [referenceUnit]: 1n
  }).payToAddress(recipientAddress, {
    [userUnit]: 1n
  });

  return {
    mintTx,
    initialDatum,
    mintPolicyId,
    validatorPolicyId,
    validatorAddress,
    referenceUnit,
    userUnit
  }
}

/// Construct a transaction to burn state tokens.  
export function buildStateBurnTx(lucid: Lucid, referenceUtxo: UTxO, userTokenUtxo: UTxO, referenceTokenUtxo: UTxO) {
  const { mintPolicy, mintPolicyId } = paramaterizeStateMintingPolicy(lucid, referenceUtxo);
  const { validatorPolicy, validatorPolicyId } = paramaterizeStateValidator(lucid, mintPolicyId);
  const referenceUnit = getStateReferenceUnit(mintPolicyId);
  const userUnit = getStateUserUnit(mintPolicyId);
  
  // User token should come from a wallet while the reference token should be at the state spending validator
  // Both should be burned back at the minting policy
  const burnTx = lucid.newTx()
  .collectFrom([userTokenUtxo])
  .attachSpendingValidator(validatorPolicy)
  .collectFrom([referenceTokenUtxo], Data.void())
  .attachMintingPolicy(mintPolicy)
  .mintAssets(
    {
      [referenceUnit]: -1n,
      [userUnit]: -1n
    },
    Data.void()
  )

  return {
    burnTx,
    mintPolicyId,
    validatorPolicyId,
    referenceUnit,
    userUnit
  }
}