import { Data, fromText, toText } from "lucid-cardano";
import { asChunkedHex, toJoinedText } from "./utils";
import { IMAGE_PURPOSE } from "./image";
import { createReferenceData } from "./cip-68";
const CollectionImagePurposeSchema = Data.Enum([
  Data.Literal(IMAGE_PURPOSE.Thumbnail),
  Data.Literal(IMAGE_PURPOSE.Banner),
  Data.Literal(IMAGE_PURPOSE.Avatar),
  Data.Literal(IMAGE_PURPOSE.Gallery),
  Data.Literal(IMAGE_PURPOSE.General)
]);
const CollectionImageDimensionsSchema = Data.Object({
  width: Data.Integer({ minimum: 1 }),
  height: Data.Integer({ minimum: 1 })
});
const CollectionImageSchema = Data.Object({
  purpose: CollectionImagePurposeSchema,
  dimension: CollectionImageDimensionsSchema,
  media_type: Data.Bytes(),
  src: Data.Array(Data.Bytes())
});
const CollectionImageShape = CollectionImageSchema;
const CollectionInfoSchema = Data.Object({
  name: Data.Bytes(),
  artist: Data.Nullable(Data.Bytes()),
  project: Data.Nullable(Data.Bytes()),
  nsfw: Data.Boolean(),
  description: Data.Array(Data.Bytes()),
  images: Data.Array(CollectionImageSchema),
  links: Data.Map(Data.Bytes(), Data.Array(Data.Bytes())),
  extra: Data.Map(Data.Bytes(), Data.Any())
});
const CollectionInfoShape = CollectionInfoSchema;
const CollectionInfoMetadataSchema = Data.Object({
  metadata: CollectionInfoSchema,
  version: Data.Integer({ minimum: 1 }),
  extra: Data.Any()
});
const CollectionInfoMetadataShape = CollectionInfoMetadataSchema;
function asChainCollectionImage(image) {
  const purpose = image.purpose;
  const dimension = { width: BigInt(image.dimension.width), height: BigInt(image.dimension.height) };
  const media_type = fromText(image.mediaType);
  const src = asChunkedHex(image.src);
  return {
    purpose,
    dimension,
    media_type,
    src
  };
}
function toCollectionImage(chainImage) {
  const purpose = chainImage.purpose;
  const dimension = { width: Number(chainImage.dimension.width), height: Number(chainImage.dimension.height) };
  const mediaType = toText(chainImage.media_type);
  const src = toJoinedText(chainImage.src);
  return {
    purpose,
    dimension,
    mediaType,
    src
  };
}
function asChainCollectionInfo(info) {
  const name = fromText(info.name);
  const artist = info.artist ? fromText(info.artist) : null;
  const project = info.project ? fromText(info.project) : null;
  const nsfw = info.nsfw ? true : false;
  const description = info.description ? asChunkedHex(info.description) : [];
  const images = info.images ? info.images.map(asChainCollectionImage) : [];
  const links = /* @__PURE__ */ new Map();
  if (info.links) {
    for (const [key, value] of Object.entries(info.links)) {
      links.set(fromText(key), asChunkedHex(value));
    }
  }
  const extra = /* @__PURE__ */ new Map();
  const metadata = {
    name,
    artist,
    project,
    nsfw,
    description,
    images,
    links,
    extra
  };
  return createReferenceData(metadata);
}
function toCollectionInfo(chainInfo) {
  const { metadata } = chainInfo;
  const name = toText(metadata.name);
  const artist = metadata.artist ? toText(metadata.artist) : void 0;
  const project = metadata.project ? toText(metadata.project) : void 0;
  const nsfw = metadata.nsfw;
  const description = metadata.description.length ? toJoinedText(metadata.description) : void 0;
  const images = metadata.images.length ? metadata.images.map(toCollectionImage) : void 0;
  let links = void 0;
  if (metadata.links) {
    links = {};
    for (const [key, value] of metadata.links) {
      links[toText(key)] = toJoinedText(value);
    }
  }
  let extra = void 0;
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
    extra
  };
}
async function extractCollectionInfo(lucid, utxo) {
  const chainInfo = await lucid.datumOf(utxo, CollectionInfoMetadataShape);
  return toCollectionInfo(chainInfo);
}
export {
  CollectionImageDimensionsSchema,
  CollectionImagePurposeSchema,
  CollectionImageSchema,
  CollectionImageShape,
  CollectionInfoMetadataSchema,
  CollectionInfoMetadataShape,
  CollectionInfoSchema,
  CollectionInfoShape,
  asChainCollectionImage,
  asChainCollectionInfo,
  extractCollectionInfo,
  toCollectionImage,
  toCollectionInfo
};
