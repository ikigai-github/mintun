import {
  boolean,
  coerce,
  custom,
  date,
  enum_,
  forward,
  Input,
  literal,
  maxLength,
  maxValue,
  minLength,
  minValue,
  number,
  object,
  optional,
  regex,
  startsWith,
  string,
  union,
  url,
} from 'valibot';

export const DescribeSchema = object({
  collection: string('The collection name is required', [
    minLength(3, 'The collection must have a name of at least 3 characters'),
    maxLength(64, 'Collection name cannot be more than 64 characters'),
  ]),
  artist: union([literal(''), string([maxLength(24, 'Artist name cannot be more than 24 characters')])]),
  project: union([literal(''), string([maxLength(24, 'Project/Brand name cannot be more than 24 characters')])]),
  description: union([literal(''), string([maxLength(64, 'Description cannot be more than 64 characters')])]),
  nsfw: boolean(),
});

export const DataContract = {
  Immutable: 'IMMUTABLE',
  Evolvable: 'MUTABLE',
} as const;

export const AddTraitSchema = object({
  trait: string('Trait must be at least one character', [minLength(0)]),
});

export const ContractSchema = object({
  contract: enum_(DataContract),
  window: optional(
    object({
      from: date(),
      to: date(),
    })
  ),
  maxTokens: coerce(union([number([minValue(0)]), literal('')]), (str) => {
    const num = Number(str);
    return Number.isNaN(num) ? '' : num;
  }),
  group: union([
    string('Policy ID of group must be a 28 byte (56 character) hex string', [
      minLength(56),
      maxLength(56),
      regex(/[a-fA-F0-9]+/),
    ]),
    literal(''),
  ]),
});

export const RoyaltySchema = object(
  {
    address: string('Address not in string format', [minLength(1)]),
    percent: coerce(
      union([number('Percentage not in number format', [maxValue(100), minValue(0.01)]), literal('')]),
      (str) => {
        const num = Number(str);
        return Number.isNaN(num) ? '' : num;
      }
    ),
    minFee: coerce(union([number([minValue(0)]), literal('')]), (str) => {
      const num = Number(str);
      return Number.isNaN(num) ? '' : num;
    }),
    maxFee: coerce(union([number([minValue(0)]), literal('')]), (str) => {
      const num = Number(str);
      return Number.isNaN(num) ? '' : num;
    }),
  },
  [
    forward(
      custom(
        (royalty) => royalty.minFee === '' || royalty.maxFee == '' || royalty.maxFee >= royalty.minFee,
        'Max fee must be greater than or equal to min fee'
      ),
      ['maxFee']
    ),
  ]
);

export const SocialSchema = object({
  website: union([
    literal(''),
    string([url('Must be a complete URL'), startsWith('https://', 'Website is expected to be an https url')]),
  ]),
  twitter: union([
    literal(''),
    string([
      url('Must be a complete URL not just the username'),
      regex(
        /^https:\/\/(www.)?(twitter|x).com\/\w+/,
        'Username url must start with x or twitter domain (e.g. https://x.com/username)'
      ),
    ]),
  ]),
  discord: union([
    literal(''),
    string([
      url('Must be a complete URL not just the invite code'),
      regex(
        /^https:\/\/(www.)?discord\.(com?|gg)\/\w+/,
        'Invite must start with discord domain (e.g. https://discord.com/invite/abcdef)'
      ),
    ]),
  ]),
  instagram: union([
    literal(''),
    string([
      url('Must be a complete URL not just the username'),
      regex(
        /^https:\/\/(www.)?(instagram\.com|ig\.me)\/\w+/,
        'Username must start with an instagram domain (e.g. https//ig.me/username)'
      ),
    ]),
  ]),
});

const ImageSchema = object({
  src: string('Image not in string format', [minLength(1)]),
  mime: string('Mime not in string format', [minLength(1)]),
  width: number('Width not in number format', [minValue(1)]),
  height: number('Height not in number format', [minValue(1)]),
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

export type DescribeData = Input<typeof DescribeSchema>;
export type ContractData = Input<typeof ContractSchema>;
export type AddTraitData = Input<typeof AddTraitSchema>;
export type UploadImageData = Input<typeof UploadImageSchema>;
export type ImageGroupData = Input<typeof ImageGroupSchema>;
export type ImageData = Input<typeof ImageSchema>;
export type RoyaltyData = Input<typeof RoyaltySchema>;
export type SocialData = Input<typeof SocialSchema>;
