import { ImageType, UploadImageData } from '@/app/create-collection/context';

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
