import { assert, assertThrows } from 'std/assert/mod.ts';
import { submit } from './utils.ts';
import { GenesisTxBuilder } from './genesis.ts';
import { createEmulatorLucid } from './support.test.ts';
import { extractCollectionState } from './mintun.ts';
import { ScriptCache } from './script.ts';
import { Lucid, Tx } from 'lucid';
import { TEST_COLLECTION_INFO } from './fixtures.test.ts';

async function run(lucid: Lucid, tx: Tx, cache: ScriptCache) {
  const txHash = await submit(tx);
  await lucid.awaitTx(txHash);

  // Use cache utils to check to tokens were distributed as expected
  const reference = await cache.fetchManageReferenceUtxo();
  assert(reference.utxo && !reference.wallet);

  const owner = await cache.fetchManageOwnerUtxo();
  assert(owner.utxo);

  return { txHash, referenceUtxo: reference.utxo, ownerUtxo: owner.utxo };
}

Deno.test('Minimal minting policy genesis transaction', async () => {
  const { lucid, seedUtxo } = await createEmulatorLucid();
  const { tx, cache } = await GenesisTxBuilder
    .create(lucid)
    .name('No Constraints')
    .seed(seedUtxo)
    .build();

  const { referenceUtxo } = await run(lucid, tx, cache);

  // Check the state is on the datum as expected
  const state = await extractCollectionState(lucid, referenceUtxo);
  assert(state.name === 'No Constraints');
  assert(state.group === undefined);
  assert(state.mintWindow === undefined);
  assert(state.maxNfts === undefined);
  assert(state.currentNfts === 0);
  assert(state.locked === false);
  assert(state.nextSequence === 0);
  assert(state.nftReferenceTokenAddress === undefined);
});

Deno.test('All configuration genesis transaction', async () => {
  const { lucid, seedUtxo, accounts } = await createEmulatorLucid();

  // Use different address than selected wallet (account 0)
  const ownerAddress = accounts[1].address;
  const referenceTokenAddress = accounts[2].address;
  const royaltyTokenAddress = accounts[3].address;
  const endMs = Date.now() + 1_000_000;
  const groupPolicyId = 'de2340edc45629456bf695200e8ea32f948a653b21ada10bc6f0c554';
  const { tx, cache } = await GenesisTxBuilder
    .create(lucid)
    .seed(seedUtxo)
    .name('Kitchen Sink')
    .group(groupPolicyId)
    .maxNfts(1)
    .mintWindow(0, endMs)
    .nftReferenceTokenAddress(referenceTokenAddress)
    .royaltyTokenAddress(royaltyTokenAddress)
    .ownerAddress(ownerAddress)
    .info(TEST_COLLECTION_INFO)
    .useCip27()
    .useCip88()
    .royalty(accounts[0].address, 4.3)
    .build();

  const { referenceUtxo } = await run(lucid, tx, cache);

  // Check the state is on the datum as expected
  const state = await extractCollectionState(lucid, referenceUtxo);
  assert(state.name === 'Kitchen Sink');
  assert(state.mintWindow && state.mintWindow.startMs === 0 && state.mintWindow.endMs === endMs);
  assert(state.maxNfts === 1);
});

Deno.test('Builder errors during build', async () => {
  const { lucid } = await createEmulatorLucid();

  // End time <= Start Time
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).mintWindow(0, 0);
  });

  // Name > 64 characters
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).name('anamethatisoversixtyfourcharacterslongsuchthatitdoesnotfittheconstraints');
  });

  // Invalid policy id
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).group('This is not a 28 byte hex string');
  });

  // Same address twice
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).royalty('addr1superlegit', 10).royalty('addr1superlegit', 10);
  });

  // Greater than 100%
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).royalty('addr1superlegitA', 60).royalty('addr1superlegitB', 60);
  });

  // Less that 0.1%
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).royalty('addr1superlegit', 0);
  });

  // Invalid bech32 royalty address (well more invalid)
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).royalty('badnotsuperlegit', 0);
  });

  // Invalid bech32 recipient
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).ownerAddress('badnotsuperlegit');
  });
});