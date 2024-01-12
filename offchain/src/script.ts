/// Allow passing in as little or as much already computed data as possible
/// This cache will be updated if a some part is missing. The only case where

import { applyDoubleCborEncoding, Credential, Lucid, Script } from 'lucid';
import { findUtxo, TxReference } from './utils.ts';
import { toManageOwnerUnit, toManageReferenceUnit } from './collection.ts';
import { paramaterizeMintingPolicy, paramaterizeValidator } from './contract.ts';
import contracts from '../contracts.json' assert { type: 'json' };

/// All the parts commonly used when dealing with a paramaterized script
export type ScriptInfo = {
  script: Script;
  policyId: string;
  credential: Credential;
  address: string;
};

/// Commonly paired reference and owner unit names
export type ManageUnitLookup = {
  reference: string;
  owner: string;
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
  state?: ScriptInfo;
  unit?: ManageUnitLookup;
};

/// Cache holds all the computed data from a builder transaction to
/// allow subsequent transactions to reuse computed data
export class ScriptCache {
  #lucid: Lucid;
  #seed: TxReference;
  #mint?: ScriptInfo;
  #state?: ScriptInfo;
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
    cache.#state = warmer.state;
    cache.#unit = warmer.unit;

    return cache;
  }

  static copy(lucid: Lucid, cache: ScriptCache) {
    const copy = new ScriptCache(lucid, cache.#seed);
    copy.#mint = cache.#mint;
    copy.#state = cache.#state;
    copy.#unit = cache.#unit;

    return copy;
  }

  lucid() {
    return this.#lucid;
  }

  mint() {
    if (!this.#mint) {
      const { txHash, outputIndex } = this.#seed;
      this.#mint = paramaterizeMintingPolicy(this.#lucid, txHash, outputIndex);
    }

    return this.#mint;
  }

  state() {
    if (!this.#state) {
      const mint = this.mint();
      this.#state = paramaterizeValidator(this.#lucid, mint.policyId);
    }

    return this.#state;
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
}

/// Fetches the UTxO that holds the management reference token
export async function fetchManageReferenceUtxo(cache: ScriptCache) {
  const spend = cache.state();
  const unit = cache.unit();
  const utxos = await cache.lucid().utxosAt(spend.address);
  const utxo = utxos.find((utxo) => utxo.assets[unit.reference]);
  return utxo;
}

export async function fetchManageOwnerUtxo(cache: ScriptCache) {
  const unit = cache.unit();
  return await findUtxo(cache.lucid(), unit.owner);
}
