import { useCallback, useState } from 'react';

import { getWebImageUrl, ImageDetail } from '@/lib/image';
import { createWebClient } from '@/lib/storage/client';

import { useManageCollectionContext } from './context';
import { DraftTokenData } from './types';

export default function useSaveDraft(uid: string) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { setDrafts } = useManageCollectionContext();

  const uploadImages = useCallback(
    async (images: Record<string, ImageDetail>) => {
      const client = await createWebClient();
      const files: File[] = [];
      const uploaded: Record<string, ImageDetail> = {};
      for (const key in images) {
        const image = images[key];
        // Only upload images that are not already uploaded
        if (typeof image.data !== 'string') {
          const fileName = `${image.name}.${image.ext}`;
          const file = new File([image.data], fileName, { type: image.mime });
          files.push(file);

          uploaded[key] = { ...image, data: `ipfs://<cid>/${fileName}` };
        } else {
          uploaded[key] = { ...image };
        }
      }

      if (files.length) {
        const result = await client.uploadDirectory(files, {
          onUploadProgress: (status) => {
            setUploadProgress((status.loaded * 100) / status.total);
          },
        });

        const cid = result.toString();
        for (const key in uploaded) {
          const image = uploaded[key];
          if (typeof image.data === 'string') {
            image.data = image.data.replace('<cid>', cid);
            image.preview = getWebImageUrl(image.data);
          }
        }

        setUploadProgress(1);

        return uploaded;
      }

      setUploadProgress(1);
      return images;
    },
    [setUploadProgress]
  );

  const saveDraft = useCallback(
    async (draft: DraftTokenData) => {
      const images: Record<string, ImageDetail> = {};
      images.image = draft.image;
      // TODO: Either call thumbnail api here or figure out a way to use the builtin next process for optimizing images to get a thumbnail
      const uploaded = await uploadImages(images);

      const uploadedDraft = {
        ...draft,
        ...uploaded,
      };

      setDrafts((drafts) => {
        const index = drafts.findIndex((draft) => draft.uid == uid);
        if (index >= 0) {
          return drafts.toSpliced(index, 1, uploadedDraft);
        } else {
          return [uploadedDraft, ...drafts];
        }
      });
    },
    [setDrafts, uid, uploadImages]
  );

  return {
    saveDraft,
    uploadProgress,
  };
}
