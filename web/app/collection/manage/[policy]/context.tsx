'use client';

import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext, useState } from 'react';
import type { CollectionInfo, CollectionState, MintunNft } from '@ikigai-github/mintun-offchain';

export type CollectionNft = {
  title: string;
  image: string;
};

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
  drafts: MintunNft[];
  setDrafts: Dispatch<SetStateAction<MintunNft[]>>;
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
  const [policy, setPolicy] = useState(props.policy);
  const [info, setInfo] = useState<CollectionInfo | undefined>();
  const [state, setState] = useState<CollectionState | undefined>();
  const [minted, setMinted] = useState<MintunNft[]>([]);
  const [drafts, setDrafts] = useState<MintunNft[]>([]);
  const [minting, setMinting] = useState<MintunNft[]>([]);

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
