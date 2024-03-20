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


export async function readFile(file: File)  {
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
}