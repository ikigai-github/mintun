import { fromText, Lucid, toText, Tx, Unit, UTxO } from 'lucid';

/// Simple form of UTxO that only includes part needed to reference a transaction
export type TxReference = {
  hash: string;
  index: number;
};

/// Small utility to convert a full UTxO into a transaction reference
export function toTxReference(utxo: UTxO): TxReference {
  return {
    hash: utxo.txHash,
    index: utxo.outputIndex,
  };
}

/// Utility function for completing a transaction, signing it, and then submitting it.
export async function submit(tx: Tx) {
  const completed = await tx.complete();
  const signed = await completed.sign().complete();
  return await signed.submit();
}

/// Result of trying to find a UTxO.
/// wallet is false if the UTxO was not found in the selected lucid wallet.
export type UtxoFindResult = {
  utxo?: UTxO;
  wallet: boolean;
};

/// Utility function to find a utxo first in wallet then in general if no match was found
export async function findUtxo(lucid: Lucid, unit: Unit): Promise<UtxoFindResult> {
  // Normally should be in the wallet
  let utxo: UTxO | undefined = undefined;
  let wallet = false;
  if (lucid.wallet) {
    const utxos = await lucid.wallet.getUtxos();
    utxo = utxos.find((utxo) => utxo.assets[unit]);
  }

  // Wider net search but can't be spent from current wallet
  if (!utxo) {
    utxo = await lucid.utxoByUnit(unit);
  } else {
    wallet = true;
  }

  return {
    utxo,
    wallet,
  };
}

/// Sanity check that it string conforms to a 28 byte hex string. Does not guarantee it really is a policy id.
export function checkPolicyId(policyId: string) {
  return /[0-9A-Fa-f]{56}/.test(policyId);
}

/// Utility function splitting a UTF8 string into chunks
/// Default characters per chunk is 64
export function chunk(str: string, charactersPerChunk = 64): string[] {
  const chunks = Array(Math.ceil(str.length / charactersPerChunk));
  for (let i = 0; i < chunks.length; ++i) {
    chunks[i] = str.slice(i * charactersPerChunk, (i + 1) * charactersPerChunk);
  }

  return chunks;
}

/// Utility function for encoding and splitting a UTF8 string into 64 byte chunks.
export function asChunkedHex(utf8String: string): string[] {
  const hex = fromText(utf8String);
  const charactersPerChunk = 128;
  return chunk(hex, charactersPerChunk);
}

/// Utility function for resting a chunked hex string to a single UTF8 string
export function toJoinedText(hexStrings: string | string[]) {
  if (Array.isArray(hexStrings)) {
    return toText(hexStrings.join(''));
  } else {
    return toText(hexStrings);
  }
}