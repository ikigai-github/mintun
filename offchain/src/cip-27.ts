import { Tx } from 'lucid';
import { Royalty } from './royalty.ts';
import { chunk } from './utils.ts';

export const CIP_27_METADATA_LABEL = 777;

export type Cip27Metadata = {
  rate: number;
  addr: string | string[];
};

export function toCip27Metadata(percentage: number, address: string) {
  const rate = `${(percentage / 100)}`;
  const addr = address.length > 64 ? chunk(address) : address;

  return { rate, addr };
}

export function addCip27RoyaltyToTransaction(tx: Tx, policyId: string, royalties: Royalty[], redeemer?: string) {
  if (royalties.length > 1) {
    throw new Error('CIP-27 royalties only support one beneficiary');
  }

  const { percentFee, address, minFee, maxFee } = royalties[0];

  if (maxFee !== undefined || minFee !== undefined) {
    throw new Error('CIP-27 royalties do not support min/max fee');
  }

  const cip27Unit = policyId; // Asset name is null
  const cip27Asset = { [cip27Unit]: 1n };
  const cip27Metadata = toCip27Metadata(percentFee, address);

  // Must be first minted token so directly call mintAssets rather than adding to assets object
  // TODO: verify calling mintAssets here guarantees this gets the 0th index in the mint.
  // TODO: Also verify it is okay to pass the same redeemer multiple times.
  // TODO: Alternatively could call mint assets once if there is some internal sort that orders asset by name
  tx.attachMetadata(CIP_27_METADATA_LABEL, cip27Metadata).mintAssets(cip27Asset, redeemer);
}
