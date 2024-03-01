import { type Lucid } from 'lucid-cardano';

import { WalletContextSetters } from './context';
import { waitforWalletExtension } from './util';
import { getBalanceAda, getStakeAddress, getWalletApi } from './wallet';

export async function initWallet(lastSelectedWallet: string, setters: WalletContextSetters) {
  // Wait for the wallet extension to be injected on the page if the user has previously selected a wallet.
  if (lastSelectedWallet) {
    setters.setSelectedWallet(lastSelectedWallet);
    setters.setConnecting(true);
    try {
      await waitforWalletExtension(lastSelectedWallet);
    } catch (error) {
      // Never got injected maybe it was uninstalled. Clear it so we don't bother trying next time
      setters.setConnecting(false);
      setters.setSelectedWallet('');
      setters.setLastSelectedWallet('');
      lastSelectedWallet = '';
    }
  }

  // TODO: Figure out if this is the best way to do this
  const { Lucid } = await import('lucid-cardano');

  const lucid = await Lucid.new(undefined, undefined);

  if (lastSelectedWallet) {
    await connect(lucid, lastSelectedWallet, setters, true);
  }

  setters.setLucid(lucid);
  setters.setInitialized(true);
}

export function disconnect(setters: WalletContextSetters) {
  setters.setLucid(null);
  setters.setApi(null);
  setters.setEnabled(false);
  setters.setConnecting(false);
  setters.setConnected(false);
  setters.setSelectedWallet('');
  setters.setLastSelectedWallet('');
  setters.setStakeAddress('');
  setters.setAccountBalance(0);
}

export async function connect(lucid: Lucid, wallet: string, setters: WalletContextSetters, suppressErrors = false) {
  setters.setConnecting(true);
  setters.setSelectedWallet(wallet);

  // TODO: Some wallets (ie nami) support adding listeners (ie: api.expiremental.on('accountchange', ...))
  // for network and account changes. Add support for that.
  try {
    const api = await getWalletApi(wallet);
    const networkId = await api.getNetworkId();
    await updateProvider(lucid, networkId, setters);

    setters.setApi(api);
    setters.setNetwork(networkId === 1 ? 'Mainnet' : 'Preprod');
    setters.setEnabled(true);
    setters.setConnected(true);
    setters.setLastSelectedWallet(wallet);
    setters.setStakeAddress(await getStakeAddress(api));
    setters.setAccountBalance(await getBalanceAda(api));
    setters.setConnecting(false);
  } catch (error) {
    setters.setLastSelectedWallet('');
    setters.setSelectedWallet('');
    setters.setConnecting(false);
    if (!suppressErrors) {
      throw error;
    }
  }
}

// Might make these completely different subdomains for ensuring not using the wrong wallet but
// for now just will make clear which network the selected wallet is on in UI
export async function updateProvider(lucid: Lucid, networkId: number, setters: WalletContextSetters) {
  const { Blockfrost } = await import('lucid-cardano');
  if (networkId === 1) {
    if (lucid.network !== 'Mainnet') {
      const blockfrost = new Blockfrost(
        'https://cardano-mainnet.blockfrost.io',
        process.env.NEXT_PUBLIC_BLOCKFROST_KEY_MAINNET
      );
      await lucid.switchProvider(blockfrost, 'Mainnet');
      setters.setNetwork('Mainnet');
    }
  } else {
    if (lucid.network !== 'Preprod') {
      const blockfrost = new Blockfrost(
        'https://cardano-preprod.blockfrost.io',
        process.env.NEXT_PUBLIC_BLOCKFROST_KEY_PREPROD
      );
      await lucid.switchProvider(blockfrost, 'Preprod');
      setters.setNetwork('Preprod');
    }
  }
}
