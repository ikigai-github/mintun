/// TODO: Just import this section from offchain/image.ts  library once I have integrated it.

import { CollectionInfo } from '@ikigai-github/mintun-offchain';
import { blob, Input, maxSize, mimeType, minLength, minValue, number, object, string, union } from 'valibot';

export const ImageSchema = object({
  src: string('Image not in string format', [minLength(1)]),
  mime: string('Mime not in string format', [minLength(1)]),
  width: number('Width not in number format', [minValue(1)]),
  height: number('Height not in number format', [minValue(1)]),
});

export const ImageDetailSchema = object({
  data: union([
    blob('Please select an image', [
      mimeType(['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp'], 'Please select an image'),
      maxSize(1024 * 1024 * 10, 'Please select a file smaller than 10 MB.'),
    ]),
    string([minLength(1, 'Please select an image')]),
  ]),
  preview: string(),
  width: number(),
  height: number(),
  mime: string(),
  ext: string(),
  name: string(),
});

export type ImageData = Input<typeof ImageSchema>;
export type ImageDetail = Input<typeof ImageDetailSchema>;

// Because we lazy import offchain to prevent issues with wasm loading
// this is redefined here for now.
export const ImagePurpose = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Brand: 'Brand',
  Gallery: 'Gallery',
  General: 'General',
} as const;

export type ImagePurposeType = keyof typeof ImagePurpose;

export type ImageViewMode = 'desktop' | 'tablet' | 'mobile';

export type SupportedPurpose = Exclude<ImagePurposeType, 'Gallery' | 'General'>;

export type ImageLookup = {
  [key in ImageViewMode]: {
    [key in SupportedPurpose]?: ImageDetail;
  };
};

export const DefaultImageDetail: ImageDetail = {
  data: '',
  preview: '',
  mime: '',
  ext: '',
  width: 0,
  height: 0,
  name: '',
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

export function getWebImageUrl(url: string | undefined) {
  if (url === undefined || url === '') {
    return '';
  } else if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image')) {
    return url;
  } else if (url.startsWith('ar://')) {
    const id = url.substring(5);
    return `https://arweave.net/${id}`;
  } else {
    const cid = url.replaceAll('ipfs://ipfs/', '').replaceAll('ipfs://', '');
    // TODO: This should be a w3s.link instead of re-using pinata
    return `https://ipfs.grabbit.market/ipfs/${cid}?pinataGatewayToken=aIEWTKfwAwdmav4oVVCCQLMokn4yliahcmeF4KLyiFm5J8-luyvpvtevnzWwYvQY`;
  }
}

export function getCollectionImageSrc(collection: CollectionInfo) {
  const image =
    collection.images?.find((image) => image.purpose === 'Brand' || image.purpose === 'Thumbnail') ||
    collection.images?.[0];

  return getWebImageUrl(image?.src);
}
