'use  client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Separator } from '@radix-ui/react-dropdown-menu';
import { Client } from '@web3-storage/w3up-client';
import { useDropzone } from 'react-dropzone';

import { createWebClient, useStorageClient } from '@/lib/storage/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FileImage() {
  const [image, setImage] = useState<string | null>(null);
  const { client } = useStorageClient();
  const imageRef = useRef<HTMLImageElement>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImage(URL.createObjectURL(acceptedFiles[0]));
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // I want to support uploading or entering a url
  // I want a preview
  // I want it to be restricted in size
  // I want to show its stats (media type, width, height, file size)
  // If it is too big say > 5MB I want to give the option to compress it and scale it down
  // I think though for now I will simply say it is too large
  // I want them to pick a purpose for the image

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="bg-accent font-heading pointer-cursor hover:bg-secondary flex h-20 w-full items-center justify-center rounded-md border border-dashed"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="w-full text-center">Drop or Click here to add an image from your file system</div>
      </div>

      <Separator className="font-heading">- or enter an image url -</Separator>
      <div className="flex w-full flex-col gap-2">
        <Label htmlFor="email">Image Url</Label>
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input placeholder="https://www.example.com/image.jpg" />
          <Button type="submit">Submit</Button>
        </div>
      </div>

      {image ? (
        <div className="rounded-md border p-4">
          <img alt="preview image" ref={imageRef} className="max-h-72 rounded-md" src={image} />
        </div>
      ) : undefined}
      {imageRef.current ? (
        <div>
          <div>Width: {imageRef.current.naturalWidth}</div>
          <div>Height: {imageRef.current.naturalHeight}</div>
        </div>
      ) : (
        <div> Nope </div>
      )}
    </div>
  );
}
