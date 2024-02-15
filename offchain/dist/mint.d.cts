import * as lucid_cardano from 'lucid-cardano';
import { Address, UTxO, Lucid } from 'lucid-cardano';
import { TxReference } from './utils.cjs';
import { MintunNft } from './nft.cjs';
import { ScriptCache } from './script.cjs';
import { CollectionState } from './collection-state.cjs';
import './cip-68.cjs';
import 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import './common.cjs';
import './image.cjs';

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
