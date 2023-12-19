import { createEmulatorLucid, submit } from "./lucid.ts";
import { assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { buildStateBurnTx  } from "./state-mint.ts";
import { mintStateToken } from './utils.test.ts';

Deno.test('Mint and burn state tokens', async () => {
  // Get a reference UTxO
  const { lucid } = await createEmulatorLucid();
  const utxos = await lucid.wallet.getUtxos(); 
  assert(utxos.length > 0, "Wallet must have at least one UTXO for this test");

  // Set ourselves as the recipient of the tokens
  const recipientAddress = await lucid.wallet.address();

  const referenceUtxo = utxos[0]

  // Run the common minting steps 
  const { referenceUnit, userUnit, referenceTokenUtxo, userTokenUtxo } = await mintStateToken(lucid, referenceUtxo, recipientAddress);
  
  // Build and submit the burn transaction
  const { burnTx } = buildStateBurnTx(lucid, referenceUtxo, userTokenUtxo, referenceTokenUtxo );
  const burnTxHash = await submit(burnTx);

  // Now wait for the tx to show up to confirm success
  await lucid.awaitTx(burnTxHash);

  // Verify the tokens aren't in the wallet anymore, overkill?
  const emptyUtxos = await lucid.utxosAt(recipientAddress);

  // Verify reference token is gone
  const missingReferenceTokenUtxo = emptyUtxos.find(utxo => utxo.assets[referenceUnit])
  assert(missingReferenceTokenUtxo === undefined);

  // Verify user token is gone
  const missingUserTokenUtxo = emptyUtxos.find(utxo => utxo.assets[userUnit]);
  assert(missingUserTokenUtxo === undefined);
});
