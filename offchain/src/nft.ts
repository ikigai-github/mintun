import { Address, Assets, Data, fromText } from 'lucid';
import { createReferenceData, NftMetadataShape, NftMetadataType, NftMetadataWrappedType } from './cip-68.ts';
import { toNftReferenceAssetName, toNftUserAssetName } from './collection.ts';
import { TxMetadataPrimitive } from './common.ts';
import { IMAGE_PURPOSE, ImageDimension, ImagePurpose } from './image.ts';
import { chunk } from './utils.ts';

// Expands on CIP-25/68 File with dimension and purpose fields
type MintunFile = {
  name?: string;
  mediaType: string;
  src: string;
  dimension?: ImageDimension;
  purpose?: ImagePurpose;
};

export type MintunNftAttributes = Record<string, TxMetadataPrimitive>;

// Exands on CIP/25 metadata with id, attributes, and tags.
export type MintunNft = {
  name: string;
  image: string;
  mediaType?: string;
  description?: string;
  files?: MintunFile[];
  id?: string;
  attributes?: MintunNftAttributes;
  tags?: string[];
};

export type AddressedNft = { metadata: MintunNft; recipient?: string };

type ReferencePayout = {
  unit: string;
  address: string;
  chainData: NftMetadataWrappedType;
};

type UserPayouts = {
  [address: string]: string[];
};

type Cip25Metadata = Record<string, MintunNft>;

type PreparedAssets = {
  mints: Assets;
  userPayouts: UserPayouts;
  referencePayouts: ReferencePayout[];
  cip25Metadata: Cip25Metadata;
};

// Not sure on the usefulness of this builder but eh I made it.
export class NftBuilder {
  #nft: Partial<MintunNft> = {};

  private constructor() {}

  static nft(name: string) {
    const builder = new NftBuilder();
    builder.#nft.name = name;
    return builder;
  }

  thumbnail(src: string, mediaType: string, dimension: ImageDimension | undefined = undefined) {
    return this.image(src, mediaType, IMAGE_PURPOSE.Thumbnail, dimension);
  }

  image(
    src: string,
    mediaType: string,
    purpose: ImagePurpose | undefined = undefined,
    dimension: ImageDimension | undefined = undefined,
  ) {
    if (purpose === IMAGE_PURPOSE.Thumbnail) {
      this.#nft.image = src;
      this.#nft.mediaType = mediaType;
    }

    const files = this.#nft.files || [];
    files.push({
      src,
      mediaType,
      purpose,
      dimension,
    });

    this.#nft.files = files;
    return this;
  }

  id(id: string) {
    this.#nft.id = id;
    return this;
  }

  attribute(key: string, value: TxMetadataPrimitive) {
    const attributes = this.#nft.attributes || {};
    attributes[key] = value;
    return this.attributes(attributes);
  }

  attributes(attributes: MintunNftAttributes) {
    this.#nft.attributes = attributes;
    return this;
  }

  tag(tag: string) {
    const tags = this.#nft.tags || [];
    tags.push(tag);
    return this.tags(tags);
  }

  tags(tags: string[]) {
    this.#nft.tags = tags;
    return this;
  }
}

// Just splits
function asChainNftData(nft: MintunNft) {
  const desription = nft.description ? chunk(nft.description) : [];
  const files = nft.files ? nft.files.map((file) => ({ ...file, src: chunk(file.src) })) : [];
  const metadata = { ...nft, desription, files };
  return Data.castFrom<NftMetadataType>(Data.fromJson(metadata), NftMetadataShape);
}

/// Get NFT units, group them by address
export function prepareAssets(
  nfts: AddressedNft[],
  policyId: string,
  sequence: number,
  defaultRecipientAddress: Address,
  hasRoyalty: boolean,
  referenceAddress?: Address,
): PreparedAssets {
  const mints: Assets = {};
  const userPayouts: UserPayouts = {};
  const cip25Metadata: Cip25Metadata = {};
  const referencePayouts: ReferencePayout[] = [];
  let extra: Data = '';
  if (hasRoyalty) {
    extra = new Map<string, Data>();
    extra.set(fromText('royalty_included'), 1n);
  }

  for (const nft of nfts) {
    const { metadata, recipient } = nft;
    const userAssetName = toNftUserAssetName(sequence, metadata.name);
    const userUnit = policyId + userAssetName;
    const referenceAssetName = toNftReferenceAssetName(sequence, metadata.name);
    const referenceUnit = policyId + referenceAssetName;
    const chainMetadata = asChainNftData(metadata);
    const chainData = createReferenceData(chainMetadata, extra);
    const recipientAdress = recipient ? recipient : defaultRecipientAddress;
    const referencePayoutAddress = referenceAddress ? referenceAddress : recipientAdress;
    const userPayout = userPayouts[recipientAdress] || [];

    userPayout.push(userUnit);
    referencePayouts.push({ unit: referenceUnit, address: referencePayoutAddress, chainData });
    cip25Metadata[userAssetName] = metadata;
    userPayouts[recipientAdress] = userPayout;
    mints[userUnit] = 1n;
    mints[referenceUnit] = 1n;

    sequence += 1;
  }

  return {
    mints,
    userPayouts,
    referencePayouts,
    cip25Metadata,
  };
}
