'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { DropzoneProps } from '@/lib/dropzone/types';
import { readerResultToBase64, setImageByView } from '@/lib/dropzone/utils';
import { cn } from '@/lib/utils';

export function ThumbnailDropzone({ callback, imagesState, view, className, imageClassName }: DropzoneProps) {
  const [img, setImg] = useState<string | null>(imagesState[view].thumbnail.src || imagesState['desktop'].banner.src);
  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str64 = readerResultToBase64(reader.result);
        const newImagesState = setImageByView(imagesState, reader.result, view, 'thumbnail');
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
          src={'data:image;base64, ' + img || undefined}
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
