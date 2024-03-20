/// TODO: Just import this section from offchain/image.ts  library once I have integrated it.
/////////////////////////////
export const ImagePurpose = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Brand: 'Brand',
  Gallery: 'Gallery',
  General: 'General',
} as const;

export type ImagePurposeType = keyof typeof ImagePurpose;

/// Width height of an image in pixels
export type ImageDimension = {
  width: number;
  height: number;
};
/////////////////////////////

export type WebImageData = {
  purpose: ImagePurposeType;
  dimension: ImageDimension;
  mediaType: string;
  src: string;
};
