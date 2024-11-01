import Image from 'next/image';
import { HobbyKnifeIcon } from '@radix-ui/react-icons';

import { getWebImageUrl } from '@/lib/image';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import Tags from './tags';
import Traits from './traits';
import { CollectionNft } from './types';

function NftCard({ nft, status }: CollectionNft) {
  const url = getWebImageUrl(nft.image);

  return (
    <Card className="hover:bg-foreground/10 h-56 min-w-36 max-w-60 transition-colors">
      <div className="relative h-44 overflow-hidden rounded-t-xl">
        <img src={url} className="inset-0 size-full object-cover" alt={nft.name} />
      </div>
      <div className="flex justify-between p-4">
        <div className="font-heading truncate text-left leading-none">{nft.name}</div>
        {status === 'draft' ? <HobbyKnifeIcon className="self-end" /> : undefined}
      </div>
    </Card>
  );
}

function NftCardDetail({ nft, status }: CollectionNft) {
  const url = getWebImageUrl(nft.image);

  return (
    <div className="flex flex-col gap-4">
      <DialogHeader className="text-left">
        <div className="relative mb-4 h-72">
          {/* TODO: Make this a carousel if there is more than one image */}
          <img src={url} className="size-full object-contain" alt={nft.name} />
        </div>
        <DialogTitle className="flex items-center gap-2">
          <span className="flex-1">{nft.name}</span>
          {nft.id ? (
            <span className="text-muted-foreground max-w-[50%] truncate text-right text-xs">{nft.id}</span>
          ) : undefined}
        </DialogTitle>
        <DialogDescription>{nft.description}</DialogDescription>
      </DialogHeader>
      <Traits traits={nft.traits} />
      <Tags tags={nft.tags} />
    </div>
  );
}

export default function Nft(props: CollectionNft) {
  return (
    <Dialog>
      <DialogTrigger>
        <NftCard {...props} />
      </DialogTrigger>
      <DialogContent hideCloseIcon={true} className="min-w-sm">
        <NftCardDetail {...props} />
      </DialogContent>
    </Dialog>
  );
}
