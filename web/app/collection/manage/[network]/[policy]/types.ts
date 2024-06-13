import type { MintunNft } from '@ikigai-github/mintun-offchain';
import { array, boolean, InferInput, maxLength, object, pipe, string } from 'valibot';

import { ImageDetailSchema } from '@/lib/image';

export type CollectionNft = {
  nft: MintunNft;
  status: 'draft' | 'minted-editable' | 'minting' | 'minted-locked';
};

export const DraftTokenSchema = object({
  uid: string(), // Internal random id for finding / updating
  image: ImageDetailSchema,
  name: pipe(
    string('Name can be at most 64 characters in length'),
    maxLength(64, 'Name can be at most 64 characters in length')
  ),
  description: pipe(
    string('Description can be at most 64 characters'),
    maxLength(64, 'Description can be at most 64 characters')
  ),
  id: pipe(string('Id must be less than 64 characters'), maxLength(64, 'Id must be less than 64 characters')),
  tags: pipe(
    array(object({ tag: pipe(string(), maxLength(20, 'Tag cannot exceed 24 characters')) })),
    maxLength(8, 'Only up to 8 tags supported')
  ),
  traits: array(
    object({
      label: pipe(string(), maxLength(64, 'Trait label cannot be more thant 64 character')),
      trait: pipe(string(), maxLength(64, 'Trait value cannot be more thant 64 character')),
      preexisting: boolean(),
    })
  ),
});

export type DraftTokenData = InferInput<typeof DraftTokenSchema>;
