'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { ConfigureContractData, DataContract, DescribeCollectionData, RoyaltiesData, UploadImageData } from './schema';

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
  description: DescribeCollectionData;
  setDescription: (data: DescribeCollectionData) => void;
  traits: string[];
  setTraits: (data: string[]) => void;
  configuration: ConfigureContractData;
  setConfiguration: (data: ConfigureContractData) => void;
  images: UploadImageData;
  setImages: (images: UploadImageData) => void;
  royalties: RoyaltiesData;
  setRoyalties: (royalties: RoyaltiesData) => void;
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
  royalties: defaultRoyalties,
  setRoyalties: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [tab, setTab] = useState('describe');
  const [description, setDescription] = useState<DescribeCollectionData>({ collection: '', nsfw: false });
  const [traits, setTraits] = useState<string[]>([]);
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
        traits,
        setTraits,
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
