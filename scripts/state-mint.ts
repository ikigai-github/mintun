import { Constr, Data, Lucid, Script, UTxO, applyDoubleCborEncoding, applyParamsToScript, fromText, toLabel } from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { PosixTimeIntervalSchema } from "./aiken.ts";
import { getValidator } from "./validators.ts";

export const TOKEN_NAME = fromText('state');
export const USER_TOKEN_NAME = `${toLabel(111)}${TOKEN_NAME}`;
export const REFERENCE_TOKEN_NAME = `${toLabel(100)}${TOKEN_NAME}`; 


// Custom state mint datum type definition
const StateMintMetadataSchema = Data.Object({
  max_tokens: Data.Nullable(Data.Integer()),
  validity_window: Data.Nullable(PosixTimeIntervalSchema),
  tokens: Data.Integer(),
  transactions: Data.Integer()
});

const StateMintDatumSchema = Data.Object({
  metadata: StateMintMetadataSchema,
  version: Data.Integer(),
  extra: Data.Any()
})

type StateMintDatum = Data.Static<typeof StateMintDatumSchema>;
const StateMintDatumShape = StateMintDatumSchema as unknown as StateMintDatum;

function createInitialStateMintDatum(): StateMintDatum {
  return {
    metadata: {
      max_tokens: null,
      validity_window: null,
      tokens: 0n,
      transactions: 0n
    },
    version: 1n,
    extra: Data.void()
  }
}

// Uses the passed in reference utxo to parameterize the state mint policy and returns the paramaterized script
function getStateMintingPolicy(referenceUtxo: UTxO): Script {
  // Feel like I should be able to use the blueprint provided in the definitions of plutus.json instead of this.
  // but that's a whole thing to parse the plutus.json and construct a schema so will just manual for now.
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

export function buildStateMintTx(lucid: Lucid, referenceUtxo: UTxO, recipientAddress: string) {
  const policy = getStateMintingPolicy(referenceUtxo);
  const policyId = lucid.utils.validatorToScriptHash(policy);
  const referenceUnit = `${policyId}${REFERENCE_TOKEN_NAME}`;
  const userUnit = `${policyId}${USER_TOKEN_NAME}`;

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

export function buildStateBurnTx(lucid: Lucid, referenceUtxo: UTxO, tokenUtxos: UTxO[]) {
  const policy = getStateMintingPolicy(referenceUtxo);
  const policyId = lucid.utils.validatorToScriptHash(policy);
  const referenceUnit = `${policyId}${REFERENCE_TOKEN_NAME}`;
  const userUnit = `${policyId}${USER_TOKEN_NAME}`;
  
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