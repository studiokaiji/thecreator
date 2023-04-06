import { useEffect, useState } from 'react';

import { useImage, UseImageData } from './useImage';

export const useAutoCropImage = ({
  imageData,
  size,
}: {
  imageData?: UseImageData;
  size: { width: number; height: number; resolution?: number };
}) => {
  const { createImage } = useImage();

  const crop = async () => {
    if (!imageData) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw Error('canvas context does not exist');
    }

    const resolution = size.resolution || 4;

    canvas.width = size.width * resolution;
    canvas.height = size.height * resolution;

    const img = new Image();
    img.src = imageData.url;

    return new Promise<UseImageData>((resolve, reject) => {
      img.onload = () => {
        const dx =
          img.width > img.height
            ? -(img.width - canvas.width) / resolution / 2
            : 0;
        const dy =
          img.height > img.width
            ? -(img.height - img.width) / resolution / 2
            : 0;

        ctx.scale(resolution, resolution);
        ctx.drawImage(
          img,
          dx,
          dy,
          img.width / resolution,
          img.height / resolution
        );

        canvas.toBlob((blob) => {
          if (blob !== null) {
            resolve(createImage(blob as File, 'thumbnail'));
          } else {
            reject();
          }
        }, 'image/jpeg');
      };
    });
  };

  const [cropped, setCropped] = useState<UseImageData | null>(null);

  useEffect(() => {
    crop().then(setCropped);
  }, [imageData]);

  return cropped;
};
