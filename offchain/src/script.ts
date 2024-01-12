/// Allow passing in as little or as much already computed data as possible
/// This cache will be updated if a some part is missing. The only case where

import { applyDoubleCborEncoding, Credential, Lucid, Script } from 'lucid';
import { findUtxo, TxReference } from './utils.ts';
import { toInfoUnit, toOwnerUnit } from './collection.ts';
import { paramaterizeMintingPolicy, paramaterizeStateValidator } from './contract.ts';
import contracts from '../contracts.json' with { type: 'json' };
import { paramaterizeImmutableInfoValidator } from './mod.ts';
import { toStateUnit } from './collection-state.ts';

/// All the parts commonly used when dealing with a paramaterized script
export type ScriptInfo = {
  name: string;
  script: Script;
  policyId: string;
  credential: Credential;
  address: string;
};

/// Commonly paired reference and owner unit names
export type ManageUnitLookup = {
  info: string;
  owner: string;
  state: string;
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
export function getScriptInfo(lucid: Lucid, name: string, paramaterizedScript: string): ScriptInfo {
  const script: Script = {
    type: 'PlutusV2',
    script: applyDoubleCborEncoding(paramaterizedScript),
  };

  const policyId = lucid.utils.validatorToScriptHash(script);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);

  return {
    name,
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
  #info?: ScriptInfo;
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
      this.#state = paramaterizeStateValidator(this.#lucid, mint.policyId);
    }

    return this.#state;
  }

  // TODO: Currently only one info validator but will add mutable validator
  info(name = 'immutable_info_validator.spend') {
    if (!this.#info || this.#info.name !== name) {
      const mint = this.mint();
      this.#info = paramaterizeImmutableInfoValidator(this.#lucid, mint.policyId);
    }

    return this.#info;
  }

  unit() {
    if (!this.#unit) {
      const mint = this.mint();
      const info = toInfoUnit(mint.policyId);
      const owner = toOwnerUnit(mint.policyId);
      const state = toStateUnit(mint.policyId);

      this.#unit = { info, owner, state };
    }

    return this.#unit;
  }
}

async function fetchUtxo(lucid: Lucid, address: string, unit: string) {
  const utxos = await lucid.utxosAt(address);
  const utxo = utxos.find((utxo) => utxo.assets[unit]);
  return utxo;
}

/// Fetches the UTxO that holds the state token
export async function fetchStateUtxo(cache: ScriptCache) {
  return await fetchUtxo(cache.lucid(), cache.state().address, cache.unit().state);
}

/// Fetches the UTxO that holds the collection info token
export async function fetchInfoUtxo(cache: ScriptCache) {
  return await fetchUtxo(cache.lucid(), cache.info().address, cache.unit().info);
}

/// Fetches the UTxO that holds the collection owner token.
export async function fetchOwnerUtxo(cache: ScriptCache) {
  const unit = cache.unit();
  return await findUtxo(cache.lucid(), unit.owner);
}
