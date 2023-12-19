import { Lucid, UTxO } from 'https://deno.land/x/lucid@0.10.7/mod.ts';
import { buildStateMintTx } from './state-mint.ts';
import { submit } from './lucid.ts';
import { assert, assertEquals } from 'https://deno.land/std@0.208.0/assert/mod.ts';

export async function mintStateToken(lucid: Lucid, refernceUtxo: UTxO, recipientAddress: string) {
  // Build and submit the minting transaction
  const { mintTx, initialDatum, mintPolicyId, referenceUnit, validatorAddress, userUnit } = buildStateMintTx(lucid, refernceUtxo, recipientAddress);
  const mintTxHash = await submit(mintTx)
  await lucid.awaitTx(mintTxHash);

  // Fetch the utxos at the recipient address
  const recipientUtxos = await lucid.utxosAt(recipientAddress);

  // Verify user token was received
  const userTokenUtxo = recipientUtxos.find(utxo => utxo.assets[userUnit]);
  assert(userTokenUtxo);

  const validatorUtxos = await lucid.utxosAt(validatorAddress)
    
  // Verify reference token was received
  const referenceTokenUtxo = validatorUtxos.find(utxo => utxo.assets[referenceUnit])
  assert(referenceTokenUtxo);

  // Verify reference token datum matches expected datum
  assertEquals(referenceTokenUtxo.datum, initialDatum);

  return {
    mintPolicyId,
    validatorAddress,
    referenceUnit,
    referenceTokenUtxo,
    userUnit,
    userTokenUtxo
  }
}