'use client';

import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useState } from 'react';
import type { Lucid, Network, WalletApi } from 'lucid-cardano';
import { useLocalStorage } from 'usehooks-ts';

import { initWallet } from '@/components/wallet/connect';

export type WalletContext = {
  lucid: Lucid | null;
  api: WalletApi | null;
  isInitializing: boolean;
  isInitialized: boolean;
  isEnabled: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  network: Network;
  selectedWallet: string;
  lastSelectedWallet: string;
  stakeAddress: string | null;
  installedExtensions: string[];
  accountBalance: number;
};

export type WalletContextSetters = {
  setLucid: Dispatch<SetStateAction<Lucid | null>>;
  setApi: Dispatch<SetStateAction<WalletApi | null>>;
  setInitializing: Dispatch<SetStateAction<boolean>>;
  setInitialized: Dispatch<SetStateAction<boolean>>;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  setConnecting: Dispatch<SetStateAction<boolean>>;
  setConnected: Dispatch<SetStateAction<boolean>>;
  setNetwork: Dispatch<SetStateAction<Network>>;
  setSelectedWallet: Dispatch<SetStateAction<string>>;
  setLastSelectedWallet: Dispatch<SetStateAction<string>>;
  setStakeAddress: Dispatch<SetStateAction<string>>;
  setInstalledExtensions: Dispatch<SetStateAction<string[]>>;
  setAccountBalance: Dispatch<SetStateAction<number>>;
};

const Context = createContext<WalletContext>({
  lucid: null,
  api: null,
  isInitializing: false,
  isInitialized: false,
  isEnabled: false,
  isConnecting: false,
  isConnected: false,
  network: 'Mainnet',
  selectedWallet: '',
  lastSelectedWallet: '',
  stakeAddress: '',
  installedExtensions: [],
  accountBalance: 0,
});

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

  const setters: WalletContextSetters = {
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
  };

  const context: WalletContext = {
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
  };

  useEffect(() => {
    initWallet(lastSelectedWallet, setters)
      .then(() => setInitializing(false))
      .catch(() => setInitializing(false));
  }, [isInitializing, setters, setInitializing]);

  return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useWallet() {
  const context = useContext<WalletContext>(Context);

  if (context === undefined) throw new Error('Context can only be used withing the CaradanoProvider component');

  return context;
}
