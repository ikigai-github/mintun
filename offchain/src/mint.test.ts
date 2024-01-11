import { assert } from 'std/assert/assert.ts';
import { TEST_COLLECTION_INFO } from './fixtures.test.ts';
import { GenesisTxBuilder } from './genesis.ts';
import { MintTxBuilder } from './mint.ts';
import { applyTx, createEmulatorLucid, generateNft } from './support.test.ts';

export async function genesis() {
  const { lucid, seedUtxo, accounts } = await createEmulatorLucid();

  // Use different address than selected wallet (account 0)
  const endMs = Date.now() + 1_000_000;
  const { tx, cache } = await GenesisTxBuilder
    .create(lucid)
    .seed(seedUtxo)
    .name('Test')
    .maxNfts(1)
    .mintWindow(0, endMs)
    .info(TEST_COLLECTION_INFO)
    .useCip27(true)
    .useCip88(true)
    .royalty(accounts[0].address, 1.0)
    .build();

  const { ownerUtxo, referenceUtxo, state } = await applyTx(lucid, tx, cache);

  return { cache, lucid, accounts, referenceUtxo, ownerUtxo, state };
}

Deno.test('Mint a token', async () => {
  const { cache, lucid, referenceUtxo, ownerUtxo, state: genesisState } = await genesis();

  const nft = generateNft();

  const { tx } = await MintTxBuilder
    .create(lucid)
    .cache(cache)
    .manageReferenceUtxo(referenceUtxo)
    .manageOwnerUtxo(ownerUtxo)
    .currentState(genesisState)
    .nft(nft)
    .build();

  const { state } = await applyTx(lucid, tx, cache);
  assert(state.currentNfts == 1);
  assert(state.nextSequence == 1);
});
