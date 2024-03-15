'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarDropzone, BannerDropzone, ThumbnailDropzone } from '@/components/image-dropzone';
import { MOCK_TOKEN_CARDS, TokenCardList } from '@/components/token-card';

import { useCreateCollectionContext } from './context';

export default function Images() {
  const { description, images, setImages } = useCreateCollectionContext();

  const collectionName = description.collection || '<Collection Name>';
  const brandName = description.project || '<Brand Name>';
  const artistName = description.artist || '<Artist Name>';

  return (
    <Card>
      <Tabs defaultValue="desktop">
        <CardHeader>
          <div className="justify-between sm:flex">
            <CardTitle className="font-heading pb-2">Add market images</CardTitle>
            <TabsList>
              <TabsTrigger value="desktop">Desktop</TabsTrigger>
              <TabsTrigger value="tablet">Tablet</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>
          </div>
          <CardDescription className="font-heading">
            When markets display your collection they often use additional images to personalize the collection page.
            This includes things like brand, banner, and thumbnail images. You can add those types of images in the area
            below and preview the banners at different potential resolutions. The desktop resolution is also the default
            image if you set a different image for mobile and tablet it will override the default at that resolution.
          </CardDescription>
        </CardHeader>

        <div className="bg-secondary m-4 overflow-x-auto rounded-[0.5rem]">
          <TabsContent value="desktop" className="flex flex-col p-4">
            <div className="mb-4 flex gap-6">
              <AvatarDropzone
                className="min-w-[180px]"
                imageClassName="min-w-[180px]"
                callback={setImages}
                imagesState={images}
                view="desktop"
              />
              <BannerDropzone
                className="min-w-[720px]"
                imageClassName="min-w-[720px]"
                callback={setImages}
                imagesState={images}
                view="desktop"
              />
            </div>
            <div className="flex gap-6">
              <div className="w-[200px]">
                <p className="mb-4 px-2 opacity-70">Below is a preview of your collection in a card view</p>
                <Card className="flex flex-col justify-center overflow-hidden rounded-md border">
                  <ThumbnailDropzone callback={setImages} imagesState={images} view="desktop" />
                  <div className="px-1">
                    <p className="pt-2 opacity-70">{brandName}</p>
                    <p className="mb-3">{collectionName}</p>
                    <p className="text-end opacity-70">{artistName}</p>
                  </div>
                </Card>
              </div>
              <TokenCardList tokenCards={MOCK_TOKEN_CARDS} />
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
                    <p className="pt-2 opacity-70">{brandName}</p>
                    <p className="mb-3">{collectionName}</p>
                    <p className="text-end opacity-70">{artistName}</p>
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
                    <p className="pt-2 opacity-70">{brandName}</p>
                    <p className="mb-3">{collectionName}</p>
                    <p className="text-end opacity-70">{artistName}</p>
                  </div>
                </div>
                <TokenCardList tokenCards={MOCK_TOKEN_CARDS} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
