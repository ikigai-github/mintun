import { createEmulatorLucid, submit } from "./lucid.ts";
import {
  assert, assertEquals
} from "https://deno.land/std@0.208.0/assert/mod.ts";
import { buildStateBurnTx, buildStateMintTx  } from "./state-mint.ts";



Deno.test('Mint and burn state tokens', async () => {
  // Get a reference UTxO
  const { lucid } = await createEmulatorLucid();
  const utxos = await lucid.wallet.getUtxos(); 
  assert(utxos.length > 0, "Wallet must have at least one UTXO for this test");

  // Set ourselves as the recipient of the tokens
  const recipientAddress = await lucid.wallet.address();

  // Build and submit the minting transaction
  const { tx: mintTx, datum, referenceUnit, userUnit } = buildStateMintTx(lucid, utxos[0], recipientAddress);
  const mintTxHash = await submit(mintTx)

  // Now wait for the tx to show up so we can inspect the result
  await lucid.awaitTx(mintTxHash);

  // Fetch the utxos at the recipient address
  const mintedUtxos = await lucid.utxosAt(recipientAddress);

  // Verify reference token was received
  const referenceTokenUtxo = mintedUtxos.find(utxo => utxo.assets[referenceUnit])
  assert(referenceTokenUtxo);

  // Verify user token was received
  const userTokenUtxo = mintedUtxos.find(utxo => utxo.assets[userUnit]);
  assert(userTokenUtxo);

  // Verify reference token datum matches expected datum
  assertEquals(referenceTokenUtxo.datum, datum);

  // Build and submit the burn transaction
  const { tx: burnTx } = buildStateBurnTx(lucid, utxos[0], mintedUtxos);
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
