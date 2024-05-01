'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Network } from 'lucid-cardano';
import { Img } from 'react-image';

import { CollectionInfoWithPolicy, getAllWalletCollections } from '@/lib/collection';
import { getBrandImageUrl } from '@/lib/image';
import { useWallet } from '@/lib/wallet';

type CollectionCardProps = {
  info: CollectionInfoWithPolicy;
  network: Network;
};

const CollectionCard = ({ info, network }: CollectionCardProps) => {
  const src = [
    getBrandImageUrl(info) || '/collection-thumbnail-placeholder.webp',
    '/collection-thumbnail-placeholder.webp',
  ];
  const name = info.name;

  return (
    <Link href={`/collection/manage/${network}/${info.policyId}`}>
      <div className="bg-accent duration-250 grid h-60 grid-cols-1 grid-rows-1 rounded-xl border transition-transform hover:scale-105">
        <Img className="col-start-1 row-start-1 size-full rounded-xl object-cover" src={src} alt={name} />
        <div className="bg-accent/30 text-primary-foreground dark:text-foreground font-heading col-start-1 row-start-1 m-2 self-end justify-self-center rounded-xl p-2 text-lg backdrop-blur-sm">
          {name}
        </div>
      </div>
    </Link>
  );
};

export default function CollectionsList() {
  const [infos, setInfos] = useState<CollectionInfoWithPolicy[]>([]);
  const { lucid, isConnected, network } = useWallet();

  useEffect(() => {
    if (isConnected && lucid) getAllWalletCollections(lucid).then((infos) => setInfos(infos));
  }, [isConnected, lucid]);

  if (infos.length) {
    return (
      <>
        <div className="mb-6 text-2xl font-bold">Manage Collections</div>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {infos.map((info) => (
            <CollectionCard info={info} key={`collection-card-${info.policyId}`} network={network} />
          ))}
        </div>
      </>
    );
  }
}
