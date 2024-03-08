import { blob, enum_, Input, instance, maxSize, mimeType, object, optional, string, url } from 'valibot';

/// TODO: Just import this section from offchain/image.ts  library once I have integrated it.
/////////////////////////////
export const ImagePurpose = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Avatar: 'Avatar',
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

const SupportedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg',
  'image/svg+xml',
] as const;

const FileImageSchema = instance(File, [
  mimeType(['image/jpeg', 'image/png', 'image/png', 'image/gif', 'image/webp', 'image/svg', 'image/svg+xml']),
  maxSize(1024 * 1024 * 10),
]);

export const AddImageSchema = object({
  purpose: enum_(ImagePurpose),
  url: string([url()]),
});

export type AddImageData = Input<typeof AddImageSchema>;
