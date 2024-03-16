import { UploadImageData } from '@/app/collection/create/schema';

export type DropzoneProps = {
  callback: (imgs: UploadImageData) => void;
  imagesState: UploadImageData;
  view: 'desktop' | 'tablet' | 'mobile';
  className?: string;
  imageClassName?: string;
};
