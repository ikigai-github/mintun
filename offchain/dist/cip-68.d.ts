import * as lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox from 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import { Data } from 'lucid-cardano';

declare const REFERENCE_DATA_VERSION = 1n;
declare const REFERENCE_TOKEN_LABEL = 100;
declare const NFT_TOKEN_LABEL = 222;
declare function createReferenceData<T>(metadata: T, extra?: Data): {
    metadata: T;
    version: bigint;
    extra: Data;
};
type CollectionReferenceData<T> = ReturnType<typeof createReferenceData<T>>;
declare const NftMetadataFileSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
type NftMetadataFileType = Data.Static<typeof NftMetadataFileSchema>;
declare const NftMetadataFileShape: Map<string, Data>;
declare const NftMetadataSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
type NftMetadataType = Data.Static<typeof NftMetadataSchema>;
declare const NftMetadataShape: Map<string, Data>;
declare const NftMetadataWrappedSchema: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TObject<{
    metadata: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Map<string, Data>>;
    version: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<bigint>;
    extra: lucid_cardano_types_deps_deno_land_x_typebox_0_25_13_src_typebox.TUnsafe<Data>;
}>;
type NftMetadataWrappedType = Data.Static<typeof NftMetadataWrappedSchema>;
declare const NftMetadataWrappedShape: {
    metadata: Map<string, Data>;
    version: bigint;
    extra: Data;
};

export { type CollectionReferenceData, NFT_TOKEN_LABEL, NftMetadataFileSchema, NftMetadataFileShape, type NftMetadataFileType, NftMetadataSchema, NftMetadataShape, type NftMetadataType, NftMetadataWrappedSchema, NftMetadataWrappedShape, type NftMetadataWrappedType, REFERENCE_DATA_VERSION, REFERENCE_TOKEN_LABEL, createReferenceData };
