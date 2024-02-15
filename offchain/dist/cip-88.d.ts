import { Script, Lucid, Tx } from 'lucid-cardano';
import { CollectionInfo } from './collection-info.js';
import { Royalty } from './royalty.js';
import 'lucid-cardano/types/deps/deno.land/x/typebox@0.25.13/src/typebox';
import './image.js';

declare const CIP_88_METADATA_LABEL = 867;
type Cip88ExtraConfig = {
    info?: CollectionInfo;
    cip27Royalty?: Royalty;
    cip102Royalties?: Royalty[];
};
declare const RegistrationMetadataField: {
    readonly VERSION: 0;
    readonly PAYLOAD: 1;
    readonly WITNESS: 2;
};
type RegistrationMetadata = {
    [RegistrationMetadataField.VERSION]: 1;
    [RegistrationMetadataField.PAYLOAD]: RegistrationPayload;
    [RegistrationMetadataField.WITNESS]: string[][];
};
declare const SCOPE_NATIVE = 0;
declare const SCOPE_PLUTUS_V1 = 1;
declare const SCOPE_PLUTUS_V2 = 2;
type RegistrationScope = [0, [string, string[]]] | [typeof SCOPE_PLUTUS_V1 | typeof SCOPE_PLUTUS_V2, [string]];
type RegistrationFeatureStandard = 25 | 27 | 68 | 102;
type RegistrationValidationMethod = [0] | [1, [string, string]];
type RegistrationFeatureDetails = Partial<Record<RegistrationFeatureStandard, object>>;
declare const RegistrationPayloadField: {
    readonly SCOPE: 1;
    readonly FEATURE_SET: 2;
    readonly VALIDATION_METHOD: 3;
    readonly NONCE: 4;
    readonly ORACLE_URI: 5;
    readonly FEATURE_DETAILS: 6;
};
type RegistrationPayload = {
    [RegistrationPayloadField.SCOPE]: RegistrationScope;
    [RegistrationPayloadField.FEATURE_SET]: RegistrationFeatureStandard[];
    [RegistrationPayloadField.VALIDATION_METHOD]: RegistrationValidationMethod;
    [RegistrationPayloadField.NONCE]: number;
    [RegistrationPayloadField.ORACLE_URI]: string[];
    [RegistrationPayloadField.FEATURE_DETAILS]: RegistrationFeatureDetails;
};
declare const FEATURE_VERSION_FIELD = 0;
declare const FEATURE_DETAIL_FIELD = 1;
declare const TokenProjectDetailField: {
    readonly NAME: 0;
    readonly DESCRIPTION: 1;
    readonly PROJECT_IMAGE: 2;
    readonly PROJECT_BANNER: 3;
    readonly NSFW_FLAG: 4;
    readonly SOCIAL: 5;
    readonly PROJECT_ARTIST: 6;
};
type TokenProjectDetail = {
    [FEATURE_VERSION_FIELD]: 1;
    [FEATURE_DETAIL_FIELD]: {
        [TokenProjectDetailField.NAME]: string;
        [TokenProjectDetailField.DESCRIPTION]?: string[];
        [TokenProjectDetailField.PROJECT_IMAGE]?: string[];
        [TokenProjectDetailField.PROJECT_BANNER]?: string[];
        [TokenProjectDetailField.NSFW_FLAG]?: 0 | 1;
        [TokenProjectDetailField.SOCIAL]?: Record<string, string[]>;
        [TokenProjectDetailField.PROJECT_ARTIST]?: string;
    };
};
declare const Cip27RoyaltyDetailField: {
    readonly RATE: 0;
    readonly RECIPIENT: 1;
};
type Cip27RoyaltyDetail = {
    [FEATURE_VERSION_FIELD]: 1;
    [FEATURE_DETAIL_FIELD]: {
        [Cip27RoyaltyDetailField.RATE]: string;
        [Cip27RoyaltyDetailField.RECIPIENT]: string[];
    };
};
declare const Cip102RoyaltyDetailField: {
    readonly ADDRESS: 0;
    readonly VARIABLE_FEE: 1;
    readonly MIN_FEE: 2;
    readonly MAX_FEE: 3;
};
type Cip102RoyaltyRecipient = {
    [Cip102RoyaltyDetailField.ADDRESS]: string[];
    [Cip102RoyaltyDetailField.VARIABLE_FEE]: number;
    [Cip102RoyaltyDetailField.MIN_FEE]?: number;
    [Cip102RoyaltyDetailField.MAX_FEE]?: number;
};
type Cip102RoyaltyDetail = {
    [FEATURE_VERSION_FIELD]: 1;
    [FEATURE_DETAIL_FIELD]: Cip102RoyaltyRecipient[];
};
declare function cip88Uri(uri: string): string[];
declare function toTokenProjectDetail(info: CollectionInfo): TokenProjectDetail;
declare function toCip27RoyaltyDetail(royalty: Royalty): Cip27RoyaltyDetail;
declare function toCip102RoyaltyRecipient(royalty: Royalty): Cip102RoyaltyRecipient;
declare function toCip102RoyaltyDetail(royalties: Royalty[]): Cip102RoyaltyDetail;
declare class Cip88Builder {
    #private;
    private constructor();
    static register(script: Script): Cip88Builder;
    cip68Info(info: CollectionInfo): this;
    cip25Info(info: CollectionInfo): this;
    cip27Royalty(royalty: Royalty): this;
    cip102Royalties(royalties: Royalty[]): this;
    oracle(url: string): this;
    validateWithbeacon(unit: string): this;
    build(lucid: Lucid): Promise<RegistrationMetadata>;
    private tokenProject;
    private buildPayload;
    private buildScope;
}
declare function addCip88MetadataToTransaction(lucid: Lucid, tx: Tx, script: Script, beaconUnit: string, config?: Cip88ExtraConfig | undefined): Promise<Tx>;

export { CIP_88_METADATA_LABEL, type Cip102RoyaltyDetail, Cip102RoyaltyDetailField, type Cip102RoyaltyRecipient, type Cip27RoyaltyDetail, Cip27RoyaltyDetailField, Cip88Builder, type Cip88ExtraConfig, FEATURE_DETAIL_FIELD, FEATURE_VERSION_FIELD, type RegistrationFeatureDetails, type RegistrationFeatureStandard, type RegistrationMetadata, RegistrationMetadataField, type RegistrationPayload, RegistrationPayloadField, type RegistrationScope, type RegistrationValidationMethod, SCOPE_NATIVE, SCOPE_PLUTUS_V1, SCOPE_PLUTUS_V2, type TokenProjectDetail, TokenProjectDetailField, addCip88MetadataToTransaction, cip88Uri, toCip102RoyaltyDetail, toCip102RoyaltyRecipient, toCip27RoyaltyDetail, toTokenProjectDetail };
