import { expect, test } from 'vitest';

import { TEST_COLLECTION_INFO } from './fixtures.test';
import { GenesisTxBuilder } from './genesis';
import { MintTxBuilder } from './mint';
import { ScriptCache } from './script';
import { applyScriptRefTx, applyTx, createEmulatorLucid, generateNft } from './support.test';

export async function genesis() {
  const { lucid, seedUtxo, accounts } = await createEmulatorLucid();

  // Use different address than selected wallet (account 0)
  const endMs = Date.now() + 1_000_000;
  const groupPolicyId = 'de2340edc45629456bf695200e8ea32f948a653b21ada10bc6f0c554';
  const cache = ScriptCache.cold(lucid, seedUtxo);
  const { tx } = await GenesisTxBuilder.create(lucid)
    .seed(seedUtxo)
    .group(groupPolicyId)
    .cache(cache)
    .maxNfts(100)
    .mintWindow(0, endMs)
    .useImmutableNftValidator()
    .royaltyValidatorAddress(cache.spendLock().address)
    .ownerAddress(await lucid.wallet.address())
    .info(TEST_COLLECTION_INFO)
    .useCip88(true)
    .royalty(accounts[0].address, 4.3)
    .build();

  const { ownerUtxo, stateUtxo, state } = await applyTx(lucid, tx, cache);

  const { mintScriptReferenceUtxo, stateScriptReferenceUtxo } = await applyScriptRefTx(lucid, cache);

  return { cache, lucid, accounts, stateUtxo, ownerUtxo, state, mintScriptReferenceUtxo, stateScriptReferenceUtxo };
}

test('Mint a token', async () => {
  const {
    cache,
    lucid,
    stateUtxo,
    state: genesisState,
    mintScriptReferenceUtxo,
    stateScriptReferenceUtxo,
  } = await genesis();

  // Max mints in a batch while emitting cip-25 metadata is around 15 nfts
  // Max mints in a batch using just CIP-68 datum is around 30 nfts
  // Limiting batch size to 15 without cip-25 should be a safe amount
  // NOTE: Should Add a utility function to convert nfts to CBOR and get the byte size to give a
  //       real data estime
  const NUM_MINTS = 10;
  const nfts = [];
  for (let i = 0; i < NUM_MINTS; ++i) {
    nfts.push(generateNft());
  }

  const { tx } = await MintTxBuilder.create(lucid)
    .cache(cache)
    .stateUtxo(stateUtxo)
    .mintingPolicyReferenceUtxo(mintScriptReferenceUtxo)
    .stateValidatorReferenceUtxo(stateScriptReferenceUtxo)
    .state(genesisState)
    .useCip25(true)
    .nfts(nfts)
    .build();

  const { state } = await applyTx(lucid, tx, cache);
  expect(state.nfts).toEqual(NUM_MINTS);
  expect(state.nextSequence).toEqual(NUM_MINTS);
});
