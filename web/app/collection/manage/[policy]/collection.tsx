'use client';

import { useEffect, useState } from 'react';

import { useManageCollectionContext } from './context';
import DraftNft from './draft-nft';
import Nft from './nft';

export default function Collection() {
  const { drafts, minted } = useManageCollectionContext();

  const [isMounted, setIsMounted] = useState(false);

  // This is a side effect that runs after the first render and sets the isMounted state to true
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // This is a conditional rendering that returns null if the component is not mounted yet
  if (!isMounted) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <DraftNft key="create" />
      {drafts.map((draft) => (
        <DraftNft key={draft.uid} uid={draft.uid} />
      ))}
      {minted.map((nft) => {
        return <Nft key={nft.name} nft={nft} status="minted-locked" />;
      })}
    </div>
  );
}
