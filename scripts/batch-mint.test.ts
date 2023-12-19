import { createEmulatorLucid, submit } from "./lucid.ts";
import { assert } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { mintStateToken } from './utils.test.ts';
import { BatchMintConfig, prepareBatchMintTx } from './batch-mint.ts';

Deno.test('Mint a few NFTs', async () => {
  // Get a reference UTxO
  const { lucid } = await createEmulatorLucid();
  const utxos = await lucid.wallet.getUtxos(); 
  assert(utxos.length > 0, "Wallet must have at least one UTXO for this test");

  // Set ourselves as the recipient of the tokens
  const recipientAddress = await lucid.wallet.address();

  // Mint the state tokens and send them to our wallet
  const stateMint = await mintStateToken(lucid, utxos, recipientAddress);


  const config: BatchMintConfig = {
    statePolicyId: stateMint.policyId,
    stateUserTokenUtxo: stateMint.userTokenUtxo,
    stateReferenceTokenUtxo: stateMint.referenceTokenUtxo,
    recipientAddress,
    mints: 'later'
  }

  const { tx } = await prepareBatchMintTx(lucid, config)

  const txHash = await submit(tx);
  await lucid.awaitTx(txHash);

  // Parameterize a batch mint and mint a few CIP-68 NFTs with the state mint token
  // Try burning the state mint token if you can kudos.  
});
