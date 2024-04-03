import type { CollectionImage, CollectionInfo, CollectionState } from '@ikigai-github/mintun-offchain';
import { DiscordLogoIcon, GlobeIcon, InstagramLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const info: CollectionInfo = {
  name: 'Rasendriya Art',
  artist: 'Rasendriya',
  project: 'Abstract works',
  nsfw: false,
  description: 'The works of Rasendriya the artist',
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
  links: {
    website: 'https://www.grabbit.market',
    x: 'https://www.x.com/rasendriya',
  },
} as const;

export type CollectionState = {
  group?: string;
  mintWindow?: TimeWindow;
  maxNfts?: number;
  locked: boolean;
  currentNfts: number;
  nextSequence: number;
  nftValidatorAddress?: string;
};

const state: CollectionState = {
  group: '3d2097b873831f345c06b1fcaad5a3d2e0fdbc201df5a175a689c032',
};

export default function CreateCollection({ params }: { params: { policy: string } }) {
  const banner = info.images?.[0] as CollectionImage;
  const brand = info.images?.[1] as CollectionImage;

  return (
    <div className="flex w-full max-w-[1280px] flex-col">
      <img className="h-48 max-h-48 min-h-48 rounded-t-md object-cover" src={banner.src} alt="Collection Banner" />
      <div className="rounded-b-md border-x border-b">
        <div className="bg-background/50 mx-14 -mt-32 mb-4 flex flex-col gap-4 rounded-md border p-2 backdrop-blur">
          <div className="flex gap-6">
            <img src={brand.src} alt="Brand Image" className="w-32 rounded-md" />
            <div className="flex flex-1 gap-4">
              <div>
                <div className="font-heading text-2xl font-light">{info.name}</div>
                <div className="text-right text-xs font-bold">{info.project}</div>
                <div className="font-heading text-right text-sm italic">by {info.artist}</div>
              </div>

              <div className="flex flex-1 items-start justify-center">
                <div className="grid grid-cols-[auto_1fr] items-center gap-2 self-end">
                  <div className="font-heading text-right text-sm">Policy</div>
                  <div className="max-w-64 truncate text-xs">{params.policy}</div>
                  <div className="font-heading text-right text-sm">Group</div>
                  <div className="max-w-64 truncate text-xs">{state.group}</div>
                  <div className="font-heading text-right text-xs">Minting Window</div>
                  <div className="text-xs">Jun 12, 1980 - Jan 24, 1983</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-2">
                <GlobeIcon className="size-6" />
                <DiscordLogoIcon className="size-6" />
                <TwitterLogoIcon className="size-6" />
              </div>
            </div>
          </div>
          <div>{info.description}</div>
        </div>
      </div>
    </div>
  );
}
