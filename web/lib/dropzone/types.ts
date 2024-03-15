import { UploadImageData } from '@/app/create-collection/context';

export type DropzoneProps = {
  callback: (imgs: UploadImageData) => void;
  imagesState: UploadImageData;
  view: 'desktop' | 'tablet' | 'mobile';
  className?: string;
  imageClassName?: string;
};
