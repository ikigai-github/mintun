'use client';

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Router } from 'next/router';
import { DialogDescription } from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useInterval, useMediaQuery } from 'usehooks-ts';

import { timeout } from '@/lib/utils';
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
import { Progress } from '@/components/ui/progress';

import { ReviewAccordion } from './review';
import useGenesisMint from './use-genesis-mint';

type MintStatus = 'ready' | 'preparing' | 'signing' | 'verifying' | 'complete';
const mintButtonLabel = 'Ready To Mint';

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
    } else if (status === 'complete') {
      return 'Mint Complete';
    } else {
      return 'Mint in Progress';
    }
  }, [status]);

  const mintDescription = useMemo(() => {
    if (status === 'ready') {
      return 'You can review your mint details and cost breakdown below.';
    } else if (status === 'complete') {
      return 'Click manage collection below to add NFTs to the collection and more.';
    } else {
      return 'Building, signing, and submitting the collection minting transaction to the blockchain.';
    }
  }, [status]);

  const closeDisabled = useMemo(() => status !== 'ready', [status]);

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
          className="sm:max-w-[425px]"
          onInteractOutside={handleClose}
          onEscapeKeyDown={handleClose}
          hideCloseIcon={closeDisabled}
        >
          <DialogHeader>
            <DialogTitle>{mintTitle}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">{mintDescription}</DialogDescription>
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
          <DrawerDescription className="text-muted-foreground text-sm">{mintDescription}</DrawerDescription>
        </DrawerHeader>
        <div className="p-4">
          <ReviewAccordion />
        </div>

        <DrawerFooter className="pt-2">
          <MintButton setStatus={setStatus} status={status} />
          <DrawerClose asChild disabled={closeDisabled}>
            {status !== 'complete' ? <Button variant="outline">Cancel</Button> : undefined}
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
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Mint');
  const [policyId, setPolicyId] = useState('');
  const { prepareTx, uploadProgress } = useGenesisMint();

  const { lucid } = useWallet();

  const handleManage = useCallback(() => router.push(`/collection/manage/${policyId}`), [router, policyId]);

  const isUploading = useMemo(() => uploadProgress < 100 && status === 'preparing', [uploadProgress, status]);

  // Gradually increase progress during upload as the callback from upload seems to only come once
  useInterval(
    () => {
      setProgress((prev) => {
        return Math.min(prev + 1, 50);
      });
    },
    isUploading ? 1000 : null
  );

  // Fake progress towards verifying since the time it takes is unknown somewhere between 20-200 seconds
  useInterval(
    () => {
      setProgress((prev) => {
        return Math.min(prev + 1, 100);
      });
    },
    status === 'verifying' ? 3 * 1000 : null
  );

  const handleMint = useCallback(async () => {
    try {
      setStatus('preparing');
      const { tx, policyId } = await prepareTx();
      const completed = await tx.complete();

      setPolicyId(policyId);
      setStatus('signing');
      const signed = await timeout(
        completed.sign().complete(),
        60 * 1000,
        'Timed out waiting for signature. Click mint to try again.'
      );
      // TODO: Show this tx hash during verification step
      const txHash = await timeout(
        signed.submit(),
        60 * 1000,
        'Timed out trying to submit transaction. Click mint to try again.'
      );

      setStatus('verifying');
      if (lucid) {
        // After 5 minutes something must have gone wrong. Hopefully suggesting a retry at this point is okay.
        await timeout(
          lucid.awaitTx(txHash),
          5 * 60 * 1000,
          'Timed out verifying transaction. Click mint to try again.'
        );
      }

      setStatus('complete');
    } catch (e: unknown) {
      console.log(e);
      if (isWalletInternalApiError(e)) {
        toast.error(e.info);
      } else if (e instanceof Error) {
        toast.error(e.message);
      } else if (typeof e === 'string') {
        toast.error(e);
      } else {
        toast.error('An unknown error occurred while creating the mint transaction');
      }
      setStatus('ready');
    }
  }, [prepareTx, lucid, setStatus]);

  useEffect(() => {
    if (status === 'ready') {
      setProgress(0);
      setMessage('Mint');
    } else if (status === 'preparing') {
      setProgress(20);
      setMessage('Storing images in IPFS');
    } else if (status === 'signing') {
      setProgress(50);
      setMessage('Waiting for your signature');
    } else if (status === 'verifying') {
      setProgress(60);
      setMessage('Waiting for transaction to appear on chain. This can take up to 5 minutes.');
    } else if (status === 'complete') {
      setProgress(100);
      setMessage('Collection creation complete!');
    }
  }, [status, setProgress, setMessage]);

  if (status === 'ready') {
    return <Button onClick={handleMint}>Mint</Button>;
  }

  if (status === 'complete') {
    return <Button onClick={handleManage}>Manage Collection</Button>;
  }

  return (
    <div className="flex flex-col gap-2">
      <span>{message}</span>
      <Progress value={progress} />
    </div>
  );
}
