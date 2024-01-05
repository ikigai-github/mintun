// import { submit, toTxReference } from './utils.ts';
// import { assert } from 'std/assert/mod.ts';
// import { prepareStateBurnTransaction } from './state-mint.ts';
// import { createEmulatorLucid, mintStateToken } from './support.test.ts';

// Deno.test('Mint and burn state tokens', async () => {
//   // Get a reference UTxO
//   const { lucid } = await createEmulatorLucid();
//   const utxos = await lucid.wallet.getUtxos();
//   assert(utxos.length > 0, 'Wallet must have at least one UTXO for this test');

//   // Set ourselves as the recipient of the tokens
//   const recipientAddress = await lucid.wallet.address();

//   const seedUtxo = utxos[0];

//   // Run the common minting steps
//   const { unit, stateUserUtxo, stateReferenceUtxo } = await mintStateToken(lucid, seedUtxo, recipientAddress);

//   // Build and submit the burn transaction
//   const { tx: burnTx } = prepareStateBurnTransaction(lucid, toTxReference(seedUtxo), stateUserUtxo, stateReferenceUtxo);
//   const burnTxHash = await submit(burnTx);

//   // Now wait for the tx to show up to confirm success
//   await lucid.awaitTx(burnTxHash);

//   // Verify the tokens aren't in the wallet anymore, overkill?
//   const emptyUtxos = await lucid.utxosAt(recipientAddress);

//   // Verify reference token is gone
//   const missingReferenceTokenUtxo = emptyUtxos.find((utxo) => utxo.assets[unit.reference]);
//   assert(missingReferenceTokenUtxo === undefined);

//   // Verify user token is gone
//   const missingUserTokenUtxo = emptyUtxos.find((utxo) => utxo.assets[unit.user]);
//   assert(missingUserTokenUtxo === undefined);
// });
