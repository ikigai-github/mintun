import filetype from 'magic-bytes.js';

import { defaultImage } from '@/app/collection/create/context';
import { ImageType, ImageU, UploadImageData } from '@/app/collection/create/schema';

export async function readerResultToImageData(readerResult: string | ArrayBuffer | null): Promise<ImageU | undefined> {
  try {
    const binaryStr: Buffer = Buffer.from(readerResult as ArrayBuffer);
    const str64 = binaryStr.toString('base64');
    const fileTypeU = filetype(binaryStr);

    const fileType = {
      mime: fileTypeU[0]?.mime || '', // first in array was most common ie for png it was [png, apng]
    };
    const blob = new Blob([binaryStr], { type: fileType?.mime });
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      img.onload = () => {
        resolve({
          src: str64,
          mime: fileType?.mime,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.onerror = reject;
    });
  } catch (err) {
    console.log(err);
  }
}
// Convert the result of the FileReader to a base64 string
export function readerResultToBase64(readerResult: string | ArrayBuffer | null): string {
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
export function setImageByView(
  imagesState: UploadImageData,
  readerResult: string | ArrayBuffer | null,
  view: keyof UploadImageData,
  imageType: keyof ImageType
) {
  let prevImagesState = imagesState;
  if (readerResult) {
    readerResultToImageData(readerResult).then((data) => {
      prevImagesState[view][imageType] = data || defaultImage;
      for (const key in imagesState) {
        const viewAlt = key as keyof UploadImageData;
        if (view != viewAlt && !prevImagesState[viewAlt][imageType].src) {
          prevImagesState[viewAlt][imageType] = data || defaultImage;
        }
      }
      return prevImagesState;
    });
  }
  return prevImagesState;
}
