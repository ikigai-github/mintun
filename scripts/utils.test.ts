import { assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { Lucid, UTxO } from 'https://deno.land/x/lucid@0.10.7/mod.ts';
import { prepareStateMintTransaction } from './state-mint.ts';
import { submit } from './lucid.ts';

export async function mintStateToken(lucid: Lucid, referenceUtxo: UTxO, recipientAddress: string) {
  // Build and submit the minting transaction
  const { tx, mint, validator, unit } = prepareStateMintTransaction(lucid, referenceUtxo, recipientAddress);
  const txHash = await submit(tx)
  await lucid.awaitTx(txHash);

  // Fetch the utxos at the recipient address
  const recipientUtxos = await lucid.utxosAt(recipientAddress);

  // Verify user token was received
  const userTokenUtxo = recipientUtxos.find(utxo => utxo.assets[unit.user]);
  assert(userTokenUtxo);

  const validatorUtxos = await lucid.utxosAt(validator.address)
    
  // Verify reference token was received
  const referenceTokenUtxo = validatorUtxos.find(utxo => utxo.assets[unit.reference])
  assert(referenceTokenUtxo);

  return {
    mint,
    validator,
    unit,
    referenceTokenUtxo,
    userTokenUtxo
  }
}