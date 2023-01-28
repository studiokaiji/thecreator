import imageCompression from 'browser-image-compression';

export type UseImageData = {
  compress: () => Promise<Blob>;
  revoke: () => void;
  url: string;
  data: Blob;
  type: Omit<ContentsType, 'audio' | 'text'>;
};

const fileType = 'image/jpeg';

export const useImage = () => {
  const createImage = (
    imageFile: File,
    type: Omit<ContentsType, 'audio' | 'text'>
  ): UseImageData => {
    if (imageFile.type.split('/')[0] !== 'image') {
      throw Error('Invalid file type');
    }

    let data = imageFile;
    let url = URL.createObjectURL(data);
    let revoke = () => URL.revokeObjectURL(url);

    const compress = async (): Promise<Blob> => {
      const maxWidth = type === 'headerImage' ? 1920 : 640;

      const image = new Image();
      image.src = url;

      const isHeightLarger = image.naturalWidth < image.naturalHeight;

      const compressed = await imageCompression(data, {
        fileType,
        maxSizeMB: 10,
        maxWidthOrHeight: isHeightLarger ? undefined : maxWidth,
        useWebWorker: true,
      });

      if (isHeightLarger) {
        const canvas = document.createElement('canvas');
        canvas.width =
          type === 'headerImage'
            ? 1920
            : type === 'thumbnail' || type === 'iconImage'
            ? 680
            : 1000;
        canvas.height =
          image.naturalHeight * (canvas.width / image.naturalWidth);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw Error();
        }
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        const resizedBlob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject();
            }
          }, fileType)
        );

        return resizedBlob;
      }
      revoke();

      data = compressed;
      url = URL.createObjectURL(compressed);
      revoke = () => URL.revokeObjectURL(url);

      return compressed;
    };

    return { compress, data, revoke, type, url };
  };

  return { createImage };
};
