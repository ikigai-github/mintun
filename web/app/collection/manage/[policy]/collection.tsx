'use client';

import { useManageCollectionContext } from './context';
import DraftNft from './draft-nft';
import Nft from './nft';

export default function Collection() {
  const { drafts, minted } = useManageCollectionContext();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <DraftNft />
      {drafts.map((draft) => (
        <DraftNft key={draft.key} />
      ))}
      {minted.map((nft) => {
        return <Nft key={nft.name} nft={nft} status="minted-locked" />;
      })}
    </div>
  );
}
