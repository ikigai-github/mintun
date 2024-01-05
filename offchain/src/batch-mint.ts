// import { applyParamsToScript, Data, fromText, Lucid, UTxO } from 'lucid';
// import { getScript } from './validators.ts';
// import { PolicyIdSchema, toBech32Address } from './aiken.ts';
// import {
//   getStateReferenceUnit,
//   getStateUserUnit,
//   paramaterizeStateMintingPolicy,
//   paramaterizeStateValidator,
//   readStateData,
//   StateMintData,
//   StateMintShape,
//   StateUnitLookup,
//   updateStateMintData,
// } from './state-mint.ts';
// import {
//   createReferenceData,
//   makeNftUnit,
//   makeReferenceUnit,
//   NftMetadata,
//   NftMetadataFile,
//   NftShape,
// } from './cip-68.ts';
// import { getValidatorInfo, ValidatorInfo } from './utils.ts';
// import { TxReference } from './utils.ts';

// // Batch Minting policy params schema
// const ParamsSchema = Data.Tuple([PolicyIdSchema]);
// type Params = Data.Static<typeof ParamsSchema>;
// const Params = ParamsSchema as unknown as Params;

// /// Allow passing in as little or as much already computed data as possible
// /// This cache will be updated if a some part is missing. The only case where
// /// cache may fail is if seed or recipient is undefined so those are required
// export type BatchMintCache = {
//   seed: TxReference;
//   recipientAddress: string;
//   inlineDatum: boolean;
//   stateMint?: ValidatorInfo;
//   stateValidator?: ValidatorInfo;
//   batchMint?: ValidatorInfo;
//   unit: StateUnitLookup;
//   stateUserUtxo?: UTxO;
//   stateReferenceUtxo?: UTxO;
//   previousState?: StateMintData;
//   referenceAddress?: string;
// };

// export type NftMint = {
//   name: string;
//   metadata: NftMetadata;
// };

// /// Uses the passed in state minting policy id to paramaterize the batch mint script
// export function paramaterizeBatchMintingPolicy(lucid: Lucid, stateMintPolicyId: string) {
//   const validator = getScript('batch_mint.mint');
//   const paramaterizedMintingPolicy = applyParamsToScript<Params>(validator.compiledCode, [stateMintPolicyId], Params);
//   return getValidatorInfo(lucid, paramaterizedMintingPolicy);
// }

// /// If the state minting policy is not in the cache it parameterizes and caches the minting policy.
// /// Returns the cached and compiled state minting policy.
// function getStateMint(lucid: Lucid, cache: BatchMintCache): ValidatorInfo {
//   const { stateMint, seed } = cache;
//   if (!stateMint) {
//     cache.stateMint = paramaterizeStateMintingPolicy(lucid, seed);
//   }

//   if (!cache.stateMint) {
//     throw Error('Failed to paramaterize state minting policy');
//   }

//   return cache.stateMint;
// }

// /// if the state spending validator is not in the cache it parameterizes and caches the validator.
// /// Returns the cached and compiled state validator.
// function getStateValidator(lucid: Lucid, cache: BatchMintCache): ValidatorInfo {
//   const { stateValidator } = cache;
//   if (!stateValidator) {
//     const stateMint = getStateMint(lucid, cache);
//     cache.stateValidator = paramaterizeStateValidator(lucid, stateMint.policyId);
//   }

//   if (!cache.stateValidator) {
//     throw Error('Failed to paramaterize state validator');
//   }

//   return cache.stateValidator;
// }

// /// If the batch mint policy is not in the cache it parameterizes and caches the validator.
// /// Returns the cached batch minting policy.
// function getBatchMint(lucid: Lucid, cache: BatchMintCache): ValidatorInfo {
//   const { batchMint } = cache;
//   if (!batchMint) {
//     const stateMint = getStateMint(lucid, cache);
//     cache.batchMint = paramaterizeBatchMintingPolicy(lucid, stateMint.policyId);
//   }

//   if (!cache.batchMint) {
//     throw Error('Failed to parameterize batch minting policy');
//   }

//   return cache.batchMint;
// }

// /// If the unit names of the tokens minted by the state minting policy are not cache it computes and caches the names.
// /// Returns the unit names of the cached state minting policy.
// function getUnit(lucid: Lucid, cache: BatchMintCache) {
//   const { unit } = cache;
//   if (!unit) {
//     const mint = getStateMint(lucid, cache);
//     const reference = getStateReferenceUnit(mint.policyId);
//     const user = getStateUserUnit(mint.policyId);

//     cache.unit = { reference, user };
//   }

//   return cache.unit;
// }

// /// If the state user token has not already been fetch it will fetch and cache the utxo containg the latest state token/datum.
// /// Returns the cached token. This cache item should be cleared if it is to be reused and the token is spent.
// async function getStateUserUtxo(lucid: Lucid, cache: BatchMintCache) {
//   const { stateUserUtxo } = cache;
//   if (!stateUserUtxo) {
//     const unit = getUnit(lucid, cache);

//     // Normally should be in the wallet
//     if (lucid.wallet) {
//       const utxos = await lucid.wallet.getUtxos();
//       cache.stateUserUtxo = utxos.find((utxo) => utxo.assets[unit.user]);
//     }

//     // Wider net search but may not be spendable using default prepare tx method
//     if (!cache.stateUserUtxo) {
//       cache.stateUserUtxo = await lucid.utxoByUnit(unit.user);
//     }
//   }

//   if (!cache.stateUserUtxo) {
//     throw Error('Could not find the derived UTxO on chain');
//   }

//   return cache.stateUserUtxo;
// }

// /// Finds the state reference UTxO if it is not cached.  It may fail to find the UTxO if it has not been minted or has been burned.
// /// Returns the cached state reference Utxo.  This UTxO should be removed from the cache if it is to be reused across multple transactions.
// async function getStateReferenceUtxo(lucid: Lucid, cache: BatchMintCache) {
//   const { stateReferenceUtxo } = cache;
//   if (!stateReferenceUtxo) {
//     const validator = getStateValidator(lucid, cache);
//     const unit = getUnit(lucid, cache);
//     const utxos = await lucid.utxosAt(validator.address);
//     cache.stateReferenceUtxo = utxos.find((utxo) => utxo.assets[unit.reference]);
//   }

//   if (!cache.stateReferenceUtxo) {
//     throw Error('Could not find the derived UTxO on chain');
//   }

//   return cache.stateReferenceUtxo;
// }

// /// Grabs the state data from the cached state reference UTxO and caches it, if not already cached.
// /// Returns the cached previous state.  This cache item should be cleared after a TX if the cache it to be reused.
// async function getPreviousState(lucid: Lucid, cache: BatchMintCache) {
//   const { previousState } = cache;
//   if (!previousState) {
//     const stateReferenceUtxo = await getStateReferenceUtxo(lucid, cache);
//     cache.previousState = await readStateData(lucid, stateReferenceUtxo);
//   }

//   if (!cache.previousState) {
//     throw Error('Could not get the previous state of the mint');
//   }

//   return cache.previousState;
// }

// /// Get the reference address that batch minted reference tokens are sent to from the cache.
// /// If the reference addres is not cached it grabs the address from the state token data.
// /// If a reference address is not set on the state data then it assumes the current selected wallet is that address.
// async function getReferenceAddress(lucid: Lucid, cache: BatchMintCache) {
//   const { referenceAddress } = cache;
//   if (!referenceAddress) {
//     const previousState = await getPreviousState(lucid, cache);
//     if (previousState.metadata.reference_address) {
//       cache.referenceAddress = toBech32Address(lucid, previousState.metadata.reference_address);
//     } else {
//       cache.referenceAddress = await lucid.wallet.address();
//     }
//   }

//   if (!cache.referenceAddress) {
//     throw Error('Could not determine the reference address to send tokens to');
//   }

//   return cache.referenceAddress;
// }

// function prepareCip68Assets(policyId: string, mints: NftMint[]) {
//   const user: Record<string, bigint> = {};
//   const reference: Record<string, bigint> = {};
//   const datums: Record<string, string> = {};
//   const encodedMints = mints.map(encodeMint);
//   for (const mint of encodedMints) {
//     const userUnit = makeNftUnit(policyId, mint.name);
//     const referenceUnit = makeReferenceUnit(policyId, mint.name);
//     const data = createReferenceData(mint.metadata);
//     const datum = Data.to(data, NftShape);

//     user[userUnit] = 1n;
//     reference[referenceUnit] = 1n;
//     datums[referenceUnit] = datum;
//   }

//   return {
//     user,
//     reference,
//     datums,
//   };
// }

// // TODO: Add optional parameter for minting royalty
// // TODO: Add checks on max tokens and valid time range to prevent failing transactions for errors we can prevent
// // TODO: Make inlining the datum configurable
// // TODO: Get a better understanding of how to put multiple datums into a single output, if that is even possible to start.
// export async function prepareBatchMintTx(lucid: Lucid, cache: BatchMintCache, mints: NftMint[]) {
//   // Grab from the cache the data needed to prepare the mint
//   const unit = getUnit(lucid, cache);
//   const stateValidator = getStateValidator(lucid, cache);
//   const batchMint = getBatchMint(lucid, cache);
//   const stateUserUtxo = await getStateUserUtxo(lucid, cache);
//   const stateReferenceUtxo = await getStateReferenceUtxo(lucid, cache);
//   const previousState = await getPreviousState(lucid, cache);
//   const referenceAddress = await getReferenceAddress(lucid, cache);

//   // Prepare all the assets and datums for the mint
//   const assets = prepareCip68Assets(batchMint.policyId, mints);
//   const updatedState = updateStateMintData(previousState, mints.length);
//   const updatedStateDatum = Data.to(updatedState, StateMintShape);

//   // Setup the initial collecting of utxos and asset minting
//   const tx = lucid.newTx()
//     .collectFrom([stateUserUtxo]) // Assuming it comes from selected wallet
//     .attachSpendingValidator(stateValidator.script)
//     .collectFrom([stateReferenceUtxo], Data.void())
//     .attachMintingPolicy(batchMint.script)
//     .mintAssets({
//       ...assets.user,
//       ...assets.reference,
//     }, Data.void())
//     .payToAddress(cache.recipientAddress, assets.user);

//   // Separate outputs so each reference token gets its own datum
//   Object.keys(assets.reference).forEach((key) => {
//     const outputData = {
//       [cache.inlineDatum ? 'inline' : 'asHash']: assets.datums[key],
//     };

//     tx.payToAddressWithData(referenceAddress, outputData, { [key]: 1n });
//   });

//   // Finally make sure the state is updated and paid back to the spending validator
//   tx.payToAddressWithData(stateValidator.address, {
//     inline: updatedStateDatum,
//   }, {
//     [unit.reference]: 1n,
//   });

//   return tx;
// }

// function encodeMint(mint: NftMint): NftMint {
//   const { name, metadata } = mint;
//   const description = metadata.description ? Data.fromJson(metadata.description) : null;
//   const files = metadata.files ? metadata.files.map(encodeFile) : null;
//   const attributes = metadata.attributes ? Data.fromJson(metadata.attributes) as Map<string, Data> : null;
//   const tags = metadata.tags ? metadata.tags.map(fromText) : null;
//   const id = metadata.id ? fromText(metadata.id) : null;
//   const type = metadata.type ? fromText(metadata.type) : null;

//   return {
//     name: fromText(name),
//     metadata: {
//       name: fromText(metadata.name),
//       image: fromText(metadata.image),
//       description,
//       files,
//       attributes,
//       tags,
//       id,
//       type,
//     },
//   };
// }

// function encodeFile(file: NftMetadataFile): NftMetadataFile {
//   return {
//     name: file.name ? fromText(file.name) : null,
//     mediaType: fromText(file.mediaType),
//     src: fromText(file.src),
//   };
// }
