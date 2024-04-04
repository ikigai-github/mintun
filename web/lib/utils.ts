import { CollectionInfo } from '@ikigai-github/mintun-offchain';
import { clsx, type ClassValue } from 'clsx';
import type { Lucid } from 'lucid-cardano';
import { twMerge } from 'tailwind-merge';

import { ownerAssetName, referenceAssetName } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeout<T>(promise: Promise<T>, timeoutMs: number, reason?: string): Promise<T> {
  const timeoutPromise = new Promise<T>((_resolve, reject) => {
    setTimeout(() => reject(reason || 'Timed out waiting for promise'), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

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
