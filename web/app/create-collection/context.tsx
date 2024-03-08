'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';

import { WebImageData } from '@/lib/image';

import { ConfigureContractData, DataContract } from './configure/schema';
import { DescribeCollectionData } from './describe/schema';

export type CreateCollectionContextProps = {
  description: DescribeCollectionData;
  setDescription: (data: DescribeCollectionData) => void;

  configuration: ConfigureContractData;
  setConfiguration: (data: ConfigureContractData) => void;

  images: WebImageData[];
  setImages: (images: WebImageData[]) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  description: {
    collection: '',
    nsfw: false,
  },
  setDescription: () => null,
  configuration: {
    contract: DataContract.Immutable,
  },
  setConfiguration: () => null,
  images: [],
  setImages: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [description, setDescription] = useState<DescribeCollectionData>({ collection: '', nsfw: false });
  const [configuration, setConfiguration] = useState<ConfigureContractData>({
    contract: DataContract.Immutable,
  });

  const [images, setImages] = useState<WebImageData[]>([]);

  return (
    <CreateCollectionContext.Provider
      value={{ description, setDescription, configuration, setConfiguration, images, setImages }}
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
