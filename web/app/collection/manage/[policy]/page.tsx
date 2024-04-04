import { Collection } from './collection';
import CollectionInfo from './collection-info';

export default function CreateCollection({ params }: { params: { policy: string } }) {
  return (
    <div className="safe-center flex w-full min-w-96 max-w-[1280px] flex-col">
      <img
        className="h-52 max-h-52 min-h-52 rounded-t-md object-cover"
        src="https://w3s.link/ipfs/QmSqi7rFZ25Ca4khw4tedBoWBUWWD1mX7chMYG7UjZD9id"
        alt="Collection Banner"
      />
      <div className="flex flex-col gap-6 rounded-b-md border-x border-b p-6">
        <CollectionInfo />
        <Collection />
      </div>
    </div>
  );
}
