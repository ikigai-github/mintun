import { blob, enum_, Input, instance, maxSize, mimeType, object, optional, string, url } from 'valibot';

export const AddImageSchema = object({
  purpose: enum_(ImagePurpose),
  url: string([url()]),
});

export type AddImageData = Input<typeof AddImageSchema>;
