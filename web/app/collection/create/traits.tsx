'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function TraitsContent() {
  return (
    <Card>
      <TraitsHeader />
    </Card>
  );
}

function TraitsHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add some traits</CardTitle>
      <div className="font-heading">
        Sometimes NFT collections include data for each NFT that desribe the image or other attributes of an NFT. These
        interchangabley referred to as attributes, properties, or traits. We will refer to them as traits. As an example
        an NFT might have a background color trait that simply indicates the background color used for the image.
      </div>

      <div className="font-heading">
        Technically different sets of traits can be added to each NFT in a collection but generally every NFT inside a
        collection has the same set of traits. To that end you can declare what traits every NFT in the collection will
        have at the collection level. This helps marketplaces to more easily extract data about your collection from the
        NFTs.
      </div>
    </CardHeader>
  );
}
