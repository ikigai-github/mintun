'use client';

import { setTimeout } from 'timers';
import { ChangeEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileButton } from '@/components/ui/file-button';
import { StepProgress } from '@/components/stepper';

import { useCreateCollectionContext } from '../create/context';

const waitFor = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

async function uploadFiles(files: FileList) {
  await waitFor(2000);
  console.log('yep');
}

export default function Images() {
  const { images, setImages } = useCreateCollectionContext();
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleAddFiles = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      setUploading(true);
      uploadFiles(event.target.files).finally(() => setUploading(false));
    }
  }, []);

  return (
    <Card className="w-full max-w-[1024px] p-4">
      <StepProgress step={4} numSteps={5} className="p-6" />
      <ImagesHeader />
      <CardContent>
        <FileButton onChange={handleAddFiles} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Add a file'}
        </FileButton>
      </CardContent>
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
