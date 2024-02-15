import * as lucid_cardano from 'lucid-cardano';
import { Address, UTxO, Lucid } from 'lucid-cardano';
import { TxReference } from './utils.js';
import { MintunNft } from './nft.js';
import { ScriptCache } from './script.js';
import { CollectionState } from './collection-state.js';
import './cip-68.js';
import 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import './common.js';
import './image.js';

declare const CIP_25_METADATA_LABEL = 721;
declare class MintTxBuilder {
    #private;
    private constructor();
    seed(seed: TxReference): this;
    cache(cache: ScriptCache): this;
    recipient(recipient: Address): this;
    stateUtxo(utxo: UTxO): this;
    ownerUtxo(utxo: UTxO): this;
    state(state: CollectionState): this;
    nft(metadata: MintunNft, recipient?: string | undefined): this;
    nfts(nfts: MintunNft[], recipient?: string | undefined): this;
    useCip25(useCip25: boolean): this;
    build(): Promise<{
        tx: lucid_cardano.Tx;
        cache: ScriptCache;
    }>;
    static create(lucid: Lucid): MintTxBuilder;
}

export { CIP_25_METADATA_LABEL, MintTxBuilder };
