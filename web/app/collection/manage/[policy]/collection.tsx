import { info } from './collection-info';
import DraftNft from './draft-nft';
import Nft from './nft';
import { drafts, minted } from './types';

export function Collection() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      <DraftNft info={info} />
      {drafts.map((nft) => (
        <Nft key={nft.name} nft={nft} status="draft" />
      ))}
      {minted.map((nft) => {
        return <Nft key={nft.name} nft={nft} status="minted-locked" />;
      })}
    </div>
  );
}
