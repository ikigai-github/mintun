import type { CollectionImage, CollectionInfo, CollectionState } from '@ikigai-github/mintun-offchain';
import { DiscordLogoIcon, GlobeIcon, InfoCircledIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';

import { Button } from '@/components/ui/button';

import StoreMintingPolicy from './store-minting-policy';

export const info: CollectionInfo = {
  name: 'Rasendriya Unlimited Artworks',
  artist: 'Rasendriya',
  project: 'Abstract works',
  nsfw: false,
  description: 'The works of Rasendriya the artist. This is the max length of a description.',
  images: [
    {
      purpose: 'Banner',
      src: 'https://ipfs.grabbit.market/ipfs/QmSqi7rFZ25Ca4khw4tedBoWBUWWD1mX7chMYG7UjZD9id?pinataGatewayToken=aIEWTKfwAwdmav4oVVCCQLMokn4yliahcmeF4KLyiFm5J8-luyvpvtevnzWwYvQY',
      mediaType: 'image/jpeg',
      dimension: { width: 3000, height: 1000 },
    },
    {
      purpose: 'Brand',
      src: 'https://ipfs.grabbit.market/ipfs/QmQF8y77WfcsXdrnhmbcHZYHgrY8oGWdjLNZnsSgFzjx6S?pinataGatewayToken=aIEWTKfwAwdmav4oVVCCQLMokn4yliahcmeF4KLyiFm5J8-luyvpvtevnzWwYvQY',
      mediaType: 'image/jpeg',
      dimension: { width: 200, height: 200 },
    },
  ],
  traits: ['action', 'type', 'background'],
  links: {
    website: 'https://www.grabbit.market',
    x: 'https://www.x.com/rasendriya',
  },
} as const;

const state: CollectionState = {
  info: {
    seed: {
      hash: 'abc133',
      index: 0,
    },
    group: '3d2097b873831f345c06b1fcaad5a3d2e0fdbc201df5a175a689c032',
    mintWindow: {
      fromMs: 0,
      toMs: 10000000000,
    },
    maxNfts: 100,
    scriptReferencePolicyId: '3d2097b873831f345c06b1fcaad5a3d2e0fdbc201df5a175a689c032',
    nftValidatorAddress: 'addr1abc',
  },
  locked: false,
  nfts: 20,
  nextSequence: 24,
};

export default function CollectionInfo() {
  const brand = info.images?.[1] as CollectionImage;

  return (
    <div className="bg-background/50 -mt-44 flex flex-col gap-4 rounded-xl border p-4 backdrop-blur">
      <div className="flex min-h-36 gap-6">
        <img src={brand.src} alt="Brand Image" className="size-32 rounded-xl object-cover" />

        <div className="flex flex-col gap-4 md:flex-1 md:flex-row">
          <div className="flex-0 md:flex-1">
            <div className="flex w-fit flex-col pr-4">
              <div className="font-heading text-2xl font-light">{info.name}</div>
              <div className="text-right text-xs font-bold">{info.project}</div>
              <div className="font-heading text-right text-sm italic">by {info.artist}</div>
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

      <div className="text-muted-foreground truncate text-sm italic">{info.description}</div>

      <div className="flex flex-col justify-between gap-6 pr-4 md:flex-row md:items-end">
        <div className="grid grid-cols-[auto_1fr] items-center gap-2">
          <div className="font-heading text-xs">Minting Window</div>
          <div className="text-xs">32 days remain</div>
          <div className="font-heading text-sm">Policy</div>
          <div className="truncate text-xs">{state.info.group}</div>
          <div className="font-heading text-sm">Group</div>
          <div className="truncate text-xs">{state.info.group}</div>
          <div className="font-heading text-sm">Royalties</div>
          <div className="flex items-center gap-2 truncate text-xs">
            <span>2%</span> <InfoCircledIcon className="size-3" />
            {/* TODO: Add tooltip that shows the full royalty breakdown */}
          </div>
          <div className="font-heading text-sm">Minted</div>
          <div className="truncate text-xs">
            {state.nfts}/{state.info.maxNfts} NFTs
          </div>
          <div className="font-heading text-sm">Drafts</div>
          <div className="truncate text-xs">10 NFTs ready to mint</div>
          <div className="font-heading text-sm">Minting</div>
          <div className="truncate text-xs">2 mints in progress</div>
        </div>
        <div className="flex flex-col gap-4">
          <StoreMintingPolicy />
          <Button>Mint Drafts</Button>
        </div>
      </div>
    </div>
  );
}
