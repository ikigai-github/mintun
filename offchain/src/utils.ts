import { applyDoubleCborEncoding, Credential, Lucid, Script, Tx, UTxO } from 'lucid';

/// All the parts commonly used when dealing with a paramaterized script
export type ValidatorInfo = {
  policy: Script;
  policyId: string;
  credential: Credential;
  address: string;
};

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

/// Utility function for grabbing commonly needed information about a validator (or minting policy)
export function getValidatorInfo(lucid: Lucid, paramaterizedScript: string): ValidatorInfo {
  const policy: Script = {
    type: 'PlutusV2',
    script: applyDoubleCborEncoding(paramaterizedScript),
  };

  const policyId = lucid.utils.validatorToScriptHash(policy);
  const credential = lucid.utils.scriptHashToCredential(policyId);
  const address = lucid.utils.credentialToAddress(credential);

  return {
    policy,
    policyId,
    credential,
    address,
  };
}
