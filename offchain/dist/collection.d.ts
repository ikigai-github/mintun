declare const COLLECTION_OWNER_TOKEN_LABEL = 111;
declare const SEQUENCE_NUM_BYTES = 3;
declare const SEQUENCE_MAX_VALUE: number;
declare const ASSET_NAME_MAX_BYTES = 32;
declare const LABEL_NUM_BYTES = 4;
declare const PURPOSE_NUM_BYTES = 1;
declare const ASSET_NAME_PREFIX_BYTES: number;
declare const CONTENT_NAME_MAX_BYTES: number;
declare const COLLECTION_TOKEN_PURPOSE: {
    readonly Management: "Management";
    readonly NFT: "NFT";
};
type CollectionTokenPurpose = keyof typeof COLLECTION_TOKEN_PURPOSE;
declare function toSequenceHex(sequence: number): string;
declare function toPurposeHex(purpose: CollectionTokenPurpose): "00" | "01";
declare function toNftReferenceAssetName(sequence: number, content: string): string;
declare function toNftReferenceUnit(policyId: string, sequence: number, content: string): string;
declare function toNftUserAssetName(sequence: number, content: string): string;
declare function toNftUserUnit(policyId: string, sequence: number, content: string): string;
declare function toInfoUnit(policyId: string): string;
declare function toOwnerUnit(policyId: string): string;

export { ASSET_NAME_MAX_BYTES, ASSET_NAME_PREFIX_BYTES, COLLECTION_OWNER_TOKEN_LABEL, COLLECTION_TOKEN_PURPOSE, CONTENT_NAME_MAX_BYTES, type CollectionTokenPurpose, LABEL_NUM_BYTES, PURPOSE_NUM_BYTES, SEQUENCE_MAX_VALUE, SEQUENCE_NUM_BYTES, toInfoUnit, toNftReferenceAssetName, toNftReferenceUnit, toNftUserAssetName, toNftUserUnit, toOwnerUnit, toPurposeHex, toSequenceHex };
