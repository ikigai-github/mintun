import { load } from 'std/dotenv/mod.ts';
import { Network } from 'lucid';

const env = await load();

export function getBlockfrostId() {
  return env['BLOCKFROST_PROJECT_ID'];
}

export function getCardanoNetwork() {
  return env['CARDANO_NETWORK'] as Network;
}

export function getBlockfrostUrl() {
  const network = getCardanoNetwork();
  return `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
}

export function getWalletSigningKey() {
  return env['WALLET_SIGNING_KEY'];
}
