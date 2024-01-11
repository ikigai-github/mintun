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

export function addCip27RoyaltyToTransaction(tx: Tx, policyId: string, royalty: Royalty, redeemer?: string) {
  const { variableFee, address, minFee, maxFee } = royalty;

  if (maxFee !== undefined || minFee !== undefined) {
    throw new Error('CIP-27 royalties do not support min/max fee');
  }

  const cip27Unit = policyId; // Asset name is null
  const cip27Asset = { [cip27Unit]: 1n };
  const cip27Metadata = toCip27Metadata(variableFee, address);

  // Note: Must be first minted token so this should have been the first asset to be minted
  tx.attachMetadata(CIP_27_METADATA_LABEL, cip27Metadata).mintAssets(cip27Asset, redeemer);
}
