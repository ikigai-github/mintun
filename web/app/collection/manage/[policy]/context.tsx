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
import {
  fetchCollectionInfo,
  fetchMintingPolicyReferenceUtxo,
  fetchNftReferenceUtxos,
  ScriptCache,
  toNftData,
  type CollectionInfo,
  type CollectionState,
  type MintunNft,
} from '@ikigai-github/mintun-offchain';
import type { UTxO } from 'lucid-cardano';
import { useLocalStorage } from 'usehooks-ts';

import { getErrorMessage, useWallet } from '@/lib/wallet';

import { DraftTokenData } from './types';

export type ManageCollectionContextProps = {
  policy: string;
} & PropsWithChildren;

export type ManageCollectionContextType = {
  policy: string;
  setPolicy: Dispatch<SetStateAction<string>>;
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
};

const ManageCollectionContext = createContext<ManageCollectionContextType>({
  policy: '',
  setPolicy: () => undefined,
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
});

export function ManageCollectionContextProvider(props: ManageCollectionContextProps) {
  const [isInitializing, setInitializing] = useState(false);
  const [isInitialized, setInitialized] = useState(false);
  const [cache, setCache] = useState<ScriptCache>();
  const [error, setError] = useState('');
  const [policy, setPolicy] = useState(props.policy);
  const [info, setInfo] = useState<CollectionInfo | undefined>();
  const [state, setState] = useState<CollectionState | undefined>();
  const [minted, setMinted] = useState<MintunNft[]>([]);
  const [drafts, setDrafts] = useLocalStorage<DraftTokenData[]>(`mintun:drafts:v1:${policy}`, []);
  const [minting, setMinting] = useState<MintunNft[]>([]);
  const [mintReferenceUtxo, setMintReferenceUtxo] = useState<UTxO>();

  const { lucid } = useWallet();

  const init = useCallback(async () => {
    if (lucid) {
      setInitialized(false);
      setInitializing(true);
      try {
        const offchain = await import('@ikigai-github/mintun-offchain');
        const { cache, state } = await offchain.ScriptCache.fromMintPolicyId(lucid, policy);
        const mintReferenceUtxo = await fetchMintingPolicyReferenceUtxo(cache);
        const info = await fetchCollectionInfo(cache);

        setInfo(info);
        setState(state);
        setCache(cache);
        setMintReferenceUtxo(mintReferenceUtxo);
        setInitialized(true);
      } catch (error: unknown) {
        // Not sure error message is even needed if init fails the whole page is bad
        // may just say that and offer a link to get back home
        setError(getErrorMessage(error));
      } finally {
        setInitializing(false);
      }
    }
  }, [lucid, policy, setState, setCache, setInitialized, setInitializing, setMintReferenceUtxo]);

  const loadMinted = useCallback(async () => {
    if (lucid && state && cache) {
      try {
        const address = state.info.nftValidatorAddress;
        if (address) {
          const utxos = await fetchNftReferenceUtxos(lucid, cache.mint().policyId, address);
          // TODO: Check if this is causing a lot of calls I think the datum should already be included so it shouldn't
          const minted = await Promise.all(utxos.map((utxo) => toNftData(lucid, utxo)));
          setMinted(minted);
        } else {
          // Technically can search by policy as a fallback but it is alot of calls so will just throw for now
          // This can only happen if someone chose not to use a validator for the reference tokens so not an option anyway.
          throw new Error('Cannot fetch NFTs for collection because the token storage address is unknown');
        }
      } catch (error: unknown) {
        setError(getErrorMessage(error));
      }
    }
  }, [lucid, state, cache, setMinted]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isInitialized) {
      loadMinted();
    }
  }, [isInitialized, loadMinted]);

  return (
    <ManageCollectionContext.Provider
      value={{
        policy,
        setPolicy,
        info,
        setInfo,
        state,
        setState,
        minted,
        setMinted,
        drafts,
        setDrafts,
        minting,
        setMinting,
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
