'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { set } from 'date-fns';
import { parse } from 'valibot';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarDropzone, BannerDropzone, ThumbnailDropzone } from '@/components/image-dropzone';
import { StepProgress } from '@/components/stepper';
import { MOCK_TOKEN_CARDS, TokenCardList } from '@/components/token-card';

import { UploadImageSchema, useCreateCollectionContext } from '../context';

export default function Edit() {
  const { images, setImages } = useCreateCollectionContext();
  const [emptyImages, setEmptyImages] = useState(false);
  const router = useRouter();

  function onSubmit() {
    try {
      const imagesResult = parse(UploadImageSchema, images);
      if (imagesResult) {
        setEmptyImages(false);
        router.push('/create-collection/configure');
      }
    } catch (error) {
      setEmptyImages(true);
      console.error({ error });
    }
  }

  return (
    <Card className="w-full max-w-[1024px] overflow-scroll p-4">
      <StepProgress step={2} numSteps={5} className="p-6" />

      <Tabs defaultValue="desktop" className="">
        <CardHeader>
          <div className="justify-between sm:flex">
            <CardTitle className="font-heading pb-2">Edit your collection</CardTitle>
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="tablet">Tablet</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
          </div>
          <div className="font-heading">
            Edit your avatar, banner, and thumbnail image for your collection. Images loaded in each view can be
            different and will only overwrite that view.
          </div>
        </CardHeader>

        <TabsContent className="w-[1024px] min-w-[1024px] max-w-[1024px]" value="desktop">
          <div className="p-3">
            <div className="mb-4 flex gap-6">
              <AvatarDropzone
                className="min-w-[200px]"
                imageClassName="min-w-[200px]"
                callback={setImages}
                imagesState={images}
                view="desktop"
              />
              <BannerDropzone
                className="min-w-[750px]"
                imageClassName="min-w-[750px]"
                callback={setImages}
                imagesState={images}
                view="desktop"
              />
            </div>
            <div className="flex gap-6">
              <div className="w-[200px]">
                <p className="mb-4 px-2 opacity-70">Below is a preview of your collection in a card view</p>
                <div className="flex flex-col justify-center overflow-hidden rounded-md border">
                  <ThumbnailDropzone callback={setImages} imagesState={images} view="desktop" />
                  <div className="px-1">
                    <p className="pt-2 opacity-70">Brand Name</p>
                    <p className="mb-3">Collection Name</p>
                    <p className="text-end opacity-70">Artist Name</p>
                  </div>
                </div>
              </div>
              <TokenCardList tokenCards={MOCK_TOKEN_CARDS} />
            </div>
          </div>
        </TabsContent>
        <TabsContent className=" ml-auto mr-auto min-w-[768px] max-w-[768px] p-3" value="tablet">
          <BannerDropzone
            className="mb-3"
            imageClassName="w-full"
            callback={setImages}
            imagesState={images}
            view="tablet"
          />
          <div className="flex items-start gap-6">
            <div className="w-[200px]">
              <AvatarDropzone className={'mb-3 sm:mb-0 '} callback={setImages} imagesState={images} view="tablet" />
              <p className="mb-4 mt-2 px-2 opacity-70">Below is a preview of your collection in a card view</p>
              <div className="flex flex-col justify-center overflow-hidden rounded-md border">
                <ThumbnailDropzone callback={setImages} imagesState={images} view="tablet" />
                <div className="px-1">
                  <p className="pt-2 opacity-70">Brand Name</p>
                  <p className="mb-3">Collection Name</p>
                  <p className="text-end opacity-70">Artist Name</p>
                </div>
              </div>
            </div>
            <TokenCardList tokenCards={MOCK_TOKEN_CARDS} />
          </div>
        </TabsContent>
        <TabsContent className="ml-auto mr-auto w-[490px] min-w-[490px] max-w-[490px] p-3" value="mobile">
          <BannerDropzone
            className="mb-3"
            imageClassName="w-full"
            callback={setImages}
            imagesState={images}
            view="mobile"
          />
          <div className="flex items-center justify-center">
            <div>
              <AvatarDropzone
                className="mb-3 w-full"
                imageClassName="w-full"
                callback={setImages}
                imagesState={images}
                view="mobile"
              />
              <div className="mb-3 flex w-full flex-col justify-center overflow-hidden rounded-md border">
                <ThumbnailDropzone
                  className="w-full"
                  imageClassName="w-full"
                  callback={setImages}
                  imagesState={images}
                  view="mobile"
                />
                <div className="px-1">
                  <p className="pt-2 opacity-70">Brand Name</p>
                  <p className="mb-3">Collection Name</p>
                  <p className="text-end opacity-70">Artist Name</p>
                </div>
              </div>
              <TokenCardList tokenCards={MOCK_TOKEN_CARDS} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <div>
          <Button type="submit" onClick={onSubmit}>
            Next
          </Button>
          {emptyImages && <p className="text-red-500">Missing Images</p>}
        </div>
      </CardFooter>
    </Card>
  );
}
