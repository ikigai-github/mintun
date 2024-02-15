import "dotenv/config";
import { Network } from "lucid-cardano";

export function getBlockfrostId() {
  return process.env["BLOCKFROST_PROJECT_ID"];
}

export function getCardanoNetwork() {
  return process.env["CARDANO_NETWORK"] as Network;
}

export function getBlockfrostUrl() {
  const network = getCardanoNetwork();
  return `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
}

export function getWalletSigningKey() {
  return process.env["WALLET_SIGNING_KEY"];
}
