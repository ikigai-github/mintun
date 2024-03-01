'use client';

import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import type { Lucid, Network, WalletApi } from 'lucid-cardano';
import { useLocalStorage } from 'usehooks-ts';

import {
  connect as connectInternal,
  disconnect as disconnectInternal,
  initWallet,
  KnownWalletName,
  WalletContext,
  WalletContextSetters,
  WalletContextType,
} from '@/lib/wallet';

export function WalletProvider({ children }: PropsWithChildren) {
  const [lucid, setLucid] = useState<Lucid | null>(null);
  const [api, setApi] = useState<WalletApi | null>(null);
  const [isInitializing, setInitializing] = useState(true);
  const [isInitialized, setInitialized] = useState(false);
  const [isEnabled, setEnabled] = useState(false);
  const [isConnecting, setConnecting] = useState(false);
  const [isConnected, setConnected] = useState(false);
  const [network, setNetwork] = useState<Network>('Mainnet');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [lastSelectedWallet, setLastSelectedWallet] = useLocalStorage('mintun:selected:wallet', '');
  const [stakeAddress, setStakeAddress] = useState('');
  const [installedExtensions, setInstalledExtensions] = useState<Array<string>>([]);
  const [accountBalance, setAccountBalance] = useState<number>(0);

  const setters: WalletContextSetters = useMemo(
    () => ({
      setLucid,
      setApi,
      setInitializing,
      setInitialized,
      setEnabled,
      setConnecting,
      setConnected,
      setNetwork,
      setSelectedWallet,
      setLastSelectedWallet,
      setStakeAddress,
      setInstalledExtensions,
      setAccountBalance,
    }),
    [
      setLucid,
      setApi,
      setInitializing,
      setInitialized,
      setEnabled,
      setConnecting,
      setConnected,
      setNetwork,
      setSelectedWallet,
      setLastSelectedWallet,
      setStakeAddress,
      setInstalledExtensions,
      setAccountBalance,
    ]
  );

  const connect = useCallback(
    async (wallet: KnownWalletName) => {
      if (lucid) {
        await connectInternal(lucid, wallet, setters);
      }
    },
    [lucid, setters]
  );

  const disconnect = useCallback(() => disconnectInternal(setters), [setters]);

  const context: WalletContextType = useMemo(
    () => ({
      lucid,
      api,
      isInitializing,
      isInitialized,
      isEnabled,
      isConnecting,
      isConnected,
      network,
      selectedWallet,
      lastSelectedWallet,
      stakeAddress,
      installedExtensions,
      accountBalance,
      connect,
      disconnect,
    }),
    [
      lucid,
      api,
      isInitializing,
      isInitialized,
      isEnabled,
      isConnecting,
      isConnected,
      network,
      selectedWallet,
      lastSelectedWallet,
      stakeAddress,
      installedExtensions,
      accountBalance,
      connect,
      disconnect,
    ]
  );

  useEffect(() => {
    initWallet(lastSelectedWallet, setters)
      .then(() => setInitializing(false))
      .catch(() => setInitializing(false));
  }, [setters, lastSelectedWallet]);

  return <WalletContext.Provider value={context}>{children}</WalletContext.Provider>;
}
