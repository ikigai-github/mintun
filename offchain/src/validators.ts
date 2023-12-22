import { Lucid } from 'lucid';
import contracts from '../contracts.json' assert { type: 'json' };
import { TxReference } from './utils.ts';
import {
  getStateReferenceUnit,
  getStateUserUnit,
  paramaterizeStateMintingPolicy,
  paramaterizeStateValidator,
} from './state-mint.ts';
import { paramaterizeBatchMintingPolicy } from './batch-mint.ts';

// Utility function for fetching a validator from the generated plutus.json
export function getScript(title: string) {
  const script = contracts.validators.find((v) => v.title === title);
  if (!script) {
    throw new Error('script not found');
  }

  return script;
}

/// Parameterizes both the minting policy script and the validator script using the given seed transaction output hash and index
export function paramaterizeValidators(lucid: Lucid, seed: TxReference) {
  const stateMint = paramaterizeStateMintingPolicy(lucid, seed);
  const stateValidator = paramaterizeStateValidator(lucid, stateMint.policyId);
  const batchMint = paramaterizeBatchMintingPolicy(lucid, stateMint.policyId);
  const reference = getStateReferenceUnit(stateMint.policyId);
  const user = getStateUserUnit(stateMint.policyId);

  return {
    stateMint,
    stateValidator,
    batchMint,
    unit: {
      reference,
      user,
    },
  };
}
