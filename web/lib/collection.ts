import type { CollectionInfo } from '@ikigai-github/mintun-offchain';
import type { Lucid } from 'lucid-cardano';

const ownerAssetName = '0006f0a000436f6c6c656374696f6e';
const referenceAssetName = '000643b000436f6c6c656374696f6e';

export type CollectionInfoWithPolicy = CollectionInfo & { policyId: string };

export async function getAllWalletCollections(lucid: Lucid) {
  const offchain = await import('@ikigai-github/mintun-offchain');

  let infos: CollectionInfoWithPolicy[] = [];
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
        const utxo = await lucid.utxoByUnit(unit);
        const info = await offchain.extractCollectionInfo(lucid, utxo);
        const policyId = unit.slice(0, 56);
        infos.push({ ...info, policyId });
      } catch (err) {
        console.log(err);
      }
    })
  );

  return infos;
}
