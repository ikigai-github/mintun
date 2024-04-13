import { expect, test } from 'vitest';

import { createNativeMintingPolicy } from './contract';
import { TEST_COLLECTION_INFO } from './fixtures.test';
import { GenesisTxBuilder } from './genesis';
import { MintTxBuilder } from './mint';
import { ScriptCache } from './script';
import { applyScriptRefTx, applyTx, createEmulatorLucid, generateNft } from './support.test';

export async function genesis() {
  const { lucid, seedUtxo, accounts } = await createEmulatorLucid();

  const scriptReferencePolicy = await createNativeMintingPolicy(lucid, 180);
  const scriptReferencePolicyId = lucid.utils.mintingPolicyToId(scriptReferencePolicy);
  // Use different address than selected wallet (account 0)
  const endMs = Date.now() + 1_000_000;
  const groupPolicyId = 'de2340edc45629456bf695200e8ea32f948a653b21ada10bc6f0c554';
  const cache = ScriptCache.cold(lucid, seedUtxo);
  const { tx } = await GenesisTxBuilder.create(lucid)
    .seed(seedUtxo)
    .group(groupPolicyId)
    .cache(cache)
    .maxNfts(1)
    .mintWindow(0, endMs)
    .scriptReferencePolicyId(scriptReferencePolicyId)
    .useImmutableNftValidator()
    .royaltyValidatorAddress(cache.lock().address)
    .ownerAddress(await lucid.wallet.address())
    .info(TEST_COLLECTION_INFO)
    .useCip88(true)
    .royalty(accounts[0].address, 4.3)
    .build();

  const { ownerUtxo, stateUtxo, state } = await applyTx(lucid, tx, cache);

  const { mintScriptReferenceUtxo, stateScriptReferenceUtxo } = await applyScriptRefTx(
    lucid,
    scriptReferencePolicy,
    cache
  );

  return { cache, lucid, accounts, stateUtxo, ownerUtxo, state, mintScriptReferenceUtxo, stateScriptReferenceUtxo };
}

test('Mint a token', async () => {
  console.log('Creating genesis tx');
  const {
    cache,
    lucid,
    stateUtxo,
    ownerUtxo,
    state: genesisState,
    mintScriptReferenceUtxo,
    stateScriptReferenceUtxo,
  } = await genesis();

  const nft = generateNft();

  console.log('Building the actual mint transaction');

  const { tx } = await MintTxBuilder.create(lucid)
    .cache(cache)
    .stateUtxo(stateUtxo)
    .ownerUtxo(ownerUtxo)
    .mintingPolicyReferenceUtxo(mintScriptReferenceUtxo)
    .stateValidatorReferenceUtxo(stateScriptReferenceUtxo)
    .state(genesisState)
    .useCip25(true)
    .nft(nft)
    .build();

  const { state } = await applyTx(lucid, tx, cache);
  expect(state.nfts).toEqual(1);
  expect(state.nextSequence).toEqual(1);
});
