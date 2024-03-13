'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';
import { ImageType, UploadImageData } from '@/app/create-collection/context';

type DropzoneProps = {
  callback: (imgs: UploadImageData) => void;
  imagesState: UploadImageData;
  view: 'desktop' | 'tablet' | 'mobile';
  className?: string;
  imageClassName?: string;
};

// Convert the result of the FileReader to a base64 string
function readerResultToBase64(readerResult: string | ArrayBuffer | null): string {
  try {
    if (!readerResult) {
      return '';
    }
    const binaryStr: Buffer = Buffer.from(readerResult as ArrayBuffer);
    const str64 = binaryStr.toString('base64');
    return str64 || '';
  } catch (err) {
    console.log(err);
  }
  return '';
}

// Set images according to the view and image type
function setImageByView(
  imagesState: UploadImageData,
  str64: string,
  view: keyof UploadImageData,
  imageType: keyof ImageType
) {
  let prevImagesState = imagesState;
  if (str64) {
    prevImagesState[view][imageType] = str64;
    for (const key in imagesState) {
      const viewAlt = key as keyof UploadImageData;
      if (view != viewAlt && !prevImagesState[viewAlt][imageType]) {
        prevImagesState[viewAlt][imageType] = str64;
      }
    }
  }
  return prevImagesState;
}

export function BannerDropzone({ callback, imagesState, view, className, imageClassName }: DropzoneProps) {
  const [img, setImg] = useState<string | null>(imagesState[view].banner);
  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str64 = readerResultToBase64(reader.result);
        const newImagesState = setImageByView(imagesState, str64, view, 'banner');
        callback(newImagesState);
        setImg(str64);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      className={cn(className, 'flex h-[200px] cursor-pointer items-center justify-center rounded-md border')}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {img ? (
        <img
          className={cn('h-[200px] rounded-md object-cover', imageClassName)}
          height={150}
          src={'data:image/jpeg;base64, ' + img || undefined}
          alt="Avatar"
        />
      ) : (
        <div className="px-3">
          <p className="align-center text-center text-3xl font-bold">Add a Banner Image</p>
          <p className="text-center text-sm opacity-70">Click to upload or drag image</p>
        </div>
      )}
    </div>
  );
}

export function AvatarDropzone({ callback, imagesState, view, className, imageClassName }: DropzoneProps) {
  const [img, setImg] = useState<string | null>(imagesState[view].avatar);
  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str64 = readerResultToBase64(reader.result);
        const newImagesState = setImageByView(imagesState, str64, view, 'avatar');
        callback(newImagesState);
        setImg(str64);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div
      className={cn(
        'flex h-[200px] w-[200px] min-w-[200px] cursor-pointer items-center justify-center rounded-md border text-center',
        className
      )}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {img ? (
        <img
          className={cn('h-[200px] w-[200px] rounded-md object-cover', imageClassName)}
          src={'data:image/jpeg;base64, ' + img || undefined}
          alt="Avatar"
        />
      ) : (
        <div className="px-3">
          <p className=" text-2xl font-semibold">Add an Avatar Image</p>
          <p className="text-sm opacity-70">Click to upload or drag image</p>
        </div>
      )}
    </div>
  );
}

export function ThumbnailDropzone({ callback, imagesState, view, className, imageClassName }: DropzoneProps) {
  const [img, setImg] = useState<string | null>(imagesState[view].thumbnail);
  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str64 = readerResultToBase64(reader.result);
        const newImagesState = setImageByView(imagesState, str64, view, 'thumbnail');
        callback(newImagesState);
        setImg(str64);
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });
  return (
    <div
      className={cn('flex h-[200px] w-[200px] cursor-pointer items-center justify-center', className)}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {img ? (
        <img
          className={cn('h-[200px] w-[200px] object-cover ', imageClassName)}
          height={200}
          width={200}
          src={'data:image/jpeg;base64, ' + img || undefined}
          alt="Thumbnail"
        />
      ) : (
        <div className="px-3">
          <p className=" text-center text-xl font-bold ">Add Thumbnail</p>
          <p className="text-sm opacity-70">Click to upload or drag image</p>
        </div>
      )}
    </div>
  );
}
