"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _lucidcardano = require('lucid-cardano');
async function submit(tx) {
  const completed = await tx.complete();
  const signed = await completed.sign().complete();
  return await signed.submit();
}
async function findUtxo(lucid, unit) {
  let utxo = void 0;
  let wallet = false;
  if (lucid.wallet) {
    const utxos = await lucid.wallet.getUtxos();
    utxo = utxos.find((utxo2) => utxo2.assets[unit]);
  }
  if (!utxo) {
    utxo = await lucid.utxoByUnit(unit);
  } else {
    wallet = true;
  }
  return {
    utxo,
    wallet
  };
}
function checkPolicyId(policyId) {
  return /[0-9A-Fa-f]{56}/.test(policyId);
}
function chunk(str, charactersPerChunk = 64, prefix = "") {
  const chunks = Array(Math.ceil(str.length / charactersPerChunk));
  for (let i = 0; i < chunks.length; ++i) {
    chunks[i] = `${prefix}${str.slice(i * charactersPerChunk, (i + 1) * charactersPerChunk)}`;
  }
  return chunks;
}
function asChunkedHex(utf8String, prefix = "") {
  const hex = _lucidcardano.fromText.call(void 0, utf8String);
  const charactersPerChunk = 128;
  return chunk(hex, charactersPerChunk, prefix);
}
function toJoinedText(hexStrings) {
  if (Array.isArray(hexStrings)) {
    return _lucidcardano.toText.call(void 0, hexStrings.join(""));
  } else {
    return _lucidcardano.toText.call(void 0, hexStrings);
  }
}
function stringifyReplacer(_, value) {
  if (value instanceof Map) {
    return Object.fromEntries(value.entries());
  } else if (typeof value == "bigint") {
    return value.toString();
  }
  return value;
}








exports.asChunkedHex = asChunkedHex; exports.checkPolicyId = checkPolicyId; exports.chunk = chunk; exports.findUtxo = findUtxo; exports.stringifyReplacer = stringifyReplacer; exports.submit = submit; exports.toJoinedText = toJoinedText;
