/// TODO: Just import this section from offchain/image.ts  library once I have integrated it.

import { CollectionInfo } from '@ikigai-github/mintun-offchain';

/////////////////////////////
export const ImagePurpose = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Brand: 'Brand',
  Gallery: 'Gallery',
  General: 'General',
} as const;

export type ImagePurposeType = keyof typeof ImagePurpose;

export type ImageDetail = {
  file: File;
  preview: string;
  width: number;
  height: number;
  mime: string;
  ext: string;
};

export type ImageViewMode = 'desktop' | 'tablet' | 'mobile';

export type SupportedPurpose = Exclude<ImagePurposeType, 'Gallery' | 'General'>;

export type ImageLookup = {
  [key in ImageViewMode]: {
    [key in SupportedPurpose]?: ImageDetail;
  };
};

export function countImages(lookup: ImageLookup) {
  return Object.values(lookup).reduce(
    (acc, curr) => acc + Object.values(curr).reduce((acc, curr) => acc + (curr != null ? 1 : 0), 0),
    0
  );
}

export function getPreviews(lookup: ImageLookup) {
  return Object.values(lookup)
    .flatMap((values) => Object.values(values))
    .filter((value) => value != null)
    .map((value) => value?.preview);
}

export function ipfsToUrl(ipfs: string | undefined) {
  return `https://w3s.link/ipfs/${ipfs?.split('ipfs://').join('')}`;
}

export function getCollectionImageSrc(collection: CollectionInfo) {
  const image =
    collection.images?.find((image) => image.purpose === 'Brand' || image.purpose === 'Thumbnail') ||
    collection.images?.[0];

  return ipfsToUrl(image?.src);
}
