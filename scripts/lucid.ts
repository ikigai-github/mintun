import {
  Assets,
  Blockfrost,
  Credential,
  Emulator,
  Lucid,
  Script,
  Tx,
  UTxO,
  applyDoubleCborEncoding,
  generateSeedPhrase
} from "https://deno.land/x/lucid@0.10.7/mod.ts";
import { getBlockfrostId, getBlockfrostUrl, getCardanoNetwork, getWalletSigningKey } from "./env.ts";

/// All the parts commonly used when dealing with a paramaterized script
export type ValidatorInfo = {
  policy: Script,
  policyId: string,
  credential: Credential
  address: string,
}

/// Simple form of UTxO that only includes part needed to reference a transaction
export type TxReference = {
  hash: string,
  index: number
}

/// Small utility to convert a full UTxO into a transaction reference
export function toTxReference(utxo: UTxO): TxReference {
  return { 
    hash: utxo.txHash,
    index: utxo.outputIndex
  }
}

/// Instantiates an instance of lucid with Blockfrost as the provider
export async function createLucid() {
  const network = getCardanoNetwork();
  const blockfrost = new Blockfrost(getBlockfrostUrl(), getBlockfrostId());
  const lucid = await Lucid.new(blockfrost, network);
  lucid.selectWalletFromPrivateKey(getWalletSigningKey());

  return lucid;
}

/// Creates a new emulator account with the given assets, if any.
export async function generateEmulatorAccount(assets: Assets = {}) {
  const seedPhrase = generateSeedPhrase();
  return {
    seedPhrase,
    address: await (await Lucid.new(undefined, "Custom"))
      .selectWalletFromSeed(seedPhrase).wallet.address(),
    assets,
  };
}

/// Instantiates an instace of Lucid with an Emulator as the provider.  The emulator is seeded with two starting accounts with one of them preselected.
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

// Utility function for completing a transaction, signing it, and then submitting it.
export async function submit(tx: Tx) {
  const completed = await tx.complete();
  const signed = await completed.sign().complete();
  return await signed.submit();
}

// Utility function for grabbing commonly needed information about a validator (or minting policy)
export function getValidatorInfo(lucid: Lucid, paramaterizedScript: string): ValidatorInfo {
  const policy: Script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(paramaterizedScript)
  }

  const policyId = lucid.utils.validatorToScriptHash(policy);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);

  return {
    policy,
    policyId,
    credential,
    address
  }
}