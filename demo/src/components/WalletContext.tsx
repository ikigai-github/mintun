import { makePersisted } from '@solid-primitives/storage';
import { createContextProvider } from '@solid-primitives/context';
import { Blockfrost, Lucid } from 'lucid-cardano';
import { createResource, createSignal, Resource, useContext } from 'solid-js';

type WalletInfo = {
  name: string;
  website: string;
  display: string;
  icon: string;
};

type WalletState = {
  lucid?: Lucid;
  info: WalletInfo;
};

type WalletInfoName = keyof typeof SupportedWallets | '';

const defaultWalletState: WalletState = {
  lucid: undefined,
  info: {
    name: '',
    website: '',
    display: 'Select Wallet',
    icon: '',
  },
};

const [Provider, useProvider] = createContextProvider(
  () => {
    const [lucid] = createResource(connectLucid);
    const [wallet, setWallet] = makePersisted(createSignal('' as WalletInfoName));

    const [state] = createResource(() => [lucid(), wallet()], async ([lucidValue, walletValue]) => {
      console.log('Updating wallet state');
      if (walletValue && lucidValue && typeof walletValue === 'string' && lucidValue instanceof Lucid) {
        const api = await window?.cardano?.[walletValue]?.enable();
        if (api) {
          lucidValue.selectWallet(api);

          const state: WalletState = {
            lucid: lucidValue,
            info: SupportedWallets[walletValue],
          };

          return state;
        }
      }
      return defaultWalletState;
    });

    return {
      state,
      setWallet,
    };
  },
);

export const WalletProvider = Provider;

export function useWallet() {
  const wallet = useProvider();
  if (wallet === undefined) {
    throw new Error('Cannout use provider outside of provider wrapper');
  }

  return wallet;
}

export const SupportedWallets = {
  eternl: {
    name: 'eternl',
    display: 'Eternl',
    website: 'https://eternl.io',
    icon: '/images/eternl.png',
  },
  flint: {
    name: 'flint',
    display: 'Flint',
    website: 'https://flint-wallet.com',
    icon: '/images/flint.svg',
  },
  nami: {
    name: 'nami',
    display: 'Nami',
    website: 'https://namiwallet.io',
    icon: '/images/nami.svg',
  },
} as const;

// Setup lucid
async function connectLucid() {
  return await Lucid.new(
    new Blockfrost(
      'https://cardano-preprod.blockfrost.io/api/v0',
      import.meta.env.VITE_BLOCKFROST_KEY,
    ),
  );
}
