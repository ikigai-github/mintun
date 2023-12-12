import { createEmulatorLucid } from "./lucid.ts";
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

  // Do the usual tx signing song and dance
  const { tx: mintTx, datum, referenceUnit, userUnit } = buildStateMintTx(lucid, utxos[0], recipientAddress);
  const mintBuilt = await mintTx.complete();
  const mintSigned = await mintBuilt.sign().complete();
  const mintTxHash = await mintSigned.submit();

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

  // Repeat the usual tx signing song and dance
  const { tx: burnTx } = buildStateBurnTx(lucid, utxos[0], mintedUtxos);
  const burnBuilt = await burnTx.complete();
  const burnSigned = await burnBuilt.sign().complete();
  const burnTxHash = await burnSigned.submit();

  // Now wait for the tx to show up so we can inspect the result
  await lucid.awaitTx(burnTxHash);
});
