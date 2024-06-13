import type { CollectionInfo } from '@ikigai-github/mintun-offchain';
import type { Lucid } from 'lucid-cardano';

import { fetchTransactions } from './lucid/server';

const ownerAssetName = '0006f0a000436f6c6c656374696f6e';
const referenceAssetName = '000643b000436f6c6c656374696f6e';

export type CollectionInfoExtended = CollectionInfo & { policyId: string; blockTime: number };

export async function getAllWalletCollections(lucid: Lucid) {
  const offchain = await import('@ikigai-github/mintun-offchain');

  let infos: CollectionInfoExtended[] = [];
  let units: string[] = [];

  const utxos = await lucid.wallet.getUtxos();

  // Switching owner with reference asset name
  utxos?.forEach((utxo) => {
    const keys = Object.keys(utxo.assets);
    new Set([...keys]).forEach((key) => {
      if (key.endsWith(ownerAssetName)) {
        const unit = key.replace(ownerAssetName, referenceAssetName);
        units.push(unit);
      }
    });
  });
  await Promise.allSettled(
    units?.map(async (unit) => {
      try {
        const transactions = await fetchTransactions(lucid.network, unit);
        const blockTime = transactions[0]?.block_time || 0;
        const utxo = await lucid.utxoByUnit(unit);
        const info = await offchain.extractCollectionInfo(lucid, utxo);
        const policyId = unit.slice(0, 56);
        infos.push({ ...info, policyId, blockTime });
      } catch (err) {
        console.log(err);
      }
    })
  );

  return infos.sort((a, b) => b.blockTime - a.blockTime);
}
