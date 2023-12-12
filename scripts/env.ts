import { load } from "https://deno.land/std@0.208.0/dotenv/mod.ts";
import { Network } from "https://deno.land/x/lucid@0.10.7/mod.ts";

const env = await load();


export function getBlockfrostId() {
  return env['BLOCKFROST_PROJECT_ID'];
}

export function getCardanoNetwork() {
  return env['CARDANO_NETWORK'] as Network;
}

export function getBlockfrostUrl() {
  const network = getCardanoNetwork();
  return `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`
}

export function getWalletAddress() {
  return env['WALLET_ADDRESS'];
}

export function getWalletSigningKey() {
  return env['WALLET_SIGNING_KEY'];
}