import { Data, Lucid, UTxO, applyParamsToScript } from 'https://deno.land/x/lucid@0.10.7/mod.ts';
import { getScript } from './validators.ts';
import { PolicyIdSchema, toBech32Address } from './aiken.ts';
import { 
  readStateData, 
  StateMintData, 
  StateMintShape, 
  StateUnitLookup, 
  getStateReferenceUnit, 
  getStateUserUnit, 
  paramaterizeStateMintingPolicy, 
  paramaterizeStateValidator, 
  updateStateMintData 
} from './state-mint.ts';
import { NftMetadata, NftShape, createReferenceData, makeNftUnit, makeReferenceUnit } from './cip68.ts';
import { ValidatorInfo, getValidatorInfo } from './lucid.ts';
import { TxReference } from './lucid.ts';

// Batch Minting policy params schema
const ParamsSchema = Data.Tuple([PolicyIdSchema]);
type Params = Data.Static<typeof ParamsSchema>
const Params = ParamsSchema as unknown as Params;

/// Allow passing in as little or as much already computed data as possible
/// This cache will be updated if a some part is missing. The only case where
/// cache may fail is if seed or recipient is undefined so those are required
export type BatchMintCache = {
  seed: TxReference,
  recipientAddress: string,
  inlineDatum: boolean,
  mint?: ValidatorInfo,
  validator?: ValidatorInfo,
  unit: StateUnitLookup,
  stateUserUtxo?: UTxO,
  stateReferenceUtxo?: UTxO,
  previousState?: StateMintData,
  referenceAddress?: string
}

export type NftMint = {
  name: string,
  metadata: NftMetadata,
}

// Uses the passed in state minting policy id to paramaterize the batch mint script
export function paramaterizeBatchMintingPolicy(lucid: Lucid, stateMintPolicyId: string) {
  const validator = getScript('batch_mint.mint');
  const paramaterizedMintingPolicy = applyParamsToScript<Params>(validator.compiledCode, [stateMintPolicyId], Params);
  return getValidatorInfo(lucid,paramaterizedMintingPolicy );
}

function getMintPolicy(lucid: Lucid, cache: BatchMintCache): ValidatorInfo {
  const { mint, seed } = cache
  if(!mint) {

    cache.mint = paramaterizeStateMintingPolicy(lucid, seed)
  }

  if(!cache.mint) {
    throw Error('Failed to paramaterize state minting policy')
  }

  return cache.mint
}

function getStateValidator(lucid: Lucid, cache: BatchMintCache): ValidatorInfo {
  const { validator } = cache;
  if(!validator) {
    const mint = getMintPolicy(lucid, cache);
    cache.validator = paramaterizeStateValidator(lucid, mint.policyId)
  }

  if(!cache.validator) {
    throw Error('Failed to paramaterize state validator')
  }

  return cache.validator;
}

function getUnit(lucid: Lucid, cache: BatchMintCache) {
  const { unit } = cache;
  if(!unit) {
    const mint = getMintPolicy(lucid, cache);
    const reference = getStateReferenceUnit(mint.policyId);
    const user = getStateUserUnit(mint.policyId);
  
    cache.unit = { reference, user }
  }

  return cache.unit
}

async function getStateUserUtxo(lucid: Lucid, cache: BatchMintCache) {
  const { stateUserUtxo } = cache;
  if(!stateUserUtxo) {
    const unit = getUnit(lucid, cache);

    // Normally should be in the wallet
    if(lucid.wallet) {
      const utxos = await lucid.wallet.getUtxos();
      cache.stateUserUtxo = utxos.find(utxo => utxo.assets[unit.user]);
    }

    // Wider net search but may not be spendable using default prepare tx method
    if(!cache.stateUserUtxo) {
      cache.stateUserUtxo = await lucid.utxoByUnit(unit.user)
    }
  }

  if(!cache.stateUserUtxo) {
    throw Error("Could not find the derived UTxO on chain")
  }

  return cache.stateUserUtxo
}

async function getStateReferenceUtxo(lucid: Lucid, cache: BatchMintCache) {
  const { stateReferenceUtxo } = cache;
  if(!stateReferenceUtxo) {
    const validator = getStateValidator(lucid, cache);
    const unit = getUnit(lucid, cache);
    const utxos = await lucid.utxosAt(validator.address)
    cache.stateReferenceUtxo = utxos.find(utxo => utxo.assets[unit.reference]);
  }

  if(!cache.stateReferenceUtxo) {
    throw Error("Could not find the derived UTxO on chain")
  }

  return cache.stateReferenceUtxo
}

async function getPreviousState(lucid: Lucid, cache: BatchMintCache) {
  const { previousState } = cache;
  if(!previousState) {
    const stateReferenceUtxo = await getStateReferenceUtxo(lucid, cache);
    cache.previousState = await readStateData(lucid, stateReferenceUtxo)
  }

  if(!cache.previousState) {
    throw Error("Could not get the previous state of the mint");
  }

  return cache.previousState;
} 


async function getReferenceAddress(lucid: Lucid, cache: BatchMintCache) {
  const { referenceAddress } = cache;
  if(!referenceAddress) {
    const previousState = await getPreviousState(lucid, cache);
    if(previousState.metadata.reference_address) {
      cache.referenceAddress = toBech32Address(lucid, previousState.metadata.reference_address)
    } else {
      cache.referenceAddress = await lucid.wallet.address();
    }
  }

  if(!cache.referenceAddress) {
    throw Error("Could not determine the reference address to send tokens to");
  }

  return cache.referenceAddress
}


function prepareCip68Assets(policyId: string, mints: NftMint[]) {
  const user: Record<string, bigint> = { }
  const reference: Record<string, bigint> = { }
  const datums: Record<string, string> = { }
  for(const mint of mints) {
    const userUnit = makeNftUnit(policyId, mint.name);
    const referenceUnit = makeReferenceUnit(policyId, mint.name);
    const data = createReferenceData(mint.metadata);
    const datum = Data.to(data, NftShape);

    user[userUnit] = 1n;
    reference[referenceUnit] = 1n
    datums[referenceUnit] = datum
  }

  return {
    user,
    reference,
    datums
  }
}

// TODO: Add optional parameter for minting royalty
// TODO: Add checks on max tokens and valid time range to prevent failing transactions for errors we can prevent
// TODO: Make inlining the datum configurable
// TODO: Get a better understanding of how to put multiple datums into a single output, if that is even possible to start.
export async function prepareBatchMintTx(lucid: Lucid, cache: BatchMintCache, mints: NftMint[]) {
  // Grab from the cache the data needed to prepare the mint
  const unit = getUnit(lucid, cache);
  const mint = getMintPolicy(lucid, cache);
  const validator = getStateValidator(lucid, cache);
  const stateUserUtxo = await getStateUserUtxo(lucid, cache);
  const stateReferenceUtxo = await getStateReferenceUtxo(lucid, cache);
  const previousState = await getPreviousState(lucid, cache);
  const referenceAddress = await getReferenceAddress(lucid, cache);

  const { policy, policyId } = paramaterizeBatchMintingPolicy(lucid, mint.policyId);

  // Prepare all the assets and datums for the mint
  const assets = prepareCip68Assets(policyId, mints);
  const updatedState = updateStateMintData(previousState, mints.length)
  const updatedStateDatum = Data.to(updatedState, StateMintShape)

  // Setup the initial collecting of utxos and asset minting
  const tx = lucid.newTx()
  .collectFrom([stateUserUtxo]) // Assuming it comes from selected wallet
  .attachSpendingValidator(validator.policy)
  .collectFrom([stateReferenceUtxo], Data.void())
  .attachMintingPolicy(policy)
  .mintAssets({ 
    ...assets.user, 
    ...assets.reference 
  }, Data.void())
  .payToAddress(cache.recipientAddress, assets.user);

  // Separate outputs so each reference token gets its own datum
  Object.keys(assets.reference).forEach(key => {
    tx.payToAddressWithData(referenceAddress, {
      inline: assets.datums[key]
    },
    {
      [key]: 1n
    })
  });

  // Finally make sure the state is updated and paid back to the spending validator
  tx.payToAddressWithData(validator.address, {
    inline: updatedStateDatum
  }, {
    [unit.reference]: 1n
  });

  return {
    tx,
    policy,
    policyId
  }

}