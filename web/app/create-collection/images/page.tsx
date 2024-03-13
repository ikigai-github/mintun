'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { StepProgress } from '@/components/stepper';

export default function Images() {
  const router = useRouter();

  return (
    <Card className="w-full max-w-[1024px] p-4">
      <StepProgress step={4} numSteps={5} className="p-6" />
      <ImagesHeader />

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>

        <Button type="submit" form="create-collection-configure">
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}

function ImagesHeader() {
  return (
    <CardHeader>
      <CardTitle className="font-heading pb-2">Add Some Images</CardTitle>
      <div className="font-heading">
        Markets and other tools that display your collection can use additional media you provide to jazz up the
        content. This often includes a banner for your collection but can also include an avatar or brand image. This
        section allows you to include links to those extra images for your collection.
      </div>
    </CardHeader>
  );
}
