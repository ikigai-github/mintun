'use client';

import { createContext, PropsWithChildren, useContext, useState } from 'react';
import {
  boolean,
  date,
  maxLength,
  minLength,
  number,
  object,
  optional,
  regex,
  string,
  Input as ValibotInput,
} from 'valibot';

export const DescribeCollectionSchema = object({
  collection: string([
    minLength(3, 'The collection must have a name of at least 3 characters'),
    maxLength(64, 'Collection name cannot be more than 64 characters'),
  ]),
  artist: optional(string()),
  project: optional(string()),
  description: optional(string()),
  nsfw: boolean(),
});

export const ConfigureContractSchema = object({
  validFrom: optional(date()),
  validTo: optional(date()),
  maxTokens: optional(number()),
  group: optional(
    string('Policy ID of group must be a 28 byte (56 character) hex string', [
      minLength(56),
      maxLength(56),
      regex(/[a-fA-F0-9]+/),
    ])
  ),
});

export type DescribeCollectionData = ValibotInput<typeof DescribeCollectionSchema>;
export type ConfigureContractData = ValibotInput<typeof ConfigureContractSchema>;

export type CreateCollectionContextProps = {
  description: DescribeCollectionData;
  setDescription: (data: DescribeCollectionData) => void;

  configuration: ConfigureContractData;
  setConfiguration: (data: ConfigureContractData) => void;
};

const CreateCollectionContext = createContext<CreateCollectionContextProps>({
  description: {
    collection: '',
    nsfw: false,
  },
  setDescription: () => null,
  configuration: {},
  setConfiguration: () => null,
});

export function CreateCollectionContextProvider(props: PropsWithChildren) {
  const [description, setDescription] = useState<DescribeCollectionData>({ collection: '', nsfw: false });
  const [configuration, setConfiguration] = useState<ConfigureContractData>({});

  return (
    <CreateCollectionContext.Provider value={{ description, setDescription, configuration, setConfiguration }}>
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
