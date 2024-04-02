import type { CollectionImage, CollectionInfo } from '@ikigai-github/mintun-offchain';

const info: CollectionInfo = {
  name: 'Rasendriya Art',
  artist: 'Rasendriya',
  project: 'Abstract works',
  nsfw: false,
  description: 'The works of Rasendriya the artist',
  images: [
    {
      purpose: 'Banner',
      src: 'ipfs://QmSqi7rFZ25Ca4khw4tedBoWBUWWD1mX7chMYG7UjZD9id',
      mediaType: 'image/jpeg',
      dimension: { width: 3000, height: 1000 },
    },
  ],
} as const;

export default function CreateCollection({ params }: { params: { policy: string } }) {
  const banner = info.images?.[0] as CollectionImage;

  return (
    <div className="flex w-full max-w-[1280px] flex-col">
      <img
        className="max-h-48 rounded-t-md object-cover"
        src="https://ipfs.grabbit.market/ipfs/QmSqi7rFZ25Ca4khw4tedBoWBUWWD1mX7chMYG7UjZD9id?pinataGatewayToken=aIEWTKfwAwdmav4oVVCCQLMokn4yliahcmeF4KLyiFm5J8-luyvpvtevnzWwYvQY"
        alt="Collection Banenr"
      />
      <div className="rounded-b-md border-b border-l border-r">Oh hey der {params.policy}</div>
    </div>
  );
}
