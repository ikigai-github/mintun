import { TxReference, UtxoFindResult } from './utils.js';
import * as lucid_cardano from 'lucid-cardano';
import { Script, Credential, Lucid } from 'lucid-cardano';

type ScriptInfo = {
    name: string;
    script: Script;
    policyId: string;
    credential: Credential;
    address: string;
};
type ManageUnitLookup = {
    info: string;
    owner: string;
    state: string;
};
declare function getScript(title: string): {
    title: string;
    redeemer: {
        title: string;
        schema: {
            $ref: string;
        };
    };
    parameters: {
        title: string;
        schema: {
            $ref: string;
        };
    }[];
    compiledCode: string;
    hash: string;
    datum?: undefined;
} | {
    title: string;
    datum: {
        title: string;
        schema: {
            $ref: string;
        };
    };
    redeemer: {
        title: string;
        schema: {
            $ref: string;
        };
    };
    parameters: {
        title: string;
        schema: {
            $ref: string;
        };
    }[];
    compiledCode: string;
    hash: string;
};
declare function getScriptInfo(lucid: Lucid, name: string, paramaterizedScript: string): ScriptInfo;
type ScriptCacheWarmer = {
    mint?: ScriptInfo;
    state?: ScriptInfo;
    unit?: ManageUnitLookup;
};
declare class ScriptCache {
    #private;
    private constructor();
    static cold(lucid: Lucid, seed: TxReference): ScriptCache;
    static warm(lucid: Lucid, seed: TxReference, warmer: ScriptCacheWarmer): ScriptCache;
    static copy(lucid: Lucid, cache: ScriptCache): ScriptCache;
    lucid(): Lucid;
    mint(): ScriptInfo;
    state(): ScriptInfo;
    immutableInfo(): ScriptInfo;
    immutableNft(): ScriptInfo;
    unit(): ManageUnitLookup;
}
declare function fetchStateUtxo(cache: ScriptCache): Promise<lucid_cardano.UTxO | undefined>;
declare function fetchInfoUtxo(cache: ScriptCache): Promise<lucid_cardano.UTxO | undefined>;
declare function fetchOwnerUtxo(cache: ScriptCache): Promise<UtxoFindResult>;

export { type ManageUnitLookup, ScriptCache, type ScriptCacheWarmer, type ScriptInfo, fetchInfoUtxo, fetchOwnerUtxo, fetchStateUtxo, getScript, getScriptInfo };
