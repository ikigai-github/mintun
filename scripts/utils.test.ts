import { assert } from 'https://deno.land/std@0.208.0/assert/mod.ts';
import { Lucid, UTxO } from 'https://deno.land/x/lucid@0.10.7/mod.ts';
import { prepareStateMintTransaction } from './state-mint.ts';
import { submit } from './lucid.ts';

export async function mintStateToken(lucid: Lucid, seedUtxo: UTxO, recipientAddress: string) {
  // Build and submit the minting transaction
  const { tx, stateMint, stateValidator, batchMint, unit } = prepareStateMintTransaction(lucid, seedUtxo, recipientAddress);
  const txHash = await submit(tx)
  await lucid.awaitTx(txHash);

  // Fetch the utxos at the recipient address
  const recipientUtxos = await lucid.utxosAt(recipientAddress);

  // Verify user token was received
  const stateUserUtxo = recipientUtxos.find(utxo => utxo.assets[unit.user]);
  assert(stateUserUtxo);

  const validatorUtxos = await lucid.utxosAt(stateValidator.address)
    
  // Verify reference token was received
  const stateReferenceUtxo = validatorUtxos.find(utxo => utxo.assets[unit.reference])
  assert(stateReferenceUtxo);

  return {
    stateMint,
    stateValidator,
    batchMint,
    unit,
    stateUserUtxo,
    stateReferenceUtxo
  }
}