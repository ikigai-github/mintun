import {
  boolean,
  date,
  enum_,
  Input,
  literal,
  maxLength,
  minLength,
  minValue,
  number,
  object,
  optional,
  regex,
  string,
  union,
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

export const DataContract = {
  Immutable: 'IMMUTABLE',
  Evolvable: 'MUTABLE',
} as const;

export const ConfigureContractSchema = object({
  contract: enum_(DataContract),
  window: optional(
    object({
      from: date(),
      to: date(),
    })
  ),
  maxTokens: optional(number([minValue(0)])),
  group: optional(
    union([
      string('Policy ID of group must be a 28 byte (56 character) hex string', [
        minLength(56),
        maxLength(56),
        regex(/[a-fA-F0-9]+/),
      ]),
      literal(''),
    ])
  ),
});

export type ParentSubmitForm = {
  handleSubmit: () => Promise<boolean>;
};

export type DescribeCollectionData = Input<typeof DescribeCollectionSchema>;
export type ConfigureContractData = Input<typeof ConfigureContractSchema>;
