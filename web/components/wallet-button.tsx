'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

import { useWallet } from '@/lib/wallet';
import { Button } from '@/components/ui/button';

export function WalletButton() {
  const { connect } = useWallet();

  const handleClick = useCallback(async () => {
    try {
      await connect('nami');
    } catch (e) {
      if (e instanceof Error) toast.error(e.message);
    }
  }, [connect]);

  return (
    <Button variant="ghost" onClick={handleClick}>
      Connect Wallet
    </Button>
  );
}
