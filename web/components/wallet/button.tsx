'use client';

import { Button } from '@/components/ui/button';

import { useWallet } from './provider';

export function WalletButton() {
  const { lucid } = useWallet();

  return <Button variant="ghost">Connect Wallet</Button>;
}
