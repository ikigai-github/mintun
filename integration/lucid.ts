/// Instantiates an instance of lucid with Blockfrost as the provider.

import { Blockfrost, Lucid } from "lucid-cardano";
import {
  getBlockfrostId,
  getBlockfrostUrl,
  getCardanoNetwork,
  getWalletSigningKey,
} from "./env";

/// The WALLET_SIGNING_KEY env variable is used to select the walelt
export async function createServiceLucid() {
  const network = getCardanoNetwork();
  const blockfrost = new Blockfrost(getBlockfrostUrl(), getBlockfrostId());
  const lucid = await Lucid.new(blockfrost, network);
  const key = getWalletSigningKey();

  lucid.selectWalletFromPrivateKey(key!);

  return lucid;
}
