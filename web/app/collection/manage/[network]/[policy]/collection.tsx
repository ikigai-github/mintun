'use client';

import { useIsMounted } from 'usehooks-ts';

import { useManageCollectionContext } from './context';
import DraftNft from './draft-nft';
import Nft from './nft';

export default function Collection() {
  const { drafts, minted } = useManageCollectionContext();
  const isMounted = useIsMounted();

  // Can't render NFTs till we see the users wallet short of passing the wallet address
  // to the backend in a session cookie or something but for now just only render client side
  if (isMounted()) {
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
}
