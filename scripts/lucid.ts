import {
Assets,
  Blockfrost,
  Emulator,
  Lucid,
  generateSeedPhrase
} from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { getBlockfrostId, getBlockfrostUrl, getCardanoNetwork, getWalletSigningKey } from "./env.ts";


export async function createLucid() {
  const network = getCardanoNetwork();
  const blockfrost = new Blockfrost(getBlockfrostUrl(), getBlockfrostId());
  const lucid = await Lucid.new(blockfrost, network);
  lucid.selectWalletFromPrivateKey(getWalletSigningKey());

  return lucid;
}

export async function generateEmulatorAccount(assets: Assets = {}) {
  const seedPhrase = generateSeedPhrase();
  return {
    seedPhrase,
    address: await (await Lucid.new(undefined, "Custom"))
      .selectWalletFromSeed(seedPhrase).wallet.address(),
    assets,
  };
}

export async function createEmulatorLucid() {
  const ACCOUNT_0 = await generateEmulatorAccount({ lovelace: 75000000000n });
  const ACCOUNT_1 = await generateEmulatorAccount({ lovelace: 100000000n });

  const emulator = new Emulator([ACCOUNT_0, ACCOUNT_1]);
  const lucid = await Lucid.new(emulator);
  lucid.selectWalletFromSeed(ACCOUNT_0.seedPhrase);

  return {
    lucid,
    accounts: [ACCOUNT_0, ACCOUNT_1]
  }
}
