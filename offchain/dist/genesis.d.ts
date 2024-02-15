import * as lucid_cardano from 'lucid-cardano';
import { UTxO, Script, Lucid } from 'lucid-cardano';
import { ScriptCache } from './script.js';
import { CollectionInfo } from './collection-info.js';
import { CollectionState } from './collection-state.js';
import './utils.js';
import 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import './image.js';
import './common.js';

declare class GenesisTxBuilder {
    #private;
    private constructor();
    seed(seed: UTxO): this;
    group(policyId: string): this;
    mintWindow(startMs: number, endMs: number): this;
    maxNfts(maxNfts: number): this;
    nftValidatorAddress(address: string): this;
    nftValidator(validator: Script): this;
    useImmutableNftValidator(useImmutableNftValidator: boolean): this;
    royaltyValidatorAddress(address: string): this;
    royaltyValidator(validator: Script): this;
    ownerAddress(address: string): this;
    state(state: Partial<CollectionState>): this;
    info(info: CollectionInfo): this;
    useCip27(useCip27: boolean): this;
    useCip88(useCip88: boolean): this;
    royalty(address: string, variableFee: number, minFee?: number | undefined, maxFee?: number | undefined): this;
    build(): Promise<{
        cache: ScriptCache;
        tx: lucid_cardano.Tx;
        state: CollectionState;
        recipient: string;
    }>;
    static create(lucid: Lucid): GenesisTxBuilder;
}

export { GenesisTxBuilder };
