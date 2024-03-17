'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { ContractData, DataContract, DescribeData, RoyaltiesData, UploadImageData } from './schema';

export const defaultImage = {
  src: '',
  mime: '',
  width: 0,
  height: 0,
};

const defaultImages = {
  desktop: {
    banner: defaultImage,
    avatar: defaultImage,
    thumbnail: defaultImage,
  },
  tablet: {
    banner: defaultImage,
    avatar: defaultImage,
    thumbnail: defaultImage,
  },
  mobile: {
    banner: defaultImage,
    avatar: defaultImage,
    thumbnail: defaultImage,
  },
};

const defaultRoyalties = {
  royalties: [],
};

export type CreateCollectionContextProps = {
  tab: string;
  setTab: (tab: string) => void;
  describe: DescribeData;
  setDescribe: (data: DescribeData) => void;
  traits: string[];
  setTraits: (data: string[]) => void;
  contract: ContractData;
  setContract: (data: ContractData) => void;
  images: UploadImageData;
  setImages: (images: UploadImageData) => void;
  royalties: RoyaltiesData;
  setRoyalties: (royalties: RoyaltiesData) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  tab: 'describe',
  setTab: () => null,
  describe: {
    collection: '',
    nsfw: false,
  },
  setDescribe: () => null,
  traits: [],
  setTraits: () => null,
  contract: {
    contract: DataContract.Immutable,
  },
  setContract: () => null,
  images: defaultImages,
  setImages: () => null,
  royalties: defaultRoyalties,
  setRoyalties: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [tab, setTab] = useState('describe');
  const [describe, setDescribe] = useState<DescribeData>({ collection: '', nsfw: false });
  const [traits, setTraits] = useState<string[]>([]);
  const [contract, setContract] = useState<ContractData>({
    contract: DataContract.Immutable,
  });

  const [images, setImages] = useState<UploadImageData>(defaultImages);

  const [royalties, setRoyalties] = useState<RoyaltiesData>(defaultRoyalties);

  return (
    <CreateCollectionContext.Provider
      value={{
        tab,
        setTab,
        describe,
        setDescribe,
        traits,
        setTraits,
        contract,
        setContract,
        images,
        setImages,
        royalties,
        setRoyalties,
      }}
    >
      {props.children}
    </CreateCollectionContext.Provider>
  );
}

export function useCreateCollectionContext() {
  const context = useContext(CreateCollectionContext);

  if (!context) {
    throw new Error('useCreateCollectionContext must be used within a CreateCollectionContextProvider');
  }

  return context;
}
