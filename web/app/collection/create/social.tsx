import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function SocialContent() {
  return (
    <Card>
      <SocialHeader />
    </Card>
  );
}

function SocialHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Links to social media</CardTitle>
      <div className="font-heading">
        Some marketplaces might provide ways of getting to know the creator. One easy approach is to provide links to
        the creators social media. It can be helpful to provide this information as part of the collection.
      </div>
    </CardHeader>
  );
}
