'use client';

import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { AccordionDemo } from './accordion';
import { useCreateCollectionContext } from './context';
import { DescribeCollectionData, ImageDimension, ImagePurpose, UploadImageData } from './schema';

export default function Mint() {
  return (
    <Card className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
      <CardTitle>Create a collection</CardTitle>
      <div className="row-span-2 flex items-end justify-end pr-4">
        <MintButton />
      </div>

      <CardDescription>
        Fill out as much or as little in the tabs below. When you feel you have enough information filled out press
        ready to mint.
      </CardDescription>
    </Card>
  );
}

export function MintButton() {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)', {
    defaultValue: true,
    initializeWithValue: false,
  });

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Mint</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mint your collection</DialogTitle>
            <DialogDescription>
              <AccordionDemo />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Mint</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Mint your collection</DrawerTitle>
          <DrawerDescription>
            <AccordionDemo />
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function MintInformation() {
  const { description, images, configuration, traits } = useCreateCollectionContext();

  return (
    <div>
      <div className="grid grid-cols-[auto_1fr] gap-x-2 pt-2">
        <div>Collection Name:</div>
        <div className="font-heading font-bold">{description.collection}</div>
        {description.project ? (
          <>
            <div>Brand Name:</div>
            <div className="font-bold"> {description.project}</div>
          </>
        ) : undefined}
        {description.artist ? (
          <>
            <div>Artist Name:</div>
            <div> {description.artist}</div>
          </>
        ) : undefined}
        {description.nsfw ? (
          <>
            <div>Not safe for work</div>
            <div>true</div>
          </>
        ) : undefined}
        <div>Data Contract:</div>
        <div className="font-heading font-bold">
          {configuration.contract == 'IMMUTABLE' ? 'static' : 'permissive evolution'}
        </div>
      </div>
    </div>
  );
}

function countImages(images: UploadImageData) {
  let count = 0;
  if (images.desktop.avatar) count++;
  if (images.desktop.banner) count++;
  if (images.desktop.thumbnail) count++;

  if (images.tablet.avatar) count++;
  if (images.tablet.banner) count++;
  if (images.tablet.thumbnail) count++;

  if (images.mobile.avatar) count++;
  if (images.mobile.banner) count++;
  if (images.mobile.thumbnail) count++;

  return count;
}