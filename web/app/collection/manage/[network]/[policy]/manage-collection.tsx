'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import bannerPlaceholder from '@/public/banner-placeholder.webp';

import { getBannerImageUrl } from '@/lib/image';

import Collection from './collection';
import CollectionInfo from './collection-info';
import { useManageCollectionContext } from './context';

export default function ManageCollection() {
  const { info } = useManageCollectionContext();

  const bannerUrl = useMemo(() => {
    return getBannerImageUrl(info);
  }, [info]);

  return (
    <>
      {bannerUrl ? (
        <img className="h-52 max-h-52 min-h-52 rounded-t-xl object-cover" src={bannerUrl} alt="Collection Banner" />
      ) : (
        <div className="bg-accent h-52 max-h-52 min-h-52 rounded-t-xl object-cover"> </div>
      )}

      <div className="flex flex-col gap-6 rounded-b-xl border-x border-b p-6">
        <CollectionInfo />
        <Collection />
      </div>
    </>
  );
}
