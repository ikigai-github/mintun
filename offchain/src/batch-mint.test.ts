// import { assert } from 'std/assert/mod.ts';

// import { submit } from './utils.ts';

// import { createEmulatorLucid, mintStateToken } from './support.test.ts';
// import { BatchMintCache, NftMint, prepareBatchMintTx } from './batch-mint.ts';

// Deno.test('Mint a few NFTs', async () => {
//   // Get a reference UTxO
//   const { lucid } = await createEmulatorLucid();
//   const utxos = await lucid.wallet.getUtxos();
//   assert(utxos.length > 0, 'Wallet must have at least one UTXO for this test');

//   // Set ourselves as the recipient of the tokens
//   const recipientAddress = await lucid.wallet.address();
//   const seedUtxo = utxos[0];

//   // Mint the state tokens and send the user token to our wallet
//   const result = await mintStateToken(lucid, seedUtxo, recipientAddress);

//   // Warm up the cache with the stuff we already know from the mint
//   const cache: BatchMintCache = {
//     seed: {
//       hash: seedUtxo.txHash,
//       index: seedUtxo.outputIndex,
//     },
//     stateMint: result.stateMint,
//     stateValidator: result.stateValidator,
//     batchMint: result.batchMint,
//     unit: result.unit,
//     stateUserUtxo: result.stateUserUtxo,
//     stateReferenceUtxo: result.stateReferenceUtxo,
//     recipientAddress,
//     inlineDatum: true,
//   };

//   // Generate enough mint data to mint a few NFTS
//   const mints: NftMint[] = Array.from(Array(3).keys()).map(generateTestMintData);
//   const tx = await prepareBatchMintTx(lucid, cache, mints);
//   const txHash = await submit(tx);
//   await lucid.awaitTx(txHash);

//   // Parameterize a batch mint and mint a few CIP-68 NFTs with the state mint token
//   // Try burning the state mint token if you can kudos.
// });

// /// Utility just to generate some unique mints
// function generateTestMintData(count: number): NftMint {
//   return {
//     name: `test${count}`,
//     metadata: {
//       name: `Test ${count}`,
//       image: `https://picsum.photos/seed/test${count}/200/200`,
//       description: null,
//       files: null,
//       attributes: null,
//       tags: null,
//       id: null,
//       type: null,
//       collection: `Test`,
//       website: null,
//       twitter: null,
//     },
//   };
// }
