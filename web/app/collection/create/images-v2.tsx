'use client';

import { useMemo, useState } from 'react';

import { ImagePurpose, ImagePurposeType } from '@/lib/image';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageDropzone from '@/components/dropzone/image-dropzone';
import type { ImageDetail } from '@/components/dropzone/schema';

type ImageViewMode = 'desktop' | 'tablet' | 'mobile';

type SupportedPurpose = Exclude<ImagePurposeType, 'Gallery' | 'General'>;

type ImageLookup = Record<ImageViewMode, Record<SupportedPurpose, ImageDetail | undefined>>;

type ViewModeImageDropzoneProps = {
  lookup: ImageLookup;
  setLookup: (lookup: ImageLookup) => void;
};

const lookupDefault = {
  desktop: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
  tablet: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
  mobile: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
};

export function ImagesV2() {
  const [lookup, setLookup] = useState<ImageLookup>(lookupDefault);

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

        <div className="overflow-x-auto p-8">
          <TabsContent value="default" className="min-w-[768px] max-w-[1920px]">
            <DesktopImageZone lookup={lookup} setLookup={setLookup} />
          </TabsContent>

          <TabsContent value="tablet" className="justify-safe flex items-center">
            <TabletImageZone />
          </TabsContent>
          <TabsContent value="mobile" className="flex items-center justify-center">
            <MobileImageZone />
          </TabsContent>
          <TabsContent value="thumbnail" className="flex items-center justify-center">
            <ThumbnailImageZone />
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}

function updateImage(mode: ImageViewMode, lookup: ImageLookup, setLookup: (lookup: ImageLookup) => void) {
  return (purpose: SupportedPurpose) => {
    return (image?: ImageDetail) => {
      const newLookup = {
        desktop: { ...lookup['desktop'] },
        tablet: { ...lookup['tablet'] },
        mobile: { ...lookup['mobile'] },
      };

      newLookup[mode][purpose] = image;

      setLookup(newLookup);
    };
  };
}

function DesktopImageZone({ lookup, setLookup }: ViewModeImageDropzoneProps) {
  const handleUpdate = useMemo(() => {
    return updateImage('desktop', lookup, setLookup);
  }, [lookup, setLookup]);

  const onBannerChange = useMemo(() => {
    return handleUpdate(ImagePurpose.Banner);
  }, [handleUpdate]);

  const onThumbnailChange = useMemo(() => {
    return handleUpdate(ImagePurpose.Thumbnail);
  }, [handleUpdate]);

  return (
    <div className="flex flex-col">
      <div className="grid-span-1 grid grid-cols-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-bl-full"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          onImageChange={onBannerChange}
          selectedImage={lookup.desktop.Banner}
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>default</b> banner
              </span>
            </div>
          }
        >
          <div className="ml-64 mr-4 flex h-full items-center">
            <div className="w-full rounded-md p-4">
              <div className="text-shadow text-3xl font-bold">Hello </div>
              <div className="text-shadow text-xl">World</div>
            </div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="size-60 rounded-b-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'col-start-1 row-start-1 '}
          className="object-cover shadow-lg"
          onImageChange={onThumbnailChange}
          selectedImage={lookup.desktop.Thumbnail}
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
  return (
    <div className="min-w-[768px] max-w-[1024px]">
      <div className="grid-span-1 grid grid-cols-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-t-lg"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          dropMessage={
            <div className="flex w-full items-center justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>tablet sized</b> banner
              </span>
            </div>
          }
        >
          <div className="ml-64 mr-4 flex h-full items-center">
            <div className="w-full rounded-md p-4">
              <div className="text-shadow text-3xl font-bold">Hello </div>
              <div className="text-shadow text-xl">World</div>
            </div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="w-32 h-40 rounded-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'m-4 col-start-1 row-start-1 '}
          className="border object-cover shadow-lg"
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
  return (
    <div className="flex w-full min-w-[360px] max-w-[420px] flex-col items-center justify-center">
      <div className="grid-span-1 grid h-64 w-full grid-cols-1">
        <ImageDropzone
          shapeClassName="w-full h-48 rounded-t-md"
          showClearButton={true}
          clearClassName="justify-end"
          containerClassName={'w-full col-start-1 row-start-1'}
          className="w-full  object-cover"
          dropMessage={
            <div className="mt-8 flex w-full justify-center">
              <span className="basis-2/3 text-center">
                Drop a file or click to add a <b>mobile</b> banner
              </span>
            </div>
          }
        >
          <div className="ml-64 mr-4 flex h-full items-center">
            <div className="w-full rounded-md p-4">
              <div className="text-shadow text-3xl font-bold">Hello </div>
              <div className="text-shadow text-xl">World</div>
            </div>
          </div>
        </ImageDropzone>
        <ImageDropzone
          shapeClassName="size-40 rounded-full"
          showClearButton={true}
          clearClassName="justify-center"
          containerClassName={'justify-self-center self-end col-start-1 row-start-1 '}
          className="object-cover shadow-lg"
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
  return (
    <Card className="h-96 w-60">
      <ImageDropzone
        shapeClassName="size-60 rounded-t-lg"
        showClearButton={true}
        clearClassName="justify-center"
        containerClassName={'col-start-1 row-start-1 '}
        className="object-cover shadow-lg"
        dropMessage={
          <div className="flex w-full items-center justify-center">
            <span className="basis-2/3 text-center">
              Drop a file or click to add a default collection preview image
            </span>
          </div>
        }
      />
    </Card>
  );
}
