import { useCallback, useEffect, useMemo, useState } from 'react';
import { MintunNft } from '@ikigai-github/mintun-offchain';
import { CheckIcon } from '@radix-ui/react-icons';

import { getWebImageUrl } from '@/lib/image';
import { timeout } from '@/lib/utils';
import { notifyError, useWallet } from '@/lib/wallet';
import { Button } from '@/components/ui/button';
import TransactionDialog, { TransactionStatus } from '@/components/transaction-dialog';

import { useManageCollectionContext } from './context';

type DraftOption = {
  uid: string;
  name: string;
  url: string;
  selected: boolean;
};

export default function MintDrafts() {
  const [status, setStatus] = useState<TransactionStatus>('ready');
  const { policy, cache, state, mintReferenceUtxo, setState, setCache, drafts, setDrafts } =
    useManageCollectionContext();
  const [options, setOptions] = useState<DraftOption[]>([]);

  const { lucid } = useWallet();

  useEffect(() => {
    const sequence = state?.nextSequence || 0;
    const options = drafts.map((draft, index) => {
      const url = getWebImageUrl(draft.image.data as string);
      const name = draft.name || `#${sequence + index}`;
      const uid = draft.uid;
      const selected = index < 10;

      return { uid, name, url, selected };
    });
    setOptions(options);
  }, [drafts, state, setOptions]);

  const mintDrafts = useCallback(async () => {
    try {
      if (!lucid) {
        throw Error('Failed to connect to wallet API');
      }

      if (!lucid.wallet) {
        throw Error('Wallet is not selected. Please reconnect a wallet');
      }

      const nfts: MintunNft[] = [];
      const uids: string[] = [];
      for (const option of options) {
        if (option.selected) {
          const draft = drafts.find((draft) => draft.uid === option.uid);
          if (draft) {
            let traits: Record<string, string | number> | undefined = undefined;
            if (draft.traits.length) {
              traits = {};
              for (const trait of draft.traits) {
                traits[trait.label] = trait.trait;
              }
            }

            let tags = draft.tags.map(({ tag }) => tag);
            uids.push(draft.uid);
            nfts.push({
              name: option.name,
              image: draft.image.data as string,
              mediaType: draft.image.mime,
              description: draft.description,
              id: draft.id,
              traits,
              tags,
              files: [
                {
                  src: draft.image.data as string,
                  mediaType: draft.image.mime,
                  dimension: {
                    width: draft.image.width,
                    height: draft.image.height,
                  },
                },
              ],
            });
          }
        }
      }

      if (drafts.length === 0) {
        return;
      }

      setStatus('preparing');

      const offchain = await import('@ikigai-github/mintun-offchain');

      const builder = offchain.MintTxBuilder.create(lucid);

      if (cache) {
        builder.cache(cache);
      } else {
        builder.mintingPolicyId(policy);
      }

      if (mintReferenceUtxo) {
        builder.mintingPolicyReferenceUtxo(mintReferenceUtxo);
      }

      // TODO: Can add to ui to let them set the
      const recipient = await lucid.wallet.address();

      builder.nfts(nfts, recipient);

      const { tx, cache: newCache, state: nextState } = await builder.build();

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

      setCache(newCache);
      setState(nextState);
      setDrafts((current) => {
        return current.filter((draft) => !uids.includes(draft.uid));
      });
      setStatus('complete');
    } catch (e: unknown) {
      notifyError(e);
      setStatus('ready');
    }
  }, [lucid, policy, cache, state, mintReferenceUtxo, setStatus, setDrafts, options]);

  const onSelectToggle = useCallback(
    (index: number) => {
      setOptions((options) => {
        if (index >= 0) {
          const option = options[index];
          const newOption = { ...option, selected: !option.selected };
          return options.toSpliced(index, 1, newOption);
        } else {
          return options;
        }
      });
    },
    [setOptions]
  );

  return (
    <TransactionDialog status={status} label="Mint Drafts" submit={<Button onClick={mintDrafts}>Mint Selected</Button>}>
      <div className="font-heading font-bold">Select and Mint Drafts</div>
      <div>Here are the drafts you can pick up to 10 of em.</div>
      <ul className="bg-accent flex flex-col gap-2 border p-2">
        {options.map((option, index) => {
          return (
            <li key={option.uid} className="flex flex-row items-center gap-2" onClick={() => onSelectToggle(index)}>
              {option.selected ? <CheckIcon className="size-6" /> : <div className="size-6"></div>}
              <img src={option.url} className="size-10 rounded-md" />
              <span>{option.name || 'cheez'}</span>
            </li>
          );
        })}
      </ul>
    </TransactionDialog>
  );
}
