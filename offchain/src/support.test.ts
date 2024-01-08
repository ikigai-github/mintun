import { assert } from 'std/assert/mod.ts';
import { Assets, Emulator, generateSeedPhrase, Lucid } from 'lucid';

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
  assert(utxos.length > 0, 'Wallet must have at least one UTXO for this test');
  const seedUtxo = utxos[0];

  return {
    lucid,
    accounts: [ACCOUNT_0, ACCOUNT_1, ACCOUNT_2, ACCOUNT_3],
    seedUtxo,
  };
}
