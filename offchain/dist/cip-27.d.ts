import { Tx } from 'lucid-cardano';
import { Royalty } from './royalty.js';

declare const CIP_27_METADATA_LABEL = 777;
type Cip27Metadata = {
    rate: number;
    addr: string | string[];
};
declare function toCip27Metadata(percentage: number, address: string): {
    rate: string;
    addr: string | string[];
};
declare function addCip27RoyaltyToTransaction(tx: Tx, policyId: string, royalty: Royalty, redeemer?: string): void;

export { CIP_27_METADATA_LABEL, type Cip27Metadata, addCip27RoyaltyToTransaction, toCip27Metadata };
