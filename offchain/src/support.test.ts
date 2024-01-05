import { assert } from 'std/assert/mod.ts';
import { Assets, Emulator, generateSeedPhrase, Lucid, UTxO } from 'lucid';
// import { prepareStateMintTx } from './state-mint.ts';
// import { submit } from './utils.ts';

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

  return {
    lucid,
    accounts: [ACCOUNT_0, ACCOUNT_1, ACCOUNT_2, ACCOUNT_3],
  };
}

// export async function mintStateToken(lucid: Lucid, seedUtxo: UTxO, recipientAddress: string) {
//   // Build and submit the minting transaction
//   const { tx, stateMint, stateValidator, batchMint, unit } = prepareStateMintTx(
//     lucid,
//     seedUtxo,
//     recipientAddress,
//   );
//   const txHash = await submit(tx);
//   await lucid.awaitTx(txHash);

//   // Fetch the utxos at the recipient address
//   const recipientUtxos = await lucid.utxosAt(recipientAddress);

//   // Verify user token was received
//   const stateUserUtxo = recipientUtxos.find((utxo) => utxo.assets[unit.user]);
//   assert(stateUserUtxo);

//   const validatorUtxos = await lucid.utxosAt(stateValidator.address);

//   // Verify reference token was received
//   const stateReferenceUtxo = validatorUtxos.find((utxo) => utxo.assets[unit.reference]);
//   assert(stateReferenceUtxo);

//   return {
//     stateMint,
//     stateValidator,
//     batchMint,
//     unit,
//     stateUserUtxo,
//     stateReferenceUtxo,
//   };
// }
