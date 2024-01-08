import { Data, fromText, toText } from 'lucid';
import { asChunkedHex, toJoinedText } from './utils.ts';

/// Image purpose are hints at how the creator inteded the image to be used
export const IMAGE_PURPOSE = {
  Thumbnail: 'Thumbnail',
  Banner: 'Banner',
  Avatar: 'Avatar',
  Gallery: 'Gallery',
  General: 'General',
} as const;

export type ImagePurpose = keyof typeof IMAGE_PURPOSE;

/// On chain data schema for image purpose
export const CollectionImagePurposeSchema = Data.Enum([
  Data.Literal(IMAGE_PURPOSE.Thumbnail),
  Data.Literal(IMAGE_PURPOSE.Banner),
  Data.Literal(IMAGE_PURPOSE.Avatar),
  Data.Literal(IMAGE_PURPOSE.Gallery),
  Data.Literal(IMAGE_PURPOSE.General),
]);

/// Onchain data schema for image dimensions
export const CollectionImageDimensionsSchema = Data.Object({
  width: Data.Integer({ minimum: 1 }),
  height: Data.Integer({ minimum: 1 }),
});

// On chain data schema for a collection image with hints
export const CollectionImageSchema = Data.Object({
  purpose: CollectionImagePurposeSchema,
  dimensions: CollectionImageDimensionsSchema,
  media_type: Data.Bytes(),
  src: Data.Array(Data.Bytes()),
});

export type CollectionImageType = Data.Static<typeof CollectionImageSchema>;
export const CollectionImageShape = CollectionImageSchema as unknown as CollectionImageType;

/// On chain schema for the collection market information.
/// TBD: May be better left as a Map<string, Data>
export const CollectionInfoSchema = Data.Object({
  artist: Data.Nullable(Data.Bytes()),
  project: Data.Nullable(Data.Bytes()),
  nsfw: Data.Boolean(),
  description: Data.Array(Data.Bytes()),
  images: Data.Array(CollectionImageSchema),
  attributes: Data.Array(Data.Bytes()),
  tags: Data.Array(Data.Bytes()),
  website: Data.Array(Data.Bytes()),
  social: Data.Map(Data.Bytes(), Data.Array(Data.Bytes())),
  extra: Data.Any(),
});

export type CollectionInfoType = Data.Static<typeof CollectionInfoSchema>;
export const CollectionInfoShape = CollectionInfoSchema as unknown as CollectionInfoType;

/// Width height of an image in pixels
export type ImageDimensionsType = {
  width: number;
  height: number;
};

/// An image with hints for its format, purpose, and dimensions
export type CollectionImage = {
  purpose: ImagePurpose;
  dimensions: ImageDimensionsType;
  mediaType: string;
  src: string;
};

/// The collection information in offchain format.
export type CollectionInfo = {
  artist?: string;
  project?: string;
  nsfw: boolean;
  description?: string;
  images?: CollectionImage[];
  attributes?: string[];
  tags?: string[];
  website?: string;
  social?: Record<string, string>;
  extra?: unknown;
};

export function asChainCollectionImage(image: CollectionImage): CollectionImageType {
  const purpose = image.purpose;
  const dimensions = { width: BigInt(image.dimensions.width), height: BigInt(image.dimensions.height) };
  const media_type = fromText(image.mediaType);
  const src = asChunkedHex(image.src);

  return {
    purpose,
    dimensions,
    media_type,
    src,
  };
}

export function toCollectionImage(chainImage: CollectionImageType): CollectionImage {
  const purpose = chainImage.purpose;
  const dimensions = { width: Number(chainImage.dimensions.width), height: Number(chainImage.dimensions.height) };
  const mediaType = toText(chainImage.media_type);
  const src = toJoinedText(chainImage.src);

  return {
    purpose,
    dimensions,
    mediaType,
    src,
  };
}

export function asChainCollectionInfo(info: CollectionInfo): CollectionInfoType {
  const artist = info.artist ? fromText(info.artist) : null;
  const project = info.project ? fromText(info.project) : null;
  const nsfw = info.nsfw ? true : false;
  const description = info.description ? asChunkedHex(info.description) : [];
  const images = info.images ? info.images.map(asChainCollectionImage) : [];
  const attributes = info.attributes ? info.attributes.map(fromText) : [];
  const tags = info.tags ? info.tags.map(fromText) : [];
  const website = info.website ? asChunkedHex(info.website) : [];
  const social = new Map<string, string[]>();
  if (info.social) {
    for (const [key, value] of Object.entries(info.social)) {
      social.set(fromText(key), asChunkedHex(value));
    }
  }

  const extra = '';

  return {
    artist,
    project,
    nsfw,
    description,
    images,
    attributes,
    tags,
    website,
    social,
    extra,
  };
}

export function toCollectionInfo(chainInfo: CollectionInfoType): CollectionInfo {
  const artist = chainInfo.artist ? toText(chainInfo.artist) : undefined;
  const project = chainInfo.project ? toText(chainInfo.project) : undefined;
  const nsfw = chainInfo.nsfw;
  const description = chainInfo.description.length ? toJoinedText(chainInfo.description) : undefined;
  const images = chainInfo.images.length ? chainInfo.images.map(toCollectionImage) : undefined;
  const attributes = chainInfo.attributes.length ? chainInfo.attributes.map(toText) : undefined;
  const tags = chainInfo.tags ? chainInfo.tags.map(toText) : undefined;
  const website = chainInfo.website.length ? toJoinedText(chainInfo.website) : undefined;

  let social: Record<string, string> | undefined = undefined;
  if (chainInfo.social) {
    social = {};

    for (const [key, value] of Object.entries(chainInfo.social)) {
      social[toText(key)] = toJoinedText(value);
    }
  }

  const extra = Data.to(Data.void());

  return {
    artist,
    project,
    nsfw,
    description,
    images,
    attributes,
    tags,
    website,
    social,
    extra,
  };
}
