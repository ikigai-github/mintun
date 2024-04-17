'use client';

import { useCallback, useMemo, useState } from 'react';
import type { CollectionImage, ImagePurpose } from '@ikigai-github/mintun-offchain';
import { getTime, min } from 'date-fns';
import type { Lucid } from 'lucid-cardano';

import { countImages } from '@/lib/image';
import { createWebClient } from '@/lib/storage/client';
import { useWallet } from '@/lib/wallet';

import { useCreateCollectionContext } from './context';
import { DataContract } from './schema';

export default function useGenesisMint() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { contract, images, describe, social, traits, royalties } = useCreateCollectionContext();
  const { lucid } = useWallet();
  const numImages = useMemo(() => countImages(images), [images]);

  // Selects a random UTxO from the users wallet for use as the seed UTxO
  const findSeed = useCallback(async (lucid: Lucid) => {
    const utxos = await lucid.wallet.getUtxos();
    if (utxos.length === 0) {
      throw Error('Not enough funds in wallet to complete the mint');
    }
    return utxos[Math.floor(Math.random() * utxos.length)];
  }, []);

  // Iterates through all the set images and uploads them to a directory in IPFS.
  // While the upload is in progress it updates a progress state so that UI can
  // display progress if desired.
  const uploadImages = useCallback(async () => {
    if (numImages) {
      setUploadProgress(0);

      const client = await createWebClient();
      const uploaded: CollectionImage[] = [];
      const files: File[] = [];
      for (const [mode, values] of Object.entries(images)) {
        for (const [purpose, detail] of Object.entries(values)) {
          if (detail) {
            const fileName =
              mode === 'desktop'
                ? `${purpose.toLowerCase()}.${detail.ext}`
                : `${mode}/${purpose.toLowerCase()}.${detail.ext}`;
            const file = new File([detail.file], fileName, { type: detail.mime });
            files.push(file);

            uploaded.push({
              purpose: purpose as ImagePurpose,
              dimension: { width: detail.width, height: detail.height },
              mediaType: detail.mime,
              src: `ipfs://<cid>/${fileName}`,
            });
          }
        }
      }

      const result = await client.uploadDirectory(files, {
        onUploadProgress: (status) => {
          setUploadProgress((status.loaded * 100) / status.total);
        },
      });

      const cid = result.toString();
      uploaded.forEach((item) => (item.src = item.src.replace('<cid>', cid)));

      setUploadProgress(1);

      return uploaded;
    }

    setUploadProgress(100);
    return [];
  }, [images, setUploadProgress, numImages]);

  // Finds the seed, uploads images, and imports offchain in parallel. Then it builds the transaction.
  // It doesn't catch any thrown errors so higher level can manage that part.
  const prepareTx = useCallback(async () => {
    if (!lucid) {
      throw Error('Failed to connect to wallet API');
    }

    if (!lucid.wallet) {
      throw Error('Wallet is not selected. Please reconnect a wallet');
    }

    const find = findSeed(lucid);
    const upload = uploadImages();
    const offchain = import('@ikigai-github/mintun-offchain');
    const [seed, uploaded, { GenesisTxBuilder }] = await Promise.all([find, upload, offchain]);

    const builder = GenesisTxBuilder.create(lucid).seed(seed).useCip88(true);

    if (contract.maxTokens) {
      builder.maxNfts(contract.maxTokens);
    }

    if (contract.window) {
      const fromMs = getTime(contract.window.from);
      const toMs = getTime(contract.window.to);
      builder.mintWindow(fromMs, toMs);
    }

    if (contract.contract === DataContract.Immutable) {
      builder.useImmutableNftValidator();
    } else {
      builder.usePermissiveNftValidator();
    }

    builder.info({
      name: describe.collection,
      artist: describe.artist,
      project: describe.project,
      nsfw: describe.nsfw,
      description: describe.description,
      images: [...uploaded],
      links: { ...social },
      traits: [...traits],
    });

    for (const { address, percent, minFee, maxFee } of royalties) {
      builder.royalty(address, Number(percent), minFee || undefined, maxFee || undefined);
    }

    const { tx } = await builder.build();

    return tx;
  }, [lucid, contract, describe, social, traits, royalties, findSeed, uploadImages]);

  return {
    uploadProgress,
    numImages,
    prepareTx,
  };
}
