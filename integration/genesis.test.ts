import { expect, test } from 'vitest';

import { TEST_COLLECTION_INFO } from '../offchain/src/fixtures.test.ts';
import { GenesisTxBuilder } from '../offchain/src/genesis.ts';
import { submit } from '../offchain/src/utils.ts';
import { createServiceLucid } from './lucid.ts';

test(
  'Genesis mint on Preprod',
  async () => {
    const lucid = await createServiceLucid();
    const address = await lucid.wallet.address();

    const utxos = await lucid.wallet.getUtxos();

    expect(utxos.length > 0);

    const seedUtxo = utxos[0];

    // Use different address than selected wallet (account 0)
    const endMs = Date.now() + 1_000_000;
    const groupPolicyId = 'de2340edc45629456bf695200e8ea32f948a653b21ada10bc6f0c554';
    const { tx } = await GenesisTxBuilder.create(lucid)
      .seed(seedUtxo)
      .group(groupPolicyId)
      .maxNfts(1)
      .mintWindow(0, endMs)
      .nftValidatorAddress(address)
      .royaltyValidatorAddress(address)
      .ownerAddress(address)
      .info(TEST_COLLECTION_INFO)
      .useCip88(true)
      .royalty(address, 4.3)
      .build();

    const txHash = await submit(tx);
    await lucid.awaitTx(txHash);

    console.log(`Transaction submitted successfully`);
    console.log(`Tx hash: ${txHash}`);
  },
  { timeout: 10 * 60 * 1000 }
);
