'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import brandPlaceholder from '@/public/brand-placeholder.webp';
import type { CollectionInfo } from '@ikigai-github/mintun-offchain';
import { DiscordLogoIcon, GlobeIcon, InfoCircledIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { formatDistanceStrict, formatDistanceToNow } from 'date-fns';
import { useIsMounted } from 'usehooks-ts';

import { getBrandImageUrl } from '@/lib/image';

import { useManageCollectionContext } from './context';
import MintDrafts from './mint-drafts';
import StoreMintingPolicy from './store-minting-policy';

export default function CollectionInfo() {
  const { info, state, policy, drafts, mintReferenceUtxo } = useManageCollectionContext();
  const brandUrl = getBrandImageUrl(info);

  const isMounted = useIsMounted();

  const remaining = useMemo(() => {
    if (state?.info.mintWindow) {
      const { toMs, fromMs } = state.info.mintWindow;
      if (toMs > Date.now()) {
        return `${formatDistanceStrict(toMs, fromMs)} remains`;
      } else {
        return `Ended ${formatDistanceToNow(toMs)} ago`;
      }
    }
  }, [state]);

  return (
    <div className="bg-background/50 -mt-44 flex flex-col gap-4 rounded-xl border p-4 backdrop-blur">
      <div className="flex min-h-36 gap-6">
        {info ? (
          brandUrl ? (
            <img src={brandUrl} alt="Brand Image" className="size-32 rounded-xl object-cover" />
          ) : undefined
        ) : (
          <Image src={brandPlaceholder} alt="Brand Image" className="size-32 rounded-xl object-cover" />
        )}

        <div className="flex flex-col gap-4 md:flex-1 md:flex-row">
          <div className="flex-0 md:flex-1">
            <div className="flex w-fit flex-col pr-4">
              <div className="font-heading text-2xl font-light">{info?.name || 'Loading Collection Info...'}</div>
              <div className="text-right text-xs font-bold">{info?.project}</div>
              <div className="font-heading text-right text-sm italic">{info?.artist ? `by ${info.artist}` : ''}</div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 p-4 md:items-start">
            <GlobeIcon className="size-6" />
            <DiscordLogoIcon className="size-6" />
            <TwitterLogoIcon className="size-6" />
            <InstagramLogoIcon className="size-6" />
          </div>
        </div>
      </div>

      <div className="text-muted-foreground truncate text-sm italic">{info?.description}</div>

      <div className="flex flex-col justify-between gap-6 pr-4 md:flex-row md:items-end">
        <div className="grid grid-cols-[auto_1fr] items-center gap-2 gap-x-4">
          {isMounted() && remaining ? (
            <>
              <div className="font-heading text-xs">Minting Window</div>
              <div className="text-xs">{remaining}</div>
            </>
          ) : undefined}

          <div className="font-heading text-sm">Policy</div>
          <div className="truncate text-xs">{policy}</div>
          {isMounted() && state?.info.group ? (
            <>
              <div className="font-heading text-sm">Group</div>
              <div className="truncate text-xs">{state.info.group}</div>
            </>
          ) : undefined}

          <div className="font-heading text-sm">Royalties</div>
          <div className="flex items-center gap-2 truncate text-xs">
            <span>2%</span> <InfoCircledIcon className="size-3" />
          </div>
          <div className="font-heading text-sm">Minted</div>
          <div className="truncate text-xs">
            {isMounted()
              ? state?.info.maxNfts
                ? `${state.nfts} / ${state.info.maxNfts} `
                : `${state?.nfts || 0} `
              : undefined}
            NFTs
          </div>
          <div className="font-heading text-sm">Drafts</div>
          <div className="truncate text-xs">{drafts.length} NFTs ready to mint</div>
        </div>
        <div className="flex flex-col gap-4">{mintReferenceUtxo ? <MintDrafts /> : <StoreMintingPolicy />}</div>
      </div>
    </div>
  );
}
