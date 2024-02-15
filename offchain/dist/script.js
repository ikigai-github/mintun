import { applyDoubleCborEncoding } from "lucid-cardano";
import { findUtxo } from "./utils";
import { toInfoUnit, toOwnerUnit } from "./collection";
import {
  paramaterizeImmutableInfoValidator,
  paramaterizeImmutableNftValidator,
  paramaterizeMintingPolicy,
  paramaterizeStateValidator
} from "./contract";
import contracts from "../contracts.json";
import { toStateUnit } from "./collection-state";
function getScript(title) {
  const script = contracts.validators.find((v) => v.title === title);
  if (!script) {
    throw new Error("script not found");
  }
  return script;
}
function getScriptInfo(lucid, name, paramaterizedScript) {
  const script = {
    type: "PlutusV2",
    script: applyDoubleCborEncoding(paramaterizedScript)
  };
  const policyId = lucid.utils.validatorToScriptHash(script);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);
  return {
    name,
    script,
    policyId,
    credential,
    address
  };
}
class ScriptCache {
  #lucid;
  #seed;
  #mint;
  #state;
  #immutableInfo;
  #immutableNft;
  #unit;
  constructor(lucid, seed) {
    this.#lucid = lucid;
    this.#seed = seed;
  }
  static cold(lucid, seed) {
    return new ScriptCache(lucid, seed);
  }
  static warm(lucid, seed, warmer) {
    const cache = new ScriptCache(lucid, seed);
    cache.#mint = warmer.mint;
    cache.#state = warmer.state;
    cache.#unit = warmer.unit;
    return cache;
  }
  static copy(lucid, cache) {
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
  immutableInfo() {
    if (!this.#immutableInfo) {
      const mint = this.mint();
      this.#immutableInfo = paramaterizeImmutableInfoValidator(this.#lucid, mint.policyId);
    }
    return this.#immutableInfo;
  }
  immutableNft() {
    if (!this.#immutableNft) {
      const mint = this.mint();
      this.#immutableNft = paramaterizeImmutableNftValidator(this.#lucid, mint.policyId);
    }
    return this.#immutableNft;
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
async function fetchUtxo(lucid, address, unit) {
  const utxos = await lucid.utxosAt(address);
  const utxo = utxos.find((utxo2) => utxo2.assets[unit]);
  return utxo;
}
async function fetchStateUtxo(cache) {
  return await fetchUtxo(cache.lucid(), cache.state().address, cache.unit().state);
}
async function fetchInfoUtxo(cache) {
  return await fetchUtxo(cache.lucid(), cache.immutableInfo().address, cache.unit().info);
}
async function fetchOwnerUtxo(cache) {
  const unit = cache.unit();
  return await findUtxo(cache.lucid(), unit.owner);
}
export {
  ScriptCache,
  fetchInfoUtxo,
  fetchOwnerUtxo,
  fetchStateUtxo,
  getScript,
  getScriptInfo
};
