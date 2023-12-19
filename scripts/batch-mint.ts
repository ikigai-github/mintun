import { Data, Lucid, Script, UTxO, applyDoubleCborEncoding, applyParamsToScript, fromText } from 'https://deno.land/x/lucid@0.10.7/mod.ts';
import { getScript } from './validators.ts';
import { PolicyIdSchema } from './aiken.ts';
import { StateMintShape, getStateReferenceUnit, getStateUserUnit } from './state-mint.ts';
import { NftDatum, NftShape, makeNftUnit, makeReferenceUnit } from './cip68.ts';

// Batch Minting policy params schema
const ParamsSchema = Data.Tuple([PolicyIdSchema]);
type Params = Data.Static<typeof ParamsSchema>
const Params = ParamsSchema as unknown as Params;

export type BatchMintConfig = {
  statePolicyId: string,
  stateUserTokenUtxo: UTxO,
  stateReferenceTokenUtxo?: UTxO
  recipientAddress: string,
  mints: unknown,
}

// Uses the passed in state minting policy id to paramaterize the batch mint script
export function paramaterizeBatchMintingPolicy(lucid: Lucid, stateMintPolicyId: string) {
  const validator = getScript('batch_mint.mint');
  const paramertizedValidator = applyParamsToScript<Params>(validator.compiledCode, [stateMintPolicyId], Params);

  const policy: Script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(paramertizedValidator)
  }

  const policyId = lucid.utils.validatorToScriptHash(policy);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);


  return {
    policy,
    policyId,
    address
  }
}

export async function prepareBatchMintTx(lucid: Lucid, {
  statePolicyId,
  stateUserTokenUtxo,
  stateReferenceTokenUtxo,
  recipientAddress,
}: BatchMintConfig) {
  const { policy, policyId, address } = paramaterizeBatchMintingPolicy(lucid, statePolicyId);
  const referenceUnit = getStateReferenceUnit(statePolicyId);
  const userUnit = getStateUserUnit(statePolicyId);

  // Reference token is expected to be at the minting policy if this isn't the first mint
  if(!stateReferenceTokenUtxo) {
    const batchMintUtxos = await lucid.utxosAtWithUnit(address, getStateReferenceUnit(statePolicyId));
    
    if(batchMintUtxos.length) {
      stateReferenceTokenUtxo = batchMintUtxos[0];
    } else {
      throw Error('oops')
    }
  } 

  const testNftUnit = makeNftUnit(policyId, 'test');
  const testReferenceUnit = makeReferenceUnit(policyId, 'test');

  const nftData: NftDatum = {
    metadata: {
      name: fromText('test'),
      image: fromText('https://hope.this.com/works'),
      description: null,
      files: null,
    },
    version: 1n,
    extra: Data.void()
  }

  const nftDatum = Data.to(nftData, NftShape);

  const updatedState = {
    metadata: {
      max_tokens: null,
      validity_window: null,
      reference_token_output_policy_id: null,
      tokens: 1n,
      has_minted_royalty: false
    },
    version: 1n,
    extra: Data.void()
  }

  const stateDatum = Data.to(updatedState, StateMintShape)

  const tx = lucid.newTx()
    .attachMintingPolicy(policy)
    .collectFrom([stateReferenceTokenUtxo], Data.void())
    .collectFrom([stateUserTokenUtxo])
    .mintAssets({
      [testNftUnit]: 1n,
      [testReferenceUnit]: 1n
    }, Data.void())
    .payToAddressWithData(recipientAddress, {
      inline: nftDatum
    }, {
      [testNftUnit]: 1n,
      [userUnit]: 1n
    })
    .payToAddressWithData(address, {
      inline: stateDatum
    }, {
      [referenceUnit]: 1n
    })

    return {
      tx,
      policy,
      policyId
    }

}