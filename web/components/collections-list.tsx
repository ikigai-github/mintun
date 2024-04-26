'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CollectionInfo } from '@ikigai-github/mintun-offchain';

import { getCollectionsInfo } from '@/lib/collection';
import { getCollectionImageSrc } from '@/lib/image';
import { useWallet } from '@/lib/wallet';

import { Card, CardContent, CardFooter } from './ui/card';

type CollectionCardProps = {
  name: string;
  imageSrc: string;
};

const CollectionCard = ({ name, imageSrc }: CollectionCardProps) => {
  return (
    <Link href="/">
      <Card>
        <CardContent className="flex justify-center p-8">
          <img
            className="h-48 w-full object-cover object-center transition-transform duration-500 hover:scale-110"
            src={imageSrc}
            alt={name}
            width={200}
            height={200}
          />
        </CardContent>
        <CardFooter>{name}</CardFooter>
      </Card>
    </Link>
  );
};

export default function CollectionsList() {
  const [collectionsInfo, setCollectionsInfo] = useState<CollectionInfo[]>([]);
  const { lucid, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && lucid) getCollectionsInfo(lucid).then((collectionsInfo) => setCollectionsInfo(collectionsInfo));
  }, [isConnected, lucid]);

  return (
    <>
      <div className="mb-6 text-2xl font-bold">Manage Collections</div>
      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* could have some loading state so we can show a label if no collections here */}
        {collectionsInfo.map((collection) => (
          <CollectionCard
            key={`collection-card-${collection.name}`}
            name={collection.name}
            imageSrc={getCollectionImageSrc(collection)}
          />
        ))}
      </div>
    </>
  );
}
