'use client';

import { useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { ReviewAccordion } from './review';

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
          </DialogHeader>
          <ReviewAccordion />
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
        </DrawerHeader>
        <ReviewAccordion />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
