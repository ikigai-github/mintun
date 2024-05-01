'use client';

import { useCallback, useEffect, useState } from 'react';

import { timeout } from '@/lib/utils';
import { notifyError, useWallet } from '@/lib/wallet';
import { Button } from '@/components/ui/button';
import TransactionDialog, { TransactionStatus } from '@/components/transaction-dialog';

import { useManageCollectionContext } from './context';

export default function StoreMintingPolicy() {
  const [status, setStatus] = useState<TransactionStatus>('ready');
  const { policy } = useManageCollectionContext();
  const { lucid } = useWallet();

  const storeMintingPolicy = useCallback(async () => {
    try {
      if (!lucid) {
        throw Error('Failed to connect to wallet API');
      }

      if (!lucid.wallet) {
        throw Error('Wallet is not selected. Please reconnect a wallet');
      }

      setStatus('preparing');

      const offchain = await import('@ikigai-github/mintun-offchain');
      const { cache } = await offchain.ScriptCache.fromMintPolicyId(lucid, policy);
      const tx = await offchain.createMintingPolicyReference(lucid, cache);
      const completed = await tx.complete();

      setStatus('signing');
      const signed = await timeout(
        completed.sign().complete(),
        60 * 1000,
        'Timed out waiting for signature. Please try again.'
      );

      const txHash = await timeout(
        signed.submit(),
        60 * 1000,
        'Timed out trying to submit transaction. Please try again.'
      );

      setStatus('verifying');
      await timeout(lucid.awaitTx(txHash), 5 * 60 * 1000, 'Timed out verifying transaction. Please try again.');

      setStatus('complete');
    } catch (e: unknown) {
      notifyError(e);
      setStatus('ready');
    }
  }, [lucid, policy, setStatus]);

  useEffect(() => {
    if (status === 'complete') {
      setStatus('ready');
      // TODO: Call some function to refetch the reference UTXO so the button dissappears
    }
  }, [status]);

  return (
    <TransactionDialog
      status={status}
      label="Store Minting Policy"
      submit={<Button onClick={storeMintingPolicy}>Store Minting Policy</Button>}
    >
      <div className="font-heading">Store Minting Policy</div>
      <div className="text-muted-foreground text-sm">
        The compiled minting policy can be included with each mint but this makes the transaction very large. So we need
        to save it on chain. This also saves you on fees because it makes your subsequent transaction as small as
        possible. You only have to store the policy once and it will be reused for all your mints.
      </div>
    </TransactionDialog>
  );
}
