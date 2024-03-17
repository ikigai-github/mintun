'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { DropzoneProps } from '@/lib/dropzone/types';
import { readerResultToBase64, setImageByView } from '@/lib/dropzone/utils';
import { cn } from '@/lib/utils';

export function AvatarDropzone({ callback, imagesState, view, className, imageClassName }: DropzoneProps) {
  const [img, setImg] = useState<string | null>(imagesState[view].avatar.src || imagesState['desktop'].avatar.src);
  const onDrop = useCallback((acceptedFiles: any) => {
    acceptedFiles.forEach((file: any) => {
      const reader = new FileReader();

      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str64 = readerResultToBase64(reader.result);

        const newImagesState = setImageByView(imagesState, reader.result, view, 'avatar');
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
          src={'data:image;base64, ' + img || undefined}
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
