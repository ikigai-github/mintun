'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { WebImageData } from '@/lib/image';

import { ConfigureContractData, DataContract, DescribeCollectionData, RoyaltiesData, UploadImageData } from './schema';

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

const defaultRoyalties = {
  royalties: [],
};

export type CreateCollectionContextProps = {
  tab: string;
  setTab: (tab: string) => void;
  description: DescribeCollectionData;
  setDescription: (data: DescribeCollectionData) => void;
  configuration: ConfigureContractData;
  setConfiguration: (data: ConfigureContractData) => void;
  images: UploadImageData;
  setImages: (images: UploadImageData) => void;
  royalties: RoyaltiesData;
  setRoyalties: (royalties: RoyaltiesData) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  tab: 'desribe',
  setTab: () => null,
  description: {
    collection: '',
    nsfw: false,
  },
  setDescription: () => null,
  configuration: {
    contract: DataContract.Immutable,
  },
  setConfiguration: () => null,
  images: defaultImages,
  setImages: () => null,
  royalties: defaultRoyalties,
  setRoyalties: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [tab, setTab] = useState('describe');
  const [description, setDescription] = useState<DescribeCollectionData>({ collection: '', nsfw: false });
  const [configuration, setConfiguration] = useState<ConfigureContractData>({
    contract: DataContract.Immutable,
  });

  const [images, setImages] = useState<UploadImageData>(defaultImages);

  const [royalties, setRoyalties] = useState<RoyaltiesData>(defaultRoyalties);

  return (
    <CreateCollectionContext.Provider
      value={{
        tab,
        setTab,
        description,
        setDescription,
        configuration,
        setConfiguration,
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
