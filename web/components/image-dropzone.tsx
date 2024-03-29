'use client';

import React, { useEffect, useRef } from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

import { ImageDetail } from '@/lib/image';
import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { useImageDropzone } from './use-image-dropzone';

export type ImageDropzoneProps = {
  shapeClassName?: string;
  containerClassName?: string;
  clearClassName?: string;
  showClearButton?: boolean;
  dropMessage?: React.ReactNode;
  defaultImage?: string;
  selectedImage?: ImageDetail;
  onImageChange?: (image?: ImageDetail) => void;
};

const ImageDropzone = React.forwardRef<HTMLImageElement, React.HTMLAttributes<HTMLImageElement> & ImageDropzoneProps>(
  (
    {
      shapeClassName,
      containerClassName,
      dropMessage,
      showClearButton,
      clearClassName,
      selectedImage,
      defaultImage,
      onImageChange,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { preview, getRootProps, getInputProps, isReady, width, height, file, ext, mime, error, reset } =
      useImageDropzone(selectedImage);

    // Fire image ready anytime the component has fully loaded its image
    useEffect(() => {
      if (isReady && file && onImageChange) {
        console.log(`on Image Change: width: ${width} and height: ${height}`);
        onImageChange({
          file,
          preview,
          ext,
          mime,
          width,
          height,
        });
      }
    }, [file, ext, mime, width, height, isReady, onImageChange, preview]);

    // Display a toast whenever an error occurs
    useEffect(() => {
      if (error) {
        toast(error);
      }
    }, [error]);

    return (
      <div className={cn(containerClassName, shapeClassName)} {...getRootProps()}>
        <input {...getInputProps()} />
        {preview ? (
          <div className="grid grid-cols-1 grid-rows-1">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              ref={ref}
              alt="Preview of local file image"
              src={preview}
              className={cn('col-start-1 row-start-1', shapeClassName, className)}
              {...props}
            />
            <div className="col-start-1 row-start-1 size-full"> {children} </div>
            {showClearButton ? (
              <div
                className={cn(
                  'group col-start-1 row-start-1 flex size-full cursor-pointer items-start',
                  clearClassName
                )}
              >
                <Button
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                    event.stopPropagation();
                    if (onImageChange) {
                      onImageChange();
                    }
                    reset();
                  }}
                  variant="secondary"
                  size="icon"
                  className="m-1 hidden items-center justify-center group-hover:flex"
                >
                  <Cross2Icon className="size-6" />
                </Button>
              </div>
            ) : undefined}
          </div>
        ) : (
          <div
            className={cn('border-foreground/10 bg-muted flex size-full border-2 border-dashed p-2', shapeClassName)}
          >
            {dropMessage ?? (
              <div className="flex items-center justify-center">
                <span className="font-heading basis-2/3 text-center">Drop a file or click to add an image</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

ImageDropzone.displayName = 'ImageDropzone';

export default ImageDropzone;
