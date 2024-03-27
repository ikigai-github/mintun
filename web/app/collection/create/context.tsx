'use client';

import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react';

import { ImageDetail, ImageLookup, ImagePurpose, ImagePurposeType, ImageViewMode, SupportedPurpose } from '@/lib/image';

import { ContractData, DataContract, DescribeData, RoyaltiesData, SocialData } from './schema';

export const defaultImage = {
  src: '',
  mime: '',
  width: 0,
  height: 0,
};

const defaultDescribe = {
  collection: '',
  artist: '',
  project: '',
  description: '',
  nsfw: false,
};

const defaultContract = {
  contract: DataContract.Immutable,
  maxTokens: undefined,
  window: undefined,
  group: '',
};

const defaultImages = {
  desktop: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
  tablet: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
  mobile: {
    [ImagePurpose.Thumbnail]: undefined,
    [ImagePurpose.Banner]: undefined,
    [ImagePurpose.Brand]: undefined,
  },
};

const defaultRoyalties = {
  royalties: [],
};

const defaultSocial = {
  website: '',
  twitter: '',
  discord: '',
  instagram: '',
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
  images: ImageLookup;
  updateImage: (mode: ImageViewMode, purpose: SupportedPurpose, image?: ImageDetail) => void;
  royalties: RoyaltiesData;
  setRoyalties: (royalties: RoyaltiesData) => void;
  social: SocialData;
  setSocial: (social: SocialData) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  tab: 'describe',
  setTab: () => null,
  describe: defaultDescribe,
  setDescribe: () => null,
  traits: [],
  setTraits: () => null,
  contract: {
    contract: DataContract.Immutable,
  },
  setContract: () => null,
  images: defaultImages,
  updateImage: (_mode: ImageViewMode, _purpose: SupportedPurpose, _image?: ImageDetail) => null,
  royalties: defaultRoyalties,
  setRoyalties: () => null,
  social: defaultSocial,
  setSocial: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [tab, setTab] = useState('describe');
  const [describe, setDescribe] = useState<DescribeData>(defaultDescribe);
  const [traits, setTraits] = useState<string[]>([]);
  const [contract, setContract] = useState<ContractData>(defaultContract);
  const [images, setImages] = useState<ImageLookup>(defaultImages);
  const [royalties, setRoyalties] = useState<RoyaltiesData>(defaultRoyalties);
  const [social, setSocial] = useState<SocialData>(defaultSocial);

  const updateImage = useCallback(
    (mode: ImageViewMode, purpose: SupportedPurpose, image?: ImageDetail) => {
      setImages((prev) => {
        const next = {
          desktop: { ...prev['desktop'] },
          tablet: { ...prev['tablet'] },
          mobile: { ...prev['mobile'] },
        };

        next[mode][purpose] = image;

        return next;
      });
    },
    [setImages]
  );

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
        updateImage,
        royalties,
        setRoyalties,
        social,
        setSocial,
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
