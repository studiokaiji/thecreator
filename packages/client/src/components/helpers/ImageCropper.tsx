import type { DialogProps } from '@mui/material/Dialog';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

import { CenterModalWithTitle } from './CenterModalWithTitle';

import { useImage, UseImageData } from '@/hooks/useImage';

type ImageCropperProps = {
  image: UseImageData;
  aspect: number;
  imageType: Omit<ContentsType, 'audio' | 'text'>;
  onCropped: (image: UseImageData) => void;
} & DialogProps;

const getImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = src;
  });

const getCroppedImageBlob = async (src: string, pixelCrop: Area) => {
  const image = await getImage(src);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw Error('canvas context does not exist');
  }

  // canvasサイズを設定
  canvas.width = image.width;
  canvas.height = image.height;

  // canvas上に画像を描画
  ctx.drawImage(image, 0, 0);

  // トリミング後の画像を抽出
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // canvasのサイズ指定(切り取り後の画像サイズに更新)
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // 抽出した画像データをcanvasの左隅に貼り付け
  ctx.putImageData(data, 0, 0);

  // canvasを画像に変換
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((file) => {
      if (file !== null) {
        resolve(file);
      } else {
        reject();
      }
    });
  });
};

export const ImageCropper = ({
  aspect,
  image,
  imageType,
  onCropped,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const { createImage } = useImage();

  const onCropComplete = useCallback(
    async (_: Area, croppedAreaPixels: Area) => {
      if (!croppedAreaPixels) return;
      try {
        const croppedImage = (await getCroppedImageBlob(
          image.url,
          croppedAreaPixels
        )) as File;
        const cropped = createImage(croppedImage, imageType);
        onCropped(cropped);
      } catch (e) {
        console.error(e);
      }
    },
    []
  );

  return (
    <CenterModalWithTitle title="Crop">
      <Cropper
        aspect={aspect}
        crop={crop}
        image={image.url}
        onCropChange={setCrop}
        onCropComplete={onCropComplete}
        onZoomChange={setZoom}
        zoom={zoom}
      />
    </CenterModalWithTitle>
  );
};
