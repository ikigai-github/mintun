import { GenesisForm } from '~/components/GenesisForm';

// TODO: Home page should just be links
//       1) A connect wallet button (if one isn't connected)
//       2) A list of collections managed by the connected wallet (links to the collection management page)
//       3) A create new collection button
//       4) A view field to view a collection by policy id (low low low priority)
export default function Home() {
  return (
    <main>
      <GenesisForm />
    </main>
  );
}
