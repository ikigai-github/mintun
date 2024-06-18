import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useInterval } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import DrawerDialog from '@/components/drawer-dialog';
import { useManageCollectionContext } from '@/app/collection/manage/[network]/[policy]/context';

export type TransactionStatus = 'ready' | 'preparing' | 'signing' | 'verifying' | 'complete';

export type TransactionDialogProps = {
  label: string;
  submit: ReactNode;
  status: TransactionStatus;
} & React.PropsWithChildren;

export default function TransactionDialog({ label, submit, children }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('Save Minting Policy');
  const [progress, setProgress] = useState(0);
  const { status, setStatus } = useManageCollectionContext();

  const closeDisabled = useMemo(() => status !== 'ready' && status !== 'complete', [status]);

  useInterval(
    () => {
      setProgress((prev) => {
        return Math.min(prev + 1, 100);
      });
    },
    status === 'verifying' ? 3 * 1000 : null
  );

  useEffect(() => {
    if (status === 'ready') {
      setProgress(0);
      setMessage('Save Minting Policy');
    } else if (status === 'preparing') {
      setProgress(20);
      setMessage('Preparing Transaction');
    } else if (status === 'signing') {
      setProgress(50);
      setMessage('Waiting for your signature');
    } else if (status === 'verifying') {
      setProgress(60);
      setMessage('Waiting for transaction to appear on chain. This can take up to 5 minutes.');
    } else if (status === 'complete') {
      setProgress(100);
      setMessage('Transaction complete!');
    }
  }, [status, setProgress, setMessage]);

  useEffect(() => {
    if (!open && status === 'complete') {
      setStatus('ready');
    }
  }, [open]);

  return (
    <DrawerDialog open={open} onOpenChange={setOpen} closeDisabled={closeDisabled} trigger={<Button>{label}</Button>}>
      <div className="flex flex-col gap-4 p-4">
        {children}
        {status === 'ready' ? (
          submit
        ) : (
          <div className="flex flex-col gap-2">
            <span>{message}</span>
            <Progress value={progress} />
          </div>
        )}
      </div>
    </DrawerDialog>
  );
}
