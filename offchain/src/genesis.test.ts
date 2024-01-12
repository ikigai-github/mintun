import { assert, assertThrows } from 'std/assert/mod.ts';
import { GenesisTxBuilder } from './genesis.ts';
import { applyTx, createEmulatorLucid } from './support.test.ts';
import { TEST_COLLECTION_INFO } from './fixtures.test.ts';

Deno.test('Minimal minting policy genesis transaction', async () => {
  const { lucid, seedUtxo } = await createEmulatorLucid();
  const { tx, cache } = await GenesisTxBuilder
    .create(lucid)
    .info({ name: 'No Constraints', nsfw: false })
    .seed(seedUtxo)
    .build();

  // Check the state is on the datum as expected
  const { state, info } = await applyTx(lucid, tx, cache);
  assert(state.group === undefined);
  assert(state.mintWindow === undefined);
  assert(state.maxNfts === undefined);
  assert(state.currentNfts === 0);
  assert(state.locked === false);
  assert(state.nextSequence === 0);
  assert(state.nftReferenceTokenAddress === undefined);
  assert(info.name === 'No Constraints');
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
    .group(groupPolicyId)
    .maxNfts(1)
    .mintWindow(0, endMs)
    .nftReferenceTokenAddress(referenceTokenAddress)
    .royaltyTokenAddress(royaltyTokenAddress)
    .ownerAddress(ownerAddress)
    .info(TEST_COLLECTION_INFO)
    .useCip27(true)
    .useCip88(true)
    .royalty(accounts[0].address, 4.3)
    .build();

  // Check the state is on the datum as expected
  const { state, info } = await applyTx(lucid, tx, cache);
  assert(info.name === TEST_COLLECTION_INFO.name);
  assert(info.artist === TEST_COLLECTION_INFO.artist);
  assert(info.description === TEST_COLLECTION_INFO.description);
  assert(info.images?.[0].src === TEST_COLLECTION_INFO.images?.[0].src);
  assert(state.mintWindow && state.mintWindow.startMs === 0 && state.mintWindow.endMs === endMs);
  assert(state.maxNfts === 1);
});

Deno.test('Builder errors during build', async () => {
  const { lucid } = await createEmulatorLucid();

  // End time <= Start Time
  assertThrows(() => {
    GenesisTxBuilder.create(lucid).mintWindow(0, 0);
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
