import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReviewContent() {
  return (
    <Card>
      <ReviewHeader />
    </Card>
  );
}

function ReviewHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Review and create your collection</CardTitle>
      <div className="font-heading">
        You can review the data you filled out below. At a minimum you need a collection name and a connected wallet to
        mint a collection. If you are ready to mint click the mint button on the cart.
      </div>
      <div>
        A management token will be sent to your connected wallet. This token is how we identify you as the owner of the
        collection so you can send it to any wallet you want to use to manage the collection. Once you have this token
        you can add NFTs to the collection using our NFT minting tool.
      </div>
    </CardHeader>
  );
}
