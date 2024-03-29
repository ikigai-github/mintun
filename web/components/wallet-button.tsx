'use client';

/* eslint-disable @next/next/no-img-element */
import { useCallback } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

import { getWalletDisplayName, getWalletIcon, useWallet, WalletApiError } from '@/lib/wallet';
import { Button } from '@/components/ui/button';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function WalletButton() {
  const { connect, disconnect, isInitializing, isConnected, isConnecting, selectedWallet, installedExtensions } =
    useWallet();

  const handleClick = useCallback(
    async (extension: string) => {
      try {
        // TODO: Wrap this in a timeout after 10 seconds pop a toast telling them to try and open the extension they are connecting from the browser extension list.  After 20 seconds give up and cancel the connect.
        await connect(extension);
      } catch (e) {
        if (e instanceof WalletApiError) {
          if (e.code === 'Refused') {
            toast.info('Wallet connection canceled per your request');
          } else {
            toast.error(e.message);
          }
        } else if (e instanceof Error) {
          toast.error(e.message);
        }
      }
    },
    [connect]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" disabled={isConnecting || isInitializing}>
          {isConnecting || isInitializing ? (
            <ReloadIcon className="size-6 animate-spin" />
          ) : isConnected ? (
            <img src={getWalletIcon(selectedWallet)} className="h-6" alt={`${selectedWallet} Icon`} />
          ) : (
            'Connect Wallet'
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {installedExtensions.map((extension, key) => (
          <DropdownMenuItem key={key} disabled={extension === selectedWallet} onClick={() => handleClick(extension)}>
            <div className="flex w-full items-center gap-4 font-bold">
              <img src={getWalletIcon(extension)} alt="Wallet Icon" className="h-5" />

              {getWalletDisplayName(extension)}
            </div>
          </DropdownMenuItem>
        ))}
        {isConnected ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="font-heading flex items-center justify-center font-bold" onClick={disconnect}>
              Disconnect
            </DropdownMenuItem>
          </>
        ) : undefined}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
