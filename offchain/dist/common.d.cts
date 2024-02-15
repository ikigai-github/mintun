declare const POLICY_ID_BYTE_LENGTH = 28;
type TimeWindow = {
    startMs: number;
    endMs: number;
};
type TxMetadataPrimitive = number | string;
type TxMetadataArray = number[] | string[];
type TxMetadataRecord = Record<string, TxMetadataPrimitive> | Record<string, TxMetadataArray>;
type TxMetadata = TxMetadataPrimitive | TxMetadataRecord | Record<string, TxMetadataRecord>;

export { POLICY_ID_BYTE_LENGTH, type TimeWindow, type TxMetadata, type TxMetadataArray, type TxMetadataPrimitive, type TxMetadataRecord };
