'use client';

import { useCallback } from 'react';

import { ImageDetail, ImagePurpose } from '@/lib/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageDropzone from '@/components/image-dropzone';

import { useCreateCollectionContext } from './context';

export default function Images() {
  return (
    <Card>
      <Tabs defaultValue="default">
        <CardHeader>
          <div className="justify-between sm:flex">
            <CardTitle className="font-heading pb-2">Add market images</CardTitle>
          </div>
          <CardDescription className="font-heading">
            When markets display your collection they often use additional images to personalize the collection page.
            This includes things like brand, banner, and thumbnail images. You can add those types of images in the area
            below and preview the banners at different potential resolutions. The desktop resolution is also the default
            image if you set a different image for mobile and tablet it will override the default at that resolution.
          </CardDescription>
        </CardHeader>

        <div className="flex items-center justify-center">
          <TabsList>
            <TabsTrigger value="default">Default</TabsTrigger>
            <TabsTrigger value="tablet">Tablet</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="thumbnail">Thumbnail</TabsTrigger>
          </TabsList>
        </div>

        <div className="overflow-x-auto p-4 pt-0">
          <TabsContent value="default" className="min-w-[768px] max-w-[1920px]">
            <DesktopImageZone />
            <div className="text-muted-foreground flex w-full justify-center p-4 text-center text-sm italic">
              Set the default images you would like to display as your collection banner and brand image
            </div>
          </TabsContent>

          <TabsContent value="tablet" className="justify-safe flex flex-col">
            <TabletImageZone />
            <div className="text-muted-foreground flex w-full justify-center p-4 text-center text-sm italic">
              You can set images here if you prefer different images than the default for displays with a width around
              768 to 1024 pixels
            </div>
          </TabsContent>
          <TabsContent value="mobile" className="flex flex-col items-center justify-center">
            <MobileImageZone />

            <div className="text-muted-foreground flex w-full justify-center p-4 text-center text-sm italic">
              You can set images here if you prefer different images than the default for displays with a width around
              360 to 420 pixels
            </div>
          </TabsContent>
          <TabsContent value="thumbnail" className="flex flex-col items-center justify-center p-2">
            <ThumbnailImageZone />
            <div className="text-muted-foreground p-4 text-center text-sm italic">
              You can set images here if you prefer different images than the default for displays with a width around
              768 to 1024 pixels
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

function DesktopImageZone() {
  const { images, updateImage, describe } = useCreateCollectionContext();

  const onBannerChange = useCallback((image?: ImageDetail) => updateImage('desktop', ImagePurpose.Banner, image), []);
  const onBrandChange = useCallback((image?: ImageDetail) => updateImage('desktop', ImagePurpose.Brand, image), []);

  return (
    <div className="flex flex-col p-4">
      <div className="grid-span-1 grid grid-cols-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-bl-full"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          onImageChange={onBannerChange}
          selectedImage={images.desktop.Banner}
          dropMessage={
            <div className="ml-60 flex w-full items-center justify-center">
              <span className="text-center">
                Drop a file or click to add a <b>default</b> banner
              </span>
            </div>
          }
        >
          <div className="ml-64 mr-4 grid h-full grid-cols-1 grid-rows-1 items-center">
            <div className="col-start-1 row-start-1 w-fit rounded-md p-2 backdrop-blur-md">
              <div className="text-shadow text-3xl font-bold">{describe.collection}</div>
              <div className="text-shadow text-xl">{describe.project}</div>
            </div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="size-60 rounded-b-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'col-start-1 row-start-1 '}
          className="object-cover shadow-lg"
          onImageChange={onBrandChange}
          selectedImage={images.desktop.Brand}
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>default</b> brand or avatar image
              </span>
            </div>
          }
        />
      </div>
      <div className="text-foreground/20 -mt-28 flex h-60 w-full items-center justify-center rounded-b-md border-b border-l border-r text-center text-3xl italic">
        <span className="mt-14">Your NFT Collection would appear here</span>
      </div>
    </div>
  );
}

function TabletImageZone() {
  const { images, updateImage, describe } = useCreateCollectionContext();

  const onBannerChange = useCallback((image?: ImageDetail) => updateImage('tablet', ImagePurpose.Banner, image), []);
  const onBrandChange = useCallback((image?: ImageDetail) => updateImage('tablet', ImagePurpose.Brand, image), []);

  return (
    <div className="min-w-[768px] max-w-[1024px] p-4">
      <div className="grid-span-1 grid grid-cols-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-t-lg"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          onImageChange={onBannerChange}
          selectedImage={images.tablet.Banner}
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>tablet sized</b> banner
              </span>
            </div>
          }
        >
          <div className="ml-64 mr-4 grid h-full grid-cols-1 grid-rows-1 items-center">
            <div className="col-start-1 row-start-1 w-fit rounded-md p-2 backdrop-blur-md">
              <div className="text-shadow text-3xl font-bold">{describe.collection}</div>
              <div className="text-shadow text-xl">{describe.project}</div>
            </div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="w-32 h-40 rounded-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'m-4 col-start-1 row-start-1 '}
          className="border object-cover shadow-lg"
          onImageChange={onBrandChange}
          selectedImage={images.tablet.Brand}
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center leading-none">
                Drop a file or click to add a <b>tablet sized</b> brand or avatar image
              </span>
            </div>
          }
        />
      </div>
      <div className="text-foreground/20 -mt-2 flex h-40 w-full items-center justify-center rounded-b-md border-b border-l border-r text-center text-3xl italic">
        Your NFT Collection would appear here
      </div>
    </div>
  );
}

function MobileImageZone() {
  const { images, updateImage, describe } = useCreateCollectionContext();

  const onBannerChange = useCallback((image?: ImageDetail) => updateImage('mobile', ImagePurpose.Banner, image), []);
  const onBrandChange = useCallback((image?: ImageDetail) => updateImage('mobile', ImagePurpose.Brand, image), []);

  return (
    <div className="flex w-full min-w-[360px] max-w-[420px] flex-col items-center p-4">
      <div className="grid h-64 w-full grid-cols-1 grid-rows-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-t-md"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          onImageChange={onBannerChange}
          selectedImage={images.mobile.Banner}
          dropMessage={
            <div className="mt-8 flex w-full justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>mobile</b> banner
              </span>
            </div>
          }
        >
          <div className="m-2 w-fit p-2 backdrop-blur-md">
            <div className="text-shadow text-3xl font-bold">{describe.collection}</div>
            <div className="text-shadow text-xl">{describe.project}</div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="size-40 rounded-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'justify-self-center self-end col-start-1 row-start-1'}
          className="object-cover shadow-lg"
          onImageChange={onBrandChange}
          selectedImage={images.mobile.Brand}
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>mobile</b> brand image
              </span>
            </div>
          }
        />
      </div>
      <div className="text-foreground/20 -mt-16 flex h-60 w-full items-center justify-center rounded-b-md border-b border-l border-r text-center text-2xl">
        Your NFT Collection would appear here
      </div>
    </div>
  );
}

function ThumbnailImageZone() {
  const { images, updateImage, describe } = useCreateCollectionContext();

  const onThumbnailChange = useCallback(
    (image?: ImageDetail) => updateImage('desktop', ImagePurpose.Thumbnail, image),
    []
  );

  return (
    <Card className="h-96">
      <ImageDropzone
        shapeClassName="size-60 rounded-t-lg "
        showClearButton={true}
        clearClassName="justify-center"
        className="object-cover"
        onImageChange={onThumbnailChange}
        selectedImage={images.desktop.Thumbnail}
        dropMessage={
          <div className="flex w-full items-center justify-center">
            <span className="basis-2/3 text-center">
              Drop a file or click to add a default collection preview image
            </span>
          </div>
        }
      />
      <CardContent className="flex h-36 flex-col p-3">
        <div className="font-heading text-lg font-bold">{describe.collection}</div>
        <div className="font-thin italic">{describe.project}</div>
        <div className="flex-1 content-end self-end">{describe.artist}</div>
      </CardContent>
    </Card>
  );
}
