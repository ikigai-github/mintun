import { Constr, Data, Lucid, Script, UTxO, applyDoubleCborEncoding, applyParamsToScript, fromText, toLabel } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { PosixTimeIntervalSchema } from "./aiken.ts";
import { getValidator } from "./validators.ts";
import { createReferenceTokenSchema } from "./cip68.ts";

export const TOKEN_NAME = fromText('state');
export const USER_TOKEN_NAME = `${toLabel(111)}${TOKEN_NAME}`;
export const REFERENCE_TOKEN_NAME = `${toLabel(100)}${TOKEN_NAME}`; 

// Custom state mint datum type definition
const StateMintMetadataSchema = Data.Object({
  max_tokens: Data.Nullable(Data.Integer()),
  validity_window: Data.Nullable(PosixTimeIntervalSchema),
  reference_token_output_policy_id: Data.Nullable(Data.Bytes()),
  tokens: Data.Integer(),
  has_minted_royalty: Data.Boolean()
});

const StateMintDatumSchema = createReferenceTokenSchema(StateMintMetadataSchema);
type StateMintDatum = Data.Static<typeof StateMintDatumSchema>;
const StateMintDatumShape = StateMintDatumSchema as unknown as StateMintDatum;

function createInitialStateMintDatum(): StateMintDatum {
  return {
    metadata: {
      max_tokens: null,
      validity_window: null,
      reference_token_output_policy_id: null,
      tokens: 0n,
      has_minted_royalty: false
    },
    version: 1n,
    extra: Data.void()
  }
}

// Uses the passed in reference utxo to parameterize the state mint policy and returns the paramaterized script
function paramaterizeStateMintingPolicy(referenceUtxo: UTxO): Script {
  // TODO: just use schema definition to build this instead.
  const outputReference = new Constr(0, [
    new Constr(0, [referenceUtxo.txHash]),
    BigInt(referenceUtxo.outputIndex),
  ]);

  const validator = getValidator('state_mint.state');
  const paramertizedValidator = applyParamsToScript(validator.compiledCode, [outputReference]);

  return {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(paramertizedValidator)
  }
}

function getStateMintingPolicyInfo(lucid:Lucid, referenceUtxo: UTxO) {
  const policy = paramaterizeStateMintingPolicy(referenceUtxo);
  const policyId = lucid.utils.validatorToScriptHash(policy);
  const referenceUnit = `${policyId}${REFERENCE_TOKEN_NAME}`;
  const userUnit = `${policyId}${USER_TOKEN_NAME}`;

  return {
    policy,
    policyId,
    referenceUnit,
    userUnit
  }
}

/// Uses the reference Utxo to paramaterize the minting policy and then sets up a minting
/// transaction for the state tokens and returns it uncompleted to allow caller to adjust
/// if needed.
export function buildStateMintTx(lucid: Lucid, referenceUtxo: UTxO, recipientAddress: string) {
  const { policy, policyId, referenceUnit, userUnit } = getStateMintingPolicyInfo(lucid, referenceUtxo);

  // Setup the initial state datum to attach to the reference token
  const initialStateDatum = createInitialStateMintDatum();
  const datum = Data.to(initialStateDatum, StateMintDatumShape);

  const tx = lucid.newTx()
  .attachMintingPolicy(policy)
  .collectFrom([referenceUtxo], Data.void())
  .mintAssets(
    {
      [referenceUnit]: 1n,
      [userUnit]: 1n
    },
    Data.void()
  )
  .payToAddressWithData(recipientAddress, { 
    inline: datum 
  }, {
    [referenceUnit]: 1n,
    [userUnit]: 1n
  });

  return {
    tx,
    datum,
    policyId,
    referenceUnit,
    userUnit
  }
}

/// Construction a transaction to burn state tokens.  
/// TODO: The reference token needs to be collected from the other minting policy it ends up locked at. 
///       Not sure how I would build the TX to do that but I think it is feasible.
export function buildStateBurnTx(lucid: Lucid, referenceUtxo: UTxO, tokenUtxos: UTxO[]) {
  const { policy, policyId, referenceUnit, userUnit } = getStateMintingPolicyInfo(lucid, referenceUtxo);
  
  const tx = lucid.newTx()
  .attachMintingPolicy(policy)
  .collectFrom(tokenUtxos, Data.void())  
  .mintAssets(
    {
      [referenceUnit]: -1n,
      [userUnit]: -1n
    },
    Data.void()
  );

  return {
    tx,
    policyId,
    referenceUnit,
    userUnit
  }
}