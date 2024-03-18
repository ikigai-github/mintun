'use client';

import { useCallback, useState } from 'react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useMediaQuery } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

import { ReviewAccordion } from './review';

export type MintProps = {
  allowOpen: () => Promise<boolean>;
};

export default function Mint({ allowOpen }: MintProps) {
  return (
    <Card className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
      <CardTitle>Create a collection</CardTitle>
      <div className="row-span-2 flex items-end justify-end pr-4">
        <MintButton allowOpen={allowOpen} />
      </div>

      <CardDescription>
        Fill out as much or as little as you like about your colleciton in the tabs below. When you feel you have enough
        information filled out press ready to mint.
      </CardDescription>
    </Card>
  );
}

const mintTitle = 'Ready To Mint';
const mintButtonLabel = 'Ready To Mint';
const mintDescription = `You can review your mint details and cost breakdown below.`;

export function MintButton({ allowOpen }: MintProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)', {
    defaultValue: true,
    initializeWithValue: false,
  });

  const handleOpen = useCallback(
    async (open: boolean) => {
      if (!open) {
        setOpen(open);
      } else if (await allowOpen()) {
        setOpen(open);
      }
    },
    [setOpen, allowOpen]
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <Button>{mintButtonLabel}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{mintTitle}</DialogTitle>
            <DialogDescription className="font-heading text-muted-foreground text-sm">
              {mintDescription}
            </DialogDescription>
          </DialogHeader>
          <ReviewAccordion />
          <Button>Mint</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{mintButtonLabel}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{mintTitle}</DrawerTitle>
          <DrawerDescription className="font-heading text-muted-foreground text-sm">
            {mintDescription}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <ReviewAccordion />
        </div>

        <DrawerFooter className="pt-2">
          <Button>Mint</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
