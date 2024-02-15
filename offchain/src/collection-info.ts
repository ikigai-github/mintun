import { Data, fromText, Lucid, toText, UTxO } from 'lucid-cardano';
import { asChunkedHex, toJoinedText } from './utils';
import { IMAGE_PURPOSE, ImageDimension, ImagePurpose } from './image';
import { createReferenceData } from './cip-68';

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
  dimension: CollectionImageDimensionsSchema,
  media_type: Data.Bytes(),
  src: Data.Array(Data.Bytes()),
});

export type CollectionImageType = Data.Static<typeof CollectionImageSchema>;
export const CollectionImageShape = CollectionImageSchema as unknown as CollectionImageType;

/// On chain schema for the collection market information.
export const CollectionInfoSchema = Data.Object({
  name: Data.Bytes(),
  artist: Data.Nullable(Data.Bytes()),
  project: Data.Nullable(Data.Bytes()),
  nsfw: Data.Boolean(),
  description: Data.Array(Data.Bytes()),
  images: Data.Array(CollectionImageSchema),
  links: Data.Map(Data.Bytes(), Data.Array(Data.Bytes())),
  extra: Data.Map(Data.Bytes(), Data.Any()),
});

export type CollectionInfoType = Data.Static<typeof CollectionInfoSchema>;
export const CollectionInfoShape = CollectionInfoSchema as unknown as CollectionInfoType;

export const CollectionInfoMetadataSchema = Data.Object({
  metadata: CollectionInfoSchema,
  version: Data.Integer({ minimum: 1 }),
  extra: Data.Any(),
});
export type CollectionInfoMetadataType = Data.Static<typeof CollectionInfoMetadataSchema>;
export const CollectionInfoMetadataShape = CollectionInfoMetadataSchema as unknown as CollectionInfoMetadataType;

/// An image with hints for its format, purpose, and dimensions
export type CollectionImage = {
  purpose: ImagePurpose;
  dimension: ImageDimension;
  mediaType: string;
  src: string;
};

/// The collection information in offchain format.
export type CollectionInfo = {
  name: string;
  artist?: string;
  project?: string;
  nsfw: boolean;
  description?: string;
  images?: CollectionImage[];
  links?: Record<string, string>;
  extra?: Record<string, unknown>;
};

export function asChainCollectionImage(image: CollectionImage): CollectionImageType {
  const purpose = image.purpose;
  const dimension = { width: BigInt(image.dimension.width), height: BigInt(image.dimension.height) };
  const media_type = fromText(image.mediaType);
  const src = asChunkedHex(image.src);

  return {
    purpose,
    dimension,
    media_type,
    src,
  };
}

export function toCollectionImage(chainImage: CollectionImageType): CollectionImage {
  const purpose = chainImage.purpose;
  const dimension = { width: Number(chainImage.dimension.width), height: Number(chainImage.dimension.height) };
  const mediaType = toText(chainImage.media_type);
  const src = toJoinedText(chainImage.src);

  return {
    purpose,
    dimension,
    mediaType,
    src,
  };
}

export function asChainCollectionInfo(info: CollectionInfo): CollectionInfoMetadataType {
  const name = fromText(info.name);
  const artist = info.artist ? fromText(info.artist) : null;
  const project = info.project ? fromText(info.project) : null;
  const nsfw = info.nsfw ? true : false;
  const description = info.description ? asChunkedHex(info.description) : [];
  const images = info.images ? info.images.map(asChainCollectionImage) : [];
  const links = new Map<string, string[]>();
  if (info.links) {
    for (const [key, value] of Object.entries(info.links)) {
      links.set(fromText(key), asChunkedHex(value));
    }
  }

  const extra = new Map<string, Data>();

  const metadata = {
    name,
    artist,
    project,
    nsfw,
    description,
    images,
    links,
    extra,
  };

  return createReferenceData(metadata);
}

export function toCollectionInfo(chainInfo: CollectionInfoMetadataType): CollectionInfo {
  const { metadata } = chainInfo;
  const name = toText(metadata.name);
  const artist = metadata.artist ? toText(metadata.artist) : undefined;
  const project = metadata.project ? toText(metadata.project) : undefined;
  const nsfw = metadata.nsfw;
  const description = metadata.description.length ? toJoinedText(metadata.description) : undefined;
  const images = metadata.images.length ? metadata.images.map(toCollectionImage) : undefined;

  let links: Record<string, string> | undefined = undefined;
  if (metadata.links) {
    links = {};

    for (const [key, value] of metadata.links) {
      links[toText(key)] = toJoinedText(value);
    }
  }

  let extra: Record<string, Data> | undefined = undefined;
  if (chainInfo.extra) {
    extra = {};

    for (const [key, value] of metadata.extra) {
      extra[toText(key)] = value;
    }
  }

  return {
    name,
    artist,
    project,
    nsfw,
    description,
    images,
    links,
    extra,
  };
}

// Decode CBOR datum of passed in UTxO and then convert the plutus data into offchain data
export async function extractCollectionInfo(lucid: Lucid, utxo: UTxO) {
  const chainInfo = await lucid.datumOf(utxo, CollectionInfoMetadataShape);
  return toCollectionInfo(chainInfo);
}
