// Genesis Transaction
// 1) Select seed UTxO and collection name
// 2) Add contstraints (max tokens, mint_window, reference_address)
// 3) Optional: Set collection info
//   a) Maybe support flag to mint to state token or cip-88 metadata or both
//   b) Probably has it's own builder
// 4) Optional: Set Royalties
//   a) Should support setting a flag for also minting cip-27 null token
//   b) Should support setting an address to send royalty tokens to
// 5) Optional: Set owner recipient address
//   a) Default to current selected wallet address
// 6) Build (Fail if seed or colletion name is null)
//   a) Should include cip-88 metadata if collection info is set.
//   b) Should include cip-27 metadata if royalty and cip-27 is set
// 7) Sign

import { applyParamsToScript, Data, fromText, Lucid, toText, UTxO } from 'lucid';
import { getScript } from './validators.ts';
import { asChainAddress, asChainTimeWindow, OutputReferenceSchema, toBech32Address, toTimeWindow } from './aiken.ts';
import {
  CollectionState,
  CollectionStateMetadataShape,
  CollectionStateMetadataType,
  CollectionStateType,
} from './collection.ts';
import { createReferenceData } from './cip-68.ts';
import { getScriptInfo } from './script.ts';
import { asChainCollectionInfo } from './collection-info.ts';

/// Minting policy paramaterization schema
const MintParameterSchema = Data.Tuple([OutputReferenceSchema]);
type MintParameterType = Data.Static<typeof MintParameterSchema>;
const MintParameterShape = MintParameterSchema as unknown as MintParameterType;

/// Validator paramaterization schema
const ValidatorParameterSchema = Data.Tuple([Data.Bytes({ minLength: 28, maxLength: 28 })]);
type ValidatorParameterType = Data.Static<typeof ValidatorParameterSchema>;
const ValidatorParameterShape = ValidatorParameterSchema as unknown as ValidatorParameterType;

/// Redeemer schema for minting
const MintRedeemerSchema = Data.Enum([
  Data.Object({
    'EndpointGenesis': Data.Object({ validator_policy_id: Data.Bytes({ minLength: 28, maxLength: 28 }) }),
  }),
  Data.Literal('EndpointMint'),
  Data.Literal('EndpointBurn'),
]);
export type MintRedeemerType = Data.Static<typeof MintRedeemerSchema>;
export const MintRedeemerShape = MintRedeemerSchema as unknown as MintRedeemerType;

/// Given a unique hash and index from the seed transaction parameterizes the minting policy and returns its info
export function paramaterizeMintingPolicy(lucid: Lucid, hash: string, index: number) {
  const seed = {
    transaction_id: {
      hash,
    },
    output_index: BigInt(index),
  };

  const script = getScript('batch_mint.mint');
  const paramertizedMintingPolicy = applyParamsToScript<MintParameterType>(
    script.compiledCode,
    [seed],
    MintParameterShape,
  );
  return getScriptInfo(lucid, paramertizedMintingPolicy);
}

/// Given a minting policyparameterizes the management token spending validator and returns its info
export function paramaterizeValidator(lucid: Lucid, mintingPolicyId: string) {
  const script = getScript('batch_validator.spend');
  const paramertizedMintingPolicy = applyParamsToScript<ValidatorParameterType>(
    script.compiledCode,
    [mintingPolicyId],
    ValidatorParameterShape,
  );
  return getScriptInfo(lucid, paramertizedMintingPolicy);
}

// Given the initial state creates the genesis data.
export function createGenesisData(state: Partial<CollectionState>, includeInfo: boolean) {
  if (!state.name) {
    throw new Error('Collection name is required to generate a new collection');
  }

  const name = fromText(state.name);
  const group = state.group ?? null;
  const mint_window = state.mintWindow ? asChainTimeWindow(state.mintWindow.startMs, state.mintWindow.endMs) : null;
  const max_nfts = state.maxNfts ? BigInt(state.maxNfts) : null;
  const reference_address = state.nftReferenceTokenAddress ? asChainAddress(state.nftReferenceTokenAddress) : null;
  const info = state.info && includeInfo ? asChainCollectionInfo(state.info) : null;
  const extra = Data.void();
  const metadata: CollectionStateType = {
    name,
    group,
    mint_window,
    max_nfts,
    force_locked: false,
    current_nfts: 0n,
    next_sequence: 0n,
    reference_address,
    info,
    extra,
  };

  return createReferenceData(metadata);
}

// Decode CBOR datum of passed in UTxO and then convert the plutus data into offchain data
export async function extractCollectionState(lucid: Lucid, utxo: UTxO) {
  const chainState = await lucid.datumOf(utxo, CollectionStateMetadataShape);
  return toCollectionState(lucid, chainState);
}

/// Convert from on chain plutus data to off chain data structure
export function toCollectionState(lucid: Lucid, chainState: CollectionStateMetadataType): CollectionState {
  const { metadata } = chainState;
  const name = toText(metadata.name);
  const group = metadata.group ?? undefined;
  const mintWindow = metadata.mint_window ? toTimeWindow(metadata.mint_window) : undefined;
  const maxNfts = metadata.max_nfts ? Number(metadata.max_nfts) : undefined;
  const currentNfts = Number(metadata.current_nfts);
  const nextSequence = Number(metadata.next_sequence);
  const locked = metadata.force_locked;
  const nftReferenceTokenAddress = metadata.reference_address
    ? toBech32Address(lucid, metadata.reference_address)
    : undefined;
  const extra = metadata.extra;
  return {
    name,
    group,
    mintWindow,
    maxNfts,
    locked,
    currentNfts,
    nextSequence,
    nftReferenceTokenAddress,
    extra,
  };
}
