// TODO: Running this stuff from server side doesn't work even with the lazy import
//       Ideally would just replace lucid since it is no longer maintained.
//       But that requires basically rewriting the offchain library so will wait till after MVP.
import type { Network } from 'lucid-cardano';

export async function createServerClient(network: Network) {
  const { Lucid, Blockfrost } = await import('lucid-cardano');
  const url = `https://cardano-${network.toLowerCase()}.blockfrost.io/api/v0`;
  const key =
    network.toLowerCase() === 'mainnet'
      ? process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET
      : process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD;

  const provider = new Blockfrost(url, key);

  return await Lucid.new(provider, network);
}

function isNetwork(str: string): str is Network {
  const lower = str.toLowerCase();
  return lower === 'mainnet' || lower === 'preprod' || lower === 'Preview';
}

export async function fetchCollection(network: string, policyId: string) {
  if (!isNetwork(network)) {
    throw new Error(`Unknown network: ${network}`);
  }

  const offchain = await import('@ikigai-github/mintun-offchain');
  const lucid = await createServerClient(network);
  const { cache, state } = await offchain.ScriptCache.fromMintPolicyId(lucid, policyId);
  const mintReferenceUtxo = await offchain.fetchMintingPolicyReferenceUtxo(cache);
  const info = await offchain.fetchCollectionInfo(cache);

  return { state, info, mintReferenceUtxo };
}
