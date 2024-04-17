import { Network } from 'lucid-cardano';

export async function createServerClient(network: Network) {
  const { Lucid, Blockfrost } = await import('lucid-cardano');
  const url = `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
  const provider = new Blockfrost(url);

  return await Lucid.new(provider, network);
}
