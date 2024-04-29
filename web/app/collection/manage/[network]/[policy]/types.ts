import { randomUUID } from 'crypto';
import type { CollectionInfo, MintunNft } from '@ikigai-github/mintun-offchain';
import { array, boolean, Input, maxLength, object, string } from 'valibot';

import { DefaultImageDetail, ImageDetail, ImageDetailSchema } from '@/lib/image';

export type CollectionNft = {
  nft: MintunNft;
  status: 'draft' | 'minted-editable' | 'minting' | 'minted-locked';
};

export const DraftTokenSchema = object({
  uid: string(), // Internal random id for finding / updating
  image: ImageDetailSchema,
  name: string('Name can be at most 64 characters in length', [
    maxLength(64, 'Name can be at most 64 characters in length'),
  ]),
  description: string('Description can be at most 64 characters', [
    maxLength(64, 'Description can be at most 64 characters'),
  ]),
  id: string('Id must be less than 64 characters', [maxLength(64, 'Id must be less than 64 characters')]),
  tags: array(object({ tag: string([maxLength(20, 'Tag cannot exceed 24 characters')]) }), [
    maxLength(8, 'Only up to 8 tags supported'),
  ]),
  traits: array(
    object({
      label: string([maxLength(64, 'Trait label cannot be more thant 64 character')]),
      trait: string([maxLength(64, 'Trait value cannot be more thant 64 character')]),
      preexisting: boolean(),
    })
  ),
});

export type DraftTokenData = Input<typeof DraftTokenSchema>;

// BELOW IS TEMPORARY for testing will move to a test or remove
export const drafts: MintunNft[] = [
  {
    name: 'Guy Smoking',
    image: 'ipfs://Qma4Y6f1Kh2bExhNvSa3ooeT2XhX92r5RjbrKq62chTjmo',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy smoking',
    files: [
      {
        src: 'ipfs://Qma4Y6f1Kh2bExhNvSa3ooeT2XhX92r5RjbrKq62chTjmo',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'smoking',
      type: 'guy',
      background: 'light blue',
    },
    id: 'xa7sgkjs',
    tags: ['cool', 'hip', 'neat'],
  },
  {
    name: 'Guy Pooping',
    image: 'ipfs://QmbxVn9628DWipG3giijaH9KvJTZbmnb9B46dvgUGLQmLs',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy pooping',
    files: [
      {
        src: 'ipfs://QmbxVn9628DWipG3giijaH9KvJTZbmnb9B46dvgUGLQmLs',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'pooping',
      type: 'guy',
      background: 'yellow',
    },
  },
];

export const minted: MintunNft[] = [
  {
    name: 'Guy Thinking',
    image: 'ipfs://QmPHJXbaNbNuF2vtVutfmLECJfzNtLrGTVRdkPqePXiTFB',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy thinking',
    files: [
      {
        src: 'ipfs://QmPHJXbaNbNuF2vtVutfmLECJfzNtLrGTVRdkPqePXiTFB',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'thinking',
      type: 'guy',
      background: 'eggshell',
    },
  },
  {
    name: 'Guy Sneaking',
    image: 'ipfs://QmcGWxZyVNXcZ6MUSTtAvQPkZ6qzUeMBA4T61iHgV3tGdC',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy sneaking',
    files: [
      {
        src: 'ipfs://QmcGWxZyVNXcZ6MUSTtAvQPkZ6qzUeMBA4T61iHgV3tGdC',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'sneaking',
      type: 'guy',
      background: 'blue',
    },
  },
  {
    name: 'Guy Flipping',
    image: 'ipfs://QmU9rPC9WY9CfqtuYHLVTcTNwb4J9UyyR3kCKZSuBy8qhU',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy flipping you off',
    files: [
      {
        src: 'ipfs://QmU9rPC9WY9CfqtuYHLVTcTNwb4J9UyyR3kCKZSuBy8qhU',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'flipping',
      type: 'guy',
      background: 'light blue',
    },
  },
  {
    name: 'Guy Pretending',
    image: 'ipfs://QmQrBjtzxSoZmmjKCu6mzdRfHxCnLgtZHYgYRypdADAGCF',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy pretending to make out with someone',
    files: [
      {
        src: 'ipfs://QmQrBjtzxSoZmmjKCu6mzdRfHxCnLgtZHYgYRypdADAGCF',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'pretending',
      type: 'guy',
      background: 'yellow',
    },
  },
  {
    name: 'Guy Derping',
    image: 'ipfs://QmYnSgBAMkxiw9TzyTphnzE7vJpCjDWJYAgo7hBBPZKufe',
    mediaType: 'image/jpeg',
    description: 'A picture of a guy derping',
    files: [
      {
        src: 'ipfs://QmYnSgBAMkxiw9TzyTphnzE7vJpCjDWJYAgo7hBBPZKufe',
        mediaType: 'image/jpeg',
        purpose: 'Thumbnail',
        dimension: {
          width: 100,
          height: 100,
        },
      },
    ],
    traits: {
      action: 'derping',
      type: 'guy',
      background: 'blue',
    },
  },
];
