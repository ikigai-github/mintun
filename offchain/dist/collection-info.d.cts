import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data, Lucid, UTxO } from 'lucid-cardano';
import { ImagePurpose, ImageDimension } from './image.cjs';

declare const CollectionImagePurposeSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Thumbnail"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Banner"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Avatar"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Gallery"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"General">)[]>;
declare const CollectionImageDimensionsSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    width: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    height: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
}>;
declare const CollectionImageSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    purpose: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Thumbnail"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Banner"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Avatar"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Gallery"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"General">)[]>;
    dimension: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        width: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
        height: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    }>;
    media_type: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
    src: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>>;
}>;
type CollectionImageType = Data.Static<typeof CollectionImageSchema>;
declare const CollectionImageShape: {
    purpose: "Thumbnail" | "Banner" | "Avatar" | "Gallery" | "General";
    dimension: {
        width: bigint;
        height: bigint;
    };
    media_type: string;
    src: string[];
};
declare const CollectionInfoSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    name: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
    artist: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
    project: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
    nsfw: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
    description: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>>;
    images: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        purpose: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Thumbnail"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Banner"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Avatar"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Gallery"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"General">)[]>;
        dimension: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            width: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
            height: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
        }>;
        media_type: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
        src: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>>;
    }>>;
    links: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, string[]>>;
    extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
}>;
type CollectionInfoType = Data.Static<typeof CollectionInfoSchema>;
declare const CollectionInfoShape: {
    extra: Map<string, Data>;
    name: string;
    artist: string | null;
    project: string | null;
    nsfw: boolean;
    description: string[];
    images: {
        purpose: "Thumbnail" | "Banner" | "Avatar" | "Gallery" | "General";
        dimension: {
            width: bigint;
            height: bigint;
        };
        media_type: string;
        src: string[];
    }[];
    links: Map<string, string[]>;
};
declare const CollectionInfoMetadataSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    metadata: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
        name: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
        artist: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
        project: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string | null>;
        nsfw: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<boolean>;
        description: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>>;
        images: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
            purpose: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnion<(lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Thumbnail"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Banner"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Avatar"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"Gallery"> | lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TLiteral<"General">)[]>;
            dimension: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
                width: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
                height: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
            }>;
            media_type: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>;
            src: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TArray<lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<string>>;
        }>>;
        links: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, string[]>>;
        extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
    }>;
    version: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Data>;
}>;
type CollectionInfoMetadataType = Data.Static<typeof CollectionInfoMetadataSchema>;
declare const CollectionInfoMetadataShape: {
    metadata: {
        extra: Map<string, Data>;
        name: string;
        artist: string | null;
        project: string | null;
        nsfw: boolean;
        description: string[];
        images: {
            purpose: "Thumbnail" | "Banner" | "Avatar" | "Gallery" | "General";
            dimension: {
                width: bigint;
                height: bigint;
            };
            media_type: string;
            src: string[];
        }[];
        links: Map<string, string[]>;
    };
    version: bigint;
    extra: Data;
};
type CollectionImage = {
    purpose: ImagePurpose;
    dimension: ImageDimension;
    mediaType: string;
    src: string;
};
type CollectionInfo = {
    name: string;
    artist?: string;
    project?: string;
    nsfw: boolean;
    description?: string;
    images?: CollectionImage[];
    links?: Record<string, string>;
    extra?: Record<string, unknown>;
};
declare function asChainCollectionImage(image: CollectionImage): CollectionImageType;
declare function toCollectionImage(chainImage: CollectionImageType): CollectionImage;
declare function asChainCollectionInfo(info: CollectionInfo): CollectionInfoMetadataType;
declare function toCollectionInfo(chainInfo: CollectionInfoMetadataType): CollectionInfo;
declare function extractCollectionInfo(lucid: Lucid, utxo: UTxO): Promise<CollectionInfo>;

export { type CollectionImage, CollectionImageDimensionsSchema, CollectionImagePurposeSchema, CollectionImageSchema, CollectionImageShape, type CollectionImageType, type CollectionInfo, CollectionInfoMetadataSchema, CollectionInfoMetadataShape, type CollectionInfoMetadataType, CollectionInfoSchema, CollectionInfoShape, type CollectionInfoType, asChainCollectionImage, asChainCollectionInfo, extractCollectionInfo, toCollectionImage, toCollectionInfo };
