import { useCallback, useEffect, useState } from 'react';
import filetypeinfo from 'magic-bytes.js';
import { DropzoneInputProps, DropzoneRootProps, FileRejection, useDropzone } from 'react-dropzone';

import { ImageDetail } from '@/lib/image';

const MAX_IMAGE_DROP_FILE_SIZE = 1024 * 1024 * 10; // 10 MB

export type ImageDropzoneProps = {
  data: Blob | string;
  error: string;
  mime: string;
  name: string;
  ext: string;
  width: number;
  height: number;
  preview: string;
  isReady: boolean;
  reset: () => void;
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
};

// Make the general useDropzone specific to handling single file images with some extra steps to
// grab out the mime info and dimensions of the image.
export function useImageDropzone(preselectedImage?: ImageDetail): ImageDropzoneProps {
  const [data, setData] = useState<Blob | string>(preselectedImage?.data ?? '');
  const [error, setError] = useState('');
  const [name, setName] = useState(preselectedImage?.name ?? '');
  const [mime, setMime] = useState(preselectedImage?.mime ?? '');
  const [ext, setExt] = useState(preselectedImage?.ext ?? '');
  const [width, setWidth] = useState(preselectedImage?.width ?? 0);
  const [height, setHeight] = useState(preselectedImage?.height ?? 0);
  const [preview, setPreview] = useState(preselectedImage?.preview ?? '');
  const [mimeDone, setMimeDone] = useState(false);
  const [dimDone, setDimDone] = useState(false);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    if (mimeDone && dimDone && data) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [setReady, mimeDone, dimDone, data]);

  const reset = useCallback(() => {
    setData('');
    setName('');
    setError('');
    setMime('');
    setExt('');
    setWidth(0);
    setHeight(0);
    setPreview((preview) => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }

      return '';
    });
    setMimeDone(false);
    setDimDone(false);
    setReady(false);
  }, [setData, setError, setMime, setExt, setWidth, setHeight, setPreview, setMimeDone, setDimDone, setReady]);

  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      reset();
      const rejection = fileRejections[0];
      setError(rejection.errors[0].message);
    },
    [reset, setError]
  );

  const onDropAccepted = useCallback(
    <T extends File>(files: T[]) => {
      reset();
      const file = files[0];

      setData(file);
      setName(file.name.replace(/\.[^/.]+$/, ''));

      file.arrayBuffer().then((buffer) => {
        let foundExt = false;
        let foundMime = false;
        const bytes = new Uint8Array(buffer);
        const results = filetypeinfo(bytes);
        if (results && results.length > 0) {
          for (const info of results) {
            if (info.extension) {
              setExt(info.extension);
              foundExt = true;
            }
            if (info.mime) {
              setMime(info.mime);
              foundMime = true;
            }

            if (foundExt && foundMime) {
              break;
            }
          }
        }

        if (!foundExt || !foundMime) {
          setError('Failed to detect mime type of image. It may be unsupported');
        }

        setMimeDone(true);
      });

      const image = new Image();
      image.onload = () => {
        setWidth(image.naturalWidth);
        setHeight(image.naturalHeight);
        // Don't keep the image in memory. Will also fire onerror which will let us know we got the dimensions.
        image.src = '';
      };

      image.onerror = () => setDimDone(true);

      // Clean up old preview if set use the preview to get the dimensions
      setPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }

        const preview = URL.createObjectURL(file);
        image.src = preview;
        return preview;
      });
    },
    [reset, setData, setMime, setExt, setError, setPreview, setWidth, setHeight, setMimeDone, setDimDone]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
    maxSize: MAX_IMAGE_DROP_FILE_SIZE,
    multiple: false,
    onDropAccepted,
    onDropRejected,
  });

  return {
    data,
    name,
    mime,
    ext,
    error,
    width,
    height,
    preview,
    reset,
    isReady,
    getRootProps,
    getInputProps,
  };
}
