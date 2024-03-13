import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function RoyaltiesContent() {
  return (
    <Card>
      <RoyaltiesHeader />
    </Card>
  );
}

function RoyaltiesHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add collection royalties</CardTitle>
      <div className="font-heading">
        If your collection is intended to be bought and sold you may want to add in royalties for each resale. Royalties
        require a percentage of any sale of NFTs in the collection go to the specified beneficiaries. Beneficiaries can
        any address which may be a charity script address or personal wallet. Keep in mind large royalties can
        discourage buying and selling. For this reason it is advisable to keep the total royalties to a small
        percentage. Also note that royalties are enforced mostly offchain and therefore are not guaranteed to be
        enforced.
      </div>
    </CardHeader>
  );
}
