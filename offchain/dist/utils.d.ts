import { Tx, UTxO, Lucid, Unit } from 'lucid-cardano';

type TxReference = {
    txHash: string;
    outputIndex: number;
};
declare function submit(tx: Tx): Promise<string>;
type UtxoFindResult = {
    utxo?: UTxO;
    wallet: boolean;
};
declare function findUtxo(lucid: Lucid, unit: Unit): Promise<UtxoFindResult>;
declare function checkPolicyId(policyId: string): boolean;
declare function chunk(str: string, charactersPerChunk?: number, prefix?: string): string[];
declare function asChunkedHex(utf8String: string, prefix?: string): string[];
declare function toJoinedText(hexStrings: string | string[]): string;
declare function stringifyReplacer(_: unknown, value: unknown): any;

export { type TxReference, type UtxoFindResult, asChunkedHex, checkPolicyId, chunk, findUtxo, stringifyReplacer, submit, toJoinedText };
