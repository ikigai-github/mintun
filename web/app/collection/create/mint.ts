'use client';

import { useEffect, useState } from 'react';
import { getTime } from 'date-fns';
import type { UTxO } from 'lucid-cardano';

import { createWebClient } from '@/lib/storage/client';
import { useWallet } from '@/lib/wallet';

import { useCreateCollectionContext } from './context';
import { DataContract, UploadImageData } from './schema';

export type MintStatus = 'initializing' | 'selecting' | 'uploading' | 'signing' | 'verifying' | 'failed';

export function useGenesisMint() {
  const [error, setError] = useState('');
  const [seed, setSeed] = useState<UTxO | null>(null);
  const [status, setStatus] = useState<MintStatus>('initializing');
  const [uploadPercent, setUploadPercent] = useState(0);

  const { contract, images } = useCreateCollectionContext();
  const { lucid } = useWallet();

  if (!lucid || !lucid.wallet) {
    setError('Failed to connect to wallet api');
    setStatus('failed');

    return {
      error,
      status,
      uploadPercent,
    };
  }

  // Select a seed from the wallet
  useEffect(() => {
    const findSeed = async () => {
      const utxos = await lucid.wallet.getUtxos();
      if (utxos.length === 0) {
        setError('Not enough funds in wallet to complete the mint');
        setStatus('failed');
        setSeed(null);
        throw Error('No UTxOs found in wallet');
      } else {
        const seed = utxos[Math.floor(Math.random() * utxos.length)];
        setSeed(seed);
      }
    };

    findSeed();
  }, [lucid, setError, setStatus, setSeed]);

  // In parallel upload the images
  useEffect(() => {
    uploadImages(images);
  }, [images]);

  lucid.wallet
    .getUtxos()
    .then((utxos) => {
      setStatus('selecting');
      if (utxos.length === 0) {
        setError('Not enough funds in wallet to complete the mint');
        setStatus('failed');
        throw Error('No UTxOs found in wallet');
      } else {
        return utxos[Math.floor(Math.random() * utxos.length)];
      }
    })
    .then(async (seed) => {
      // FIXME: Mixing async with promise is no bueno
      const { GenesisTxBuilder } = await import('@ikigai-github/mintun-offchain');
      const tx = GenesisTxBuilder.create(lucid).seed(seed);
      if (contract.maxTokens) {
        tx.maxNfts(contract.maxTokens);
      }

      if (contract.window) {
        const fromMs = getTime(contract.window.from);
        const toMs = getTime(contract.window.to);
        tx.mintWindow(fromMs, toMs);
      }

      if (contract.contract === DataContract.Immutable) {
        tx.useImmutableNftValidator(true);
      }
    });

  // const tx = GenesisTxBuilder.create(lucid)
  //   .seed(seedUtxo)
  //   .maxNfts(1)
  //   .mintWindow(0, endMs)
  //   .useImmutableNftValidator(true)
  //   .info(TEST_COLLECTION_INFO)
  //   .useCip27(true)
  //   .useCip88(true)
  //   .royalty(accounts[0].address, 1.0)
  //   .build();
}

async function uploadImages(images: UploadImageData) {
  const client = await createWebClient();
  // Restructure the file blobs into a directory structure like
  // /banner/default.jpg
  // /banner/mobile.jpg
  // /brand/b.jpg
  // etc...

  // Hook in that callback so we can display upload progress
  //client.uploadDirectory();
}
