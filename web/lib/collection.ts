import type { CollectionInfo } from '@ikigai-github/mintun-offchain';
import type { Lucid } from 'lucid-cardano';

const ownerAssetName = '0006f0a000436f6c6c656374696f6e';
const referenceAssetName = '000643b000436f6c6c656374696f6e';

export async function getCollectionsInfo(lucid: Lucid) {
  const offchain = await import('@ikigai-github/mintun-offchain');

  let collectionsInfo: CollectionInfo[] = [];
  let referenceCollectionUnits: string[] = [];

  const utxos = await lucid.wallet.getUtxos();

  // Switching owner with reference asset name
  utxos?.forEach((utxo) => {
    const keys = Object.keys(utxo.assets);
    new Set([...keys]).forEach((key) => {
      if (key.endsWith(ownerAssetName)) {
        const referenceUnit = key.replace(ownerAssetName, referenceAssetName);
        referenceCollectionUnits.push(referenceUnit);
      }
    });
  });
  await Promise.allSettled(
    referenceCollectionUnits?.map(async (unit) => {
      try {
        const utxo = await lucid.utxoByUnit(unit);
        const info = await offchain.extractCollectionInfo(lucid, utxo);
        collectionsInfo.push(info);
      } catch (err) {
        console.log(err);
      }
    })
  );

  return collectionsInfo;
}
