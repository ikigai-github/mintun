'use client';

import Collection from './collection';
import CollectionInfo from './collection-info';
import { useManageCollectionContext } from './context';

export default function ManageCollection() {
  const { isInitialized, isInitializing, error } = useManageCollectionContext();

  if (isInitialized) {
    return (
      <>
        <img
          className="h-52 max-h-52 min-h-52 rounded-t-xl object-cover"
          src="https://w3s.link/ipfs/QmSqi7rFZ25Ca4khw4tedBoWBUWWD1mX7chMYG7UjZD9id"
          alt="Collection Banner"
        />
        <div className="flex flex-col gap-6 rounded-b-xl border-x border-b p-6">
          <CollectionInfo />
          <Collection />
        </div>
      </>
    );
  } else if (isInitializing) {
    return 'Initializing friend...';
  } else {
    return `Broked: ${error}`;
  }
}
