import { Address, Assets } from 'lucid-cardano';
import { NftMetadataWrappedType } from './cip-68.js';
import { TxMetadataPrimitive } from './common.js';
import { ImageDimension, ImagePurpose } from './image.js';
import 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';

type MintunFile = {
    name?: string;
    mediaType: string;
    src: string;
    dimension?: ImageDimension;
    purpose?: ImagePurpose;
};
type MintunNftAttributes = Record<string, TxMetadataPrimitive>;
type MintunNft = {
    name: string;
    image: string;
    mediaType?: string;
    description?: string;
    files?: MintunFile[];
    id?: string;
    attributes?: MintunNftAttributes;
    tags?: string[];
};
type AddressedNft = {
    metadata: MintunNft;
    recipient?: string;
};
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
declare class NftBuilder {
    #private;
    private constructor();
    static nft(name: string): NftBuilder;
    thumbnail(src: string, mediaType: string, dimension?: ImageDimension | undefined): this;
    image(src: string, mediaType: string, purpose?: ImagePurpose | undefined, dimension?: ImageDimension | undefined): this;
    id(id: string): this;
    attribute(key: string, value: TxMetadataPrimitive): this;
    attributes(attributes: MintunNftAttributes): this;
    tag(tag: string): this;
    tags(tags: string[]): this;
}
declare function prepareAssets(nfts: AddressedNft[], policyId: string, sequence: number, defaultRecipientAddress: Address, hasRoyalty: boolean, referenceAddress?: Address): PreparedAssets;

export { type AddressedNft, type MintunNft, type MintunNftAttributes, NftBuilder, prepareAssets };
