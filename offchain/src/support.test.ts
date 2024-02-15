import { expect } from 'vitest';
import { Assets, Emulator, generateSeedPhrase, Lucid, Tx } from 'lucid-cardano';
import { submit } from './utils';
import { fetchInfoUtxo, fetchOwnerUtxo, fetchStateUtxo, ScriptCache } from './script';
import { MintunNft } from './nft';
import { extractCollectionState } from './collection-state';
import { extractCollectionInfo } from './collection-info';

/// Creates a new emulator account with the given assets, if any.
export async function generateEmulatorAccount(assets: Assets = {}) {
  const seedPhrase = generateSeedPhrase();
  return {
    seedPhrase,
    address: await (await Lucid.new(undefined, 'Custom'))
      .selectWalletFromSeed(seedPhrase).wallet.address(),
    assets,
  };
}

/// Instantiates an instace of Lucid with an Emulator as the provider.  The emulator is seeded with two starting accounts with one of them preselected.
export async function createEmulatorLucid() {
  const ACCOUNT_0 = await generateEmulatorAccount({ lovelace: 7_500_0000_000n });
  const ACCOUNT_1 = await generateEmulatorAccount({ lovelace: 100_000_000n });
  const ACCOUNT_2 = await generateEmulatorAccount({ lovelace: 10_000_000n });
  const ACCOUNT_3 = await generateEmulatorAccount({ lovelace: 10_000_000n });

  const emulator = new Emulator([ACCOUNT_0, ACCOUNT_1]);
  const lucid = await Lucid.new(emulator);
  lucid.selectWalletFromSeed(ACCOUNT_0.seedPhrase);

  const utxos = await lucid.wallet.getUtxos();
  expect(utxos.length > 0, 'Wallet must have at least one UTXO for this test');
  const seedUtxo = utxos[0];

  return {
    lucid,
    accounts: [ACCOUNT_0, ACCOUNT_1, ACCOUNT_2, ACCOUNT_3],
    seedUtxo,
  };
}

export async function applyTx(lucid: Lucid, tx: Tx, cache: ScriptCache) {
  const txHash = await submit(tx);
  await lucid.awaitTx(txHash);

  // Use cache utils to check to tokens were distributed as expected
  const stateUtxo = await fetchStateUtxo(cache);
  expect(stateUtxo, 'Must be a state utxo');

  const infoUtxo = await fetchInfoUtxo(cache);
  expect(infoUtxo, 'Must be an info utxo.');

  const { utxo: ownerUtxo } = await fetchOwnerUtxo(cache);
  expect(ownerUtxo, 'Must have found the owner utxo');

  const state = await extractCollectionState(lucid, stateUtxo!);

  const info = await extractCollectionInfo(lucid, infoUtxo!);

  return { txHash, stateUtxo, ownerUtxo, infoUtxo, state, info };
}

let nftId = 0;
export function generateNft(): MintunNft {
  const id = '#' + nftId.toString().padStart(4, '0');
  nftId += 1;

  return {
    name: `Generated ${id}`,
    image: `https://picsum.photos/200`,
    description: 'This is a generated test NFT',
    id,
    files: [{
      name: `Image ${id}`,
      mediaType: 'image/jpeg',
      src: 'https://picsum.photos/200',
      dimension: { width: 200, height: 200 },
      purpose: 'General',
    }],
    attributes: {
      test: 1,
    },
    tags: ['generated', 'test'],
  };
}
