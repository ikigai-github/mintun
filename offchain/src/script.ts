/// Allow passing in as little or as much already computed data as possible
/// This cache will be updated if a some part is missing. The only case where

import { applyDoubleCborEncoding, Credential, Lucid, Script } from 'lucid';
import { findUtxo, TxReference, UtxoFindResult } from './utils.ts';
import { ManageUnitLookup, toManageOwnerUnit, toManageReferenceUnit } from './collection.ts';
import { paramaterizeMintingPolicy, paramaterizeValidator } from './mintun.ts';
import contracts from '../contracts.json' assert { type: 'json' };

/// All the parts commonly used when dealing with a paramaterized script
export type ScriptInfo = {
  script: Script;
  policyId: string;
  credential: Credential;
  address: string;
};

// Utility function for fetching a validator from the generated plutus.json
export function getScript(title: string) {
  const script = contracts.validators.find((v) => v.title === title);
  if (!script) {
    throw new Error('script not found');
  }

  return script;
}

/// Utility function for grabbing commonly needed information about a validator (or minting policy)
export function getScriptInfo(lucid: Lucid, paramaterizedScript: string): ScriptInfo {
  const script: Script = {
    type: 'PlutusV2',
    script: applyDoubleCborEncoding(paramaterizedScript),
  };

  const policyId = lucid.utils.validatorToScriptHash(script);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);

  return {
    script,
    policyId,
    credential,
    address,
  };
}

export type ScriptCacheWarmer = {
  mint?: ScriptInfo;
  spend?: ScriptInfo;
  unit?: ManageUnitLookup;
};

/// Cache holds all the computed data from a builder transaction to
/// allow subsequent transactions to reuse computed data
export class ScriptCache {
  #lucid: Lucid;
  #seed: TxReference;
  #mint?: ScriptInfo;
  #spend?: ScriptInfo;
  #unit?: ManageUnitLookup;

  private constructor(lucid: Lucid, seed: TxReference) {
    this.#lucid = lucid;
    this.#seed = seed;
  }

  static cold(lucid: Lucid, seed: TxReference) {
    return new ScriptCache(lucid, seed);
  }

  static warm(lucid: Lucid, seed: TxReference, warmer: ScriptCacheWarmer) {
    const cache = new ScriptCache(lucid, seed);
    cache.#mint = warmer.mint;
    cache.#spend = warmer.spend;
    cache.#unit = warmer.unit;

    return cache;
  }

  mint() {
    if (!this.#mint) {
      const { hash, index } = this.#seed;
      this.#mint = paramaterizeMintingPolicy(this.#lucid, hash, index);
    }

    return this.#mint;
  }

  spend() {
    if (!this.#spend) {
      const mint = this.mint();
      this.#spend = paramaterizeValidator(this.#lucid, mint.policyId);
    }

    return this.#spend;
  }

  unit() {
    if (!this.#unit) {
      const mint = this.mint();
      const reference = toManageReferenceUnit(mint.policyId);
      const owner = toManageOwnerUnit(mint.policyId);

      this.#unit = { reference, owner };
    }

    return this.#unit;
  }

  /// Fetches the UTxO that holds the management reference token
  /// Not cached because likely to be spent in TX and need to be refetched if cache is reused.
  async fetchManageReferenceUtxo(): Promise<UtxoFindResult> {
    const spend = this.spend();
    const unit = this.unit();
    const utxos = await this.#lucid.utxosAt(spend.address);
    const utxo = utxos.find((utxo) => utxo.assets[unit.reference]);

    return {
      utxo,
      wallet: false,
    };
  }

  /// Find the UTxO that holds the management owner token.
  /// Not cached because likely to be spent.
  async fetchManageOwnerUtxo(): Promise<UtxoFindResult> {
    const unit = this.unit();
    return await findUtxo(this.#lucid, unit.owner);
  }
}
