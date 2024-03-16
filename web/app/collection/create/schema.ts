import {
  array,
  boolean,
  date,
  enum_,
  Input,
  instance,
  literal,
  maxLength,
  maxSize,
  maxValue,
  mimeType,
  minLength,
  minValue,
  number,
  object,
  optional,
  regex,
  string,
  union,
} from 'valibot';

export const DescribeCollectionSchema = object({
  collection: string([
    minLength(3, 'The collection must have a name of at least 3 characters'),
    maxLength(64, 'Collection name cannot be more than 64 characters'),
  ]),
  artist: optional(string()),
  project: optional(string()),
  description: optional(string()),
  nsfw: boolean(),
});

export const DataContract = {
  Immutable: 'IMMUTABLE',
  Evolvable: 'MUTABLE',
} as const;

export const ConfigureContractSchema = object({
  contract: enum_(DataContract),
  window: optional(
    object({
      from: date(),
      to: date(),
    })
  ),
  maxTokens: optional(number([minValue(0)])),
  group: optional(
    union([
      string('Policy ID of group must be a 28 byte (56 character) hex string', [
        minLength(56),
        maxLength(56),
        regex(/[a-fA-F0-9]+/),
      ]),
      literal(''),
    ])
  ),
});

const RoyaltySchema = object({
  address: string('Address not in string format', [minLength(1)]), // TODO: Should we have a regex or min length for this?
  percentage: number('Percentage not in number format', [maxValue(100), minValue(0.01)]),
});

export const RoyaltiesSchema = object({
  royalties: array(RoyaltySchema),
});

const ImageSchema = object({
  src: string('Image not in string format', [minLength(1)]),
  mime: string('Mime not in string format', [minLength(1)]),
  width: number('Width not in number format', [minValue(1)]),
  height: number('Height not in number format', [minValue(1)]),
});

const ImageTypeSchema = object({
  banner: ImageSchema,
  avatar: ImageSchema,
  thumbnail: ImageSchema,
});

export const UploadImageSchema = object({
  // TODO: Upload images and save the uploaded image info into state
  desktop: ImageTypeSchema,
  tablet: ImageTypeSchema,
  mobile: ImageTypeSchema,
});

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

export type ParentSubmitForm = {
  handleSubmit: () => Promise<boolean>;
};

export type DescribeCollectionData = Input<typeof DescribeCollectionSchema>;
export type ConfigureContractData = Input<typeof ConfigureContractSchema>;
export type UploadImageData = Input<typeof UploadImageSchema>;
export type ImageType = Input<typeof ImageTypeSchema>;
export type ImageU = Input<typeof ImageSchema>;
export type Royalty = Input<typeof RoyaltySchema>;
export type RoyaltiesData = Input<typeof RoyaltiesSchema>;
