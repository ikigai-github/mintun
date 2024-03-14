'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { WebImageData } from '@/lib/image';

import { ConfigureContractData, DataContract, DescribeCollectionData, UploadImageData } from './schema';

const defaultImages = {
  desktop: {
    avatar: '',
    banner: '',
    thumbnail: '',
  },
  tablet: {
    avatar: '',
    banner: '',
    thumbnail: '',
  },
  mobile: {
    avatar: '',
    banner: '',
    thumbnail: '',
  },
};

export type CreateCollectionContextProps = {
  tab: string;
  setTab: (tab: string) => void;
  description: DescribeCollectionData;
  setDescription: (data: DescribeCollectionData) => void;
  traits: string[];
  setTraits: (data: string[]) => void;
  configuration: ConfigureContractData;
  setConfiguration: (data: ConfigureContractData) => void;
  images: UploadImageData;
  setImages: (images: UploadImageData) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  tab: 'describe',
  setTab: () => null,
  description: {
    collection: '',
    nsfw: false,
  },
  setDescription: () => null,
  traits: [],
  setTraits: () => null,
  configuration: {
    contract: DataContract.Immutable,
  },
  setConfiguration: () => null,
  images: defaultImages,
  setImages: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [tab, setTab] = useState('describe');
  const [description, setDescription] = useState<DescribeCollectionData>({ collection: '', nsfw: false });
  const [traits, setTraits] = useState<string[]>([]);
  const [configuration, setConfiguration] = useState<ConfigureContractData>({
    contract: DataContract.Immutable,
  });

  const [images, setImages] = useState<UploadImageData>(defaultImages);

  return (
    <CreateCollectionContext.Provider
      value={{
        tab,
        setTab,
        description,
        setDescription,
        traits,
        setTraits,
        configuration,
        setConfiguration,
        images,
        setImages,
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
