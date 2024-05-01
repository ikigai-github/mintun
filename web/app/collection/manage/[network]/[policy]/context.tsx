'use client';

import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { CollectionInfo, CollectionState, MintunNft, ScriptCache } from '@ikigai-github/mintun-offchain';
import type { UTxO } from 'lucid-cardano';
import { useLocalStorage } from 'usehooks-ts';

import { getErrorMessage, useWallet } from '@/lib/wallet';

import { DraftTokenData } from './types';

export type ManageCollectionContextProps = {
  policy: string;
} & PropsWithChildren;

export type ManageCollectionContextType = {
  isInitializing: boolean;
  isInitialized: boolean;
  error: string;
  policy: string;
  setPolicy: Dispatch<SetStateAction<string>>;
  cache?: ScriptCache;
  setCache: Dispatch<SetStateAction<ScriptCache | undefined>>;
  info?: CollectionInfo;
  setInfo: Dispatch<SetStateAction<CollectionInfo | undefined>>;
  state?: CollectionState;
  setState: Dispatch<SetStateAction<CollectionState | undefined>>;
  minted: MintunNft[];
  setMinted: Dispatch<SetStateAction<MintunNft[]>>;
  drafts: DraftTokenData[];
  setDrafts: Dispatch<SetStateAction<DraftTokenData[]>>;
  minting: MintunNft[];
  setMinting: Dispatch<SetStateAction<MintunNft[]>>;
  mintReferenceUtxo?: UTxO;
  setMintReferenceUtxo: Dispatch<SetStateAction<UTxO | undefined>>;
};

const ManageCollectionContext = createContext<ManageCollectionContextType>({
  isInitializing: true,
  isInitialized: false,
  error: '',
  policy: '',
  setPolicy: () => undefined,
  cache: undefined,
  setCache: () => undefined,
  info: undefined,
  setInfo: () => undefined,
  state: undefined,
  setState: () => undefined,
  minted: [],
  setMinted: () => [],
  drafts: [],
  setDrafts: () => [],
  minting: [],
  setMinting: () => [],
  mintReferenceUtxo: undefined,
  setMintReferenceUtxo: () => undefined,
});

export function ManageCollectionContextProvider(props: ManageCollectionContextProps) {
  const [isInitializing, setInitializing] = useState(true);
  const [isInitialized, setInitialized] = useState(false);
  const [cache, setCache] = useState<ScriptCache>();
  const [error, setError] = useState('');
  const [policy, setPolicy] = useState(props.policy);
  const [info, setInfo] = useState<CollectionInfo | undefined>();
  const [state, setState] = useState<CollectionState | undefined>();
  const [nfts, setNfts] = useState<MintunNft[]>([]);
  const [drafts, setDrafts] = useLocalStorage<DraftTokenData[]>(`mintun:drafts:v1:${policy}`, []);
  const [minting, setMinting] = useState<MintunNft[]>([]);
  const [mintReferenceUtxo, setMintReferenceUtxo] = useState<UTxO | undefined>();

  const { lucid } = useWallet();

  const init = useCallback(async () => {
    if (lucid) {
      setInitialized(false);
      setInitializing(true);
      try {
        const offchain = await import('@ikigai-github/mintun-offchain');
        const { cache, state } = await offchain.ScriptCache.fromMintPolicyId(lucid, policy);
        const mintReferenceUtxo = await offchain.fetchMintingPolicyReferenceUtxo(cache);
        const info = await offchain.fetchCollectionInfo(cache);
        setInfo(info);
        setState(state);
        setCache(cache);
        setMintReferenceUtxo(mintReferenceUtxo);
        setInitialized(true);
      } catch (error: unknown) {
        console.log(error);
        // Not sure error message is even needed if init fails the whole page is bad
        // may just say that and offer a link to get back home
        setError(getErrorMessage(error));
      } finally {
        setInitializing(false);
      }
    }
  }, [lucid, policy, setState, setCache, setInitialized, setInitializing, setMintReferenceUtxo]);

  const syncCollectionNfts = useCallback(async () => {
    if (lucid && state && cache) {
      try {
        const offchain = await import('@ikigai-github/mintun-offchain');
        const address = state.info.nftValidatorAddress;
        if (address) {
          const utxos = await offchain.fetchNftReferenceUtxos(lucid, cache.mint().policyId, address);
          const minted = await Promise.all(utxos.map((utxo) => offchain.toNftData(lucid, utxo)));

          setNfts(minted);
        } else {
          // Technically can search by policy as a fallback but it is alot of calls so will just throw for now
          // This can only happen if someone chose not to use a validator for the reference tokens so not an option withing web app anyway.
          throw new Error('Cannot fetch NFTs for collection because the token storage address is unknown');
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      }
    }
  }, [lucid, state, cache, setNfts]);

  useEffect(() => {
    if (!isInitialized) init();
  }, [init, isInitialized]);

  // Called on startup but should also be called after minting completes
  // TODO: Good candidate for caching in some way to prevent a ton of redundant api calls and speed up page load
  useEffect(() => {
    if (isInitialized) syncCollectionNfts();
  }, [isInitialized, syncCollectionNfts]);

  return (
    <ManageCollectionContext.Provider
      value={{
        isInitialized,
        isInitializing,
        error,
        policy,
        setPolicy,
        cache,
        setCache,
        info,
        setInfo,
        state,
        setState,
        minted: nfts,
        setMinted: setNfts,
        drafts,
        setDrafts,
        minting,
        setMinting,
        mintReferenceUtxo,
        setMintReferenceUtxo,
      }}
    >
      {props.children}
    </ManageCollectionContext.Provider>
  );
}

export function useManageCollectionContext() {
  const context = useContext(ManageCollectionContext);

  if (!context) {
    throw new Error('useManageCollectionContext must be used within a CreateCollectionContextProvider');
  }

  return context;
}
