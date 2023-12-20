import { Address, Data, Lucid, Tx, UTxO, applyParamsToScript, fromText, toLabel } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { ChainAddressSchema, OutputReferenceSchema, PolicyIdSchema, PosixTimeIntervalSchema, asChainAddress } from "./aiken.ts";
import { getScript } from "./validators.ts";
import { createReferenceTokenSchema, createReferenceData } from "./cip68.ts";
import { TxReference, ValidatorInfo, getValidatorInfo, toTxReference } from './lucid.ts';

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

// Custom state mint metadata schema definition
const StateMintMetadataSchema = Data.Object({
  max_tokens: Data.Nullable(Data.Integer()),
  validity_range: Data.Nullable(PosixTimeIntervalSchema),
  reference_address: Data.Nullable(ChainAddressSchema),
  state_policy_id: Data.Bytes({ minLength: 28, maxLength: 28}),
  mint_policy_id: Data.Bytes({ minLength: 28, maxLength: 28 }),
  tokens: Data.Integer(),
  has_minted_royalty: Data.Boolean()
});

// Mint Schema uses CIP-68 reference token 
export const StateMintSchema = createReferenceTokenSchema(StateMintMetadataSchema);
export type StateMintData = Data.Static<typeof StateMintSchema>;
export const StateMintShape = StateMintSchema as unknown as StateMintData;

export type StateUnitLookup = {
  reference: string,
  user: string
}

export type PreparedStateTransaction = {
  tx: Tx,
  mint: ValidatorInfo,
  validator: ValidatorInfo,
  unit: StateUnitLookup
}

/// Utility for generating the initial mint state data. 
export function createInitialStateMintData(mintPolicyId: string, validatorPolicyId: string, referenceAddress: Address | undefined = undefined ): StateMintData {
  const reference_address = referenceAddress ? asChainAddress(referenceAddress) : null;
  const metadata = {
    max_tokens: null,
    validity_range: null,
    reference_address,
    state_policy_id: validatorPolicyId,
    mint_policy_id: mintPolicyId,
    tokens: 0n,
    has_minted_royalty: false
  };

  return createReferenceData(metadata)
}

/// Copys previous state with supplied modifications to the token and royalty count
export function updateStateMintData(previousState: StateMintData, newTokenCount: number, mintedRoyalty: boolean | undefined = undefined ): StateMintData {
  const has_minted_royalty = mintedRoyalty !== undefined ? mintedRoyalty : previousState.metadata.has_minted_royalty;
  const tokens = previousState.metadata.tokens + BigInt(newTokenCount);
  const metadata = {...previousState.metadata, tokens, has_minted_royalty }
  return createReferenceData(metadata)
}

/// Parameterizes the one-shot state minting policy with the given seed transaction hash and index
export function paramaterizeStateMintingPolicy(lucid: Lucid, seed: TxReference) {
  const utxoReference = {
    transaction_id: {
      hash: seed.hash,
    },
    output_index: BigInt(seed.index)
  }

  const script = getScript('state_mint.state');
  const paramertizedMintingPolicy = applyParamsToScript<MintParams>(script.compiledCode, [utxoReference], MintParams);
  return getValidatorInfo(lucid, paramertizedMintingPolicy)
}

/// Parameterizes the state validator using the state minting policy id
export function paramaterizeStateValidator(lucid: Lucid, stateMintingPolicyId: string) {
  const script = getScript('state_validator.validate');
  const parameterizedValidator = applyParamsToScript<ValidatorParams>(script.compiledCode, [stateMintingPolicyId], ValidatorParams);
  return getValidatorInfo(lucid, parameterizedValidator)
}

/// Parameterizes both the minting policy script and the validator script using the given seed transaction output hash and index
export function paramaterizeValidators(lucid: Lucid, seed: TxReference) {
  const mint = paramaterizeStateMintingPolicy(lucid, seed);
  const validator = paramaterizeStateValidator(lucid, mint.policyId);
  const reference = getStateReferenceUnit(mint.policyId);
  const user = getStateUserUnit(mint.policyId);

  return {
    mint,
    validator,
    unit: {
      reference,
      user
    }
  }
}

/// Utility function for constructing the state reference token unit for a given policy_id
export function getStateReferenceUnit(policyId: string) {
  return `${policyId}${REFERENCE_TOKEN_NAME}`;
}

/// Utility function for constructing the state user token unit for a given policy_id
export function getStateUserUnit(policyId: string) {
  return `${policyId}${USER_TOKEN_NAME}`;
}

/// Uses the reference Utxo to paramaterize the minting policy and then sets up a minting
/// transaction for the state tokens and returns it uncompleted to allow caller to adjust
/// if needed.
export function prepareStateMintTransaction(lucid: Lucid, seedUtxo: UTxO, recipientAddress: string): PreparedStateTransaction {
  const { 
    mint,
    validator,
    unit
  } = paramaterizeValidators(lucid, toTxReference(seedUtxo));
  // Setup the initial state datum to attach to the reference token
  const initialStateData = createInitialStateMintData(mint.policyId, validator.policyId);
  const initialDatum = Data.to(initialStateData, StateMintShape);

  const tx = lucid.newTx()
  .attachMintingPolicy(mint.policy)
  .collectFrom([seedUtxo])
  .mintAssets(
    {
      [unit.reference]: 1n,
      [unit.user]: 1n
    },
    Data.void()
  )
  .payToAddressWithData(validator.address, { 
    inline: initialDatum 
  }, {
    [unit.reference]: 1n
  }).payToAddress(recipientAddress, {
    [unit.user]: 1n
  });

  return {
    tx,
    mint,
    validator,
    unit
  }
}

/// Construct a transaction to burn state tokens.  
export function prepareStateBurnTransaction(lucid: Lucid, seed: TxReference, userTokenUtxo: UTxO, referenceTokenUtxo: UTxO) {
  const { mint, validator, unit } = paramaterizeValidators(lucid, seed);

  // User token should come from a wallet while the reference token should be at the state spending validator
  // Both should be burned back at the minting policy
  const tx = lucid.newTx()
  .collectFrom([userTokenUtxo])
  .attachSpendingValidator(validator.policy)
  .collectFrom([referenceTokenUtxo], Data.void())
  .attachMintingPolicy(mint.policy)
  .mintAssets(
    {
      [unit.reference]: -1n,
      [unit.user]: -1n
    },
    Data.void()
  )

  return {
    tx,
    mint,
    validator,
    unit
  }
}

/// Find the reference token at the state validator address computed using the seed transaction output
/// Note: 
///   This function must parameterize the state minting policy and validator just to determine the validator address.
///   If you already know the address you can use `lucid.utxosAt(validatorAddress)` and skip that extra work.
///   Alternatively, If you already have the reference unit name then you can use `lucid.utxoByUnit(referenceUnit)`
export async function findStateUtxo(lucid: Lucid, seed: TxReference) {
  const { 
    validator,
    unit, 
  } = paramaterizeValidators(lucid, seed);

  const utxos = await lucid.utxosAt(validator.address)
  return utxos.find(utxo => utxo.assets[unit.reference]);
}

/// Wrapper function for clairity and typing. Calls lucid.datumOf(referenceTokenUtxo, StateMintShape)
export async function readStateData(lucid: Lucid, stateReferenceUtxo: UTxO): Promise<StateMintData> {
   return await lucid.datumOf(stateReferenceUtxo, StateMintShape); 
}