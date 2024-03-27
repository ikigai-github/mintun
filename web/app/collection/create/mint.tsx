'use client';

import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useMediaQuery } from 'usehooks-ts';

import { isWalletInternalApiError, useWallet } from '@/lib/wallet';
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
import useGenesisMint from './use-genesis-mint';

type MintStatus = 'ready' | 'preparing' | 'signing' | 'verifying' | 'complete';
const mintButtonLabel = 'Ready To Mint';
const mintDescription = `You can review your mint details and cost breakdown below.`;

export type MintProps = {
  allowOpen: () => Promise<boolean>;
};

export default function Mint({ allowOpen }: MintProps) {
  return (
    <Card className="grid grid-cols-[1fr_auto] items-center gap-4 p-4">
      <CardTitle>Create a collection</CardTitle>
      <div className="row-span-2 flex items-end justify-end pr-4">
        <MintDialogButton allowOpen={allowOpen} />
      </div>

      <CardDescription>
        Fill out as much or as little as you like about your colleciton in the tabs below. When you feel you have enough
        information filled out press ready to mint.
      </CardDescription>
    </Card>
  );
}

function MintDialogButton({ allowOpen }: MintProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MintStatus>('ready');
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

  const mintTitle = useMemo(() => {
    if (status === 'ready') {
      return 'Ready To Mint';
    } else if (status === 'preparing') {
      return 'Preparing Mint Tx';
    } else if (status === 'signing') {
      return 'Awaiting Signature';
    } else if (status === 'verifying') {
      return 'Verifying transaction success';
    } else if (status === 'complete') {
      return 'Mint Complete';
    }
  }, [status]);

  const closeDisabled = useMemo(() => status !== 'ready' && status !== 'complete', [status]);

  const handleClose = useCallback(
    (e: Event) => {
      if (closeDisabled) {
        e.preventDefault();
      }
    },
    [closeDisabled]
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogTrigger asChild>
          <Button>{mintButtonLabel}</Button>
        </DialogTrigger>
        <DialogContent
          data-state="disabled"
          className="sm:max-w-[425px]"
          onInteractOutside={handleClose}
          onEscapeKeyDown={handleClose}
          hideCloseIcon={status !== 'ready' && status !== 'complete'}
        >
          <DialogHeader>
            <DialogTitle>{mintTitle}</DialogTitle>
            <DialogDescription className="font-heading text-muted-foreground text-sm">
              {mintDescription}
            </DialogDescription>
          </DialogHeader>
          <ReviewAccordion />
          <MintButton setStatus={setStatus} status={status} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>{mintButtonLabel}</Button>
      </DrawerTrigger>
      <DrawerContent onInteractOutside={handleClose} onEscapeKeyDown={handleClose}>
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
          <MintButton setStatus={setStatus} status={status} />
          <DrawerClose asChild disabled={closeDisabled}>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type MintStateProps = {
  status: MintStatus;
  setStatus: Dispatch<SetStateAction<MintStatus>>;
};

function MintButton({ status, setStatus }: MintStateProps) {
  const { prepareTx } = useGenesisMint();
  const { lucid } = useWallet();

  const handleMint = useCallback(async () => {
    try {
      setStatus('preparing');

      const tx = await prepareTx();
      const completed = await tx.complete();

      setStatus('signing');

      const signed = await completed.sign().complete();
      const txHash = await signed.submit();

      setStatus('verifying');

      if (lucid) await lucid.awaitTx(txHash);

      setStatus('complete');
    } catch (e: unknown) {
      if (isWalletInternalApiError(e)) {
        toast.error(e.info);
      } else if (e instanceof Error) {
        toast.error(e.message);
      } else if (typeof e === 'string') {
        toast.error(e);
      } else {
        toast.error('An unknown error occurred while creating the mint transaction');
      }

      console.log(e);

      setStatus('ready');
    }
  }, [prepareTx]);

  return (
    <Button onClick={handleMint} disabled={status !== 'ready'}>
      Mint
    </Button>
  );
}
