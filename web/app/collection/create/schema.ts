import {
  boolean,
  check,
  date,
  enum_,
  forward,
  InferInput,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  pipe,
  regex,
  startsWith,
  string,
  transform,
  union,
  url,
} from 'valibot';

import { ImageSchema } from '@/lib/image';

export const DescribeSchema = object({
  collection: pipe(
    string('The collection name is required'),
    minLength(3, 'The collection must have a name of at least 3 characters'),
    maxLength(64, 'Collection name cannot be more than 64 characters')
  ),
  artist: pipe(string(), maxLength(24, 'Artist name cannot be more than 24 characters')),
  project: pipe(string(), maxLength(24, 'Project/Brand name cannot be more than 24 characters')),
  description: pipe(string(), maxLength(64, 'Description cannot be more than 64 characters')),
  nsfw: boolean(),
});

export const DataContract = {
  Immutable: 'IMMUTABLE',
  Evolvable: 'MUTABLE',
} as const;

export const AddTraitSchema = object({
  trait: pipe(string('Trait must be at least one character'), minLength(0)),
});

export const ContractSchema = object({
  contract: enum_(DataContract),
  window: optional(
    object({
      from: date(),
      to: date(),
    })
  ),
  maxTokens: pipe(
    string(),
    transform((str) => {
      const num = Number(str);
      return Number.isNaN(num) ? '' : num;
    }),
    minValue(0, 'Max tokens must be a positive number. Leave blank or set to zero for no maximum.')
  ),
  group: union([
    pipe(
      string('Policy ID of group must be a 28 byte (56 character) hex string'),
      minLength(56),
      maxLength(56),
      regex(/[a-fA-F0-9]+/)
    ),
    literal(''),
  ]),
});

export const RoyaltySchema = pipe(
  object({
    address: pipe(string('Address not in string format'), minLength(1, 'Must be a wallet or script address')),
    percent: pipe(
      string(),
      transform((str) => {
        const num = Number(str);
        return Number.isNaN(num) ? 0 : num;
      }),
      maxValue(100, 'Percent must between 0 and 100'),
      minValue(0, 'Percent must between 0 and 100'),
      transform((num) => (num === 0 ? undefined : num))
    ),
    minFee: pipe(
      string(),
      transform((str) => {
        const num = Number(str);
        return Number.isNaN(num) ? 0 : num;
      }),
      minValue(0)
    ),
    maxFee: pipe(
      string(),
      transform((str) => {
        const num = Number(str);
        return Number.isNaN(num) ? 0 : num;
      }),
      minValue(0)
    ),
  }),
  forward(
    check(
      (royalty) => royalty.minFee === 0 || royalty.maxFee == 0 || royalty.maxFee >= royalty.minFee,
      'Max fee must be greater than or equal to min fee'
    ),
    ['maxFee']
  ),
  forward(
    check(
      (royalty) => royalty.minFee > 0 || (royalty.percent || 0) > 0,
      'Must set a min fee or a percent fee greater than zero'
    ),
    ['percent']
  )
);

export const SocialSchema = object({
  website: union([
    literal(''),
    pipe(string(), url('Must be a complete URL'), startsWith('https://', 'Website is expected to be an https url')),
  ]),
  twitter: union([
    literal(''),
    pipe(
      string(),
      url('Must be a complete URL not just the username'),
      regex(
        /^https:\/\/(www.)?(twitter|x).com\/\w+/,
        'Username url must start with x or twitter domain (e.g. https://x.com/username)'
      )
    ),
  ]),
  discord: union([
    literal(''),
    pipe(
      string(),
      url('Must be a complete URL not just the invite code'),
      regex(
        /^https:\/\/(www.)?discord\.(com?|gg)\/\w+/,
        'Invite must start with discord domain (e.g. https://discord.com/invite/abcdef)'
      )
    ),
  ]),
  instagram: union([
    literal(''),
    pipe(
      string(),
      url('Must be a complete URL not just the username'),
      regex(
        /^https:\/\/(www.)?(instagram\.com|ig\.me)\/\w+/,
        'Username must start with an instagram domain (e.g. https//ig.me/username)'
      )
    ),
  ]),
});

const ImageGroupSchema = object({
  banner: ImageSchema,
  brand: ImageSchema,
  thumbnail: ImageSchema,
});

export const UploadImageSchema = object({
  // TODO: Upload images and save the uploaded image info into state
  desktop: ImageGroupSchema,
  tablet: ImageGroupSchema,
  mobile: ImageGroupSchema,
});

export type ParentSubmitForm = {
  handleSubmit: () => Promise<boolean>;
};

export type DescribeData = InferInput<typeof DescribeSchema>;
export type ContractData = InferInput<typeof ContractSchema>;
export type AddTraitData = InferInput<typeof AddTraitSchema>;
export type UploadImageData = InferInput<typeof UploadImageSchema>;
export type ImageGroupData = InferInput<typeof ImageGroupSchema>;
export type RoyaltyData = InferInput<typeof RoyaltySchema>;
export type SocialData = InferInput<typeof SocialSchema>;
