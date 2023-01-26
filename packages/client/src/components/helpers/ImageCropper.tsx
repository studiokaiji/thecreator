import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';

import { useImage, UseImageData } from '@/hooks/useImage';

type ImageCropperProps = {
  image: UseImageData;
  aspect: number;
  onCropped: (image: UseImageData) => void;
  onCancel: () => void;
  cropContainerSize?: {
    width: number;
    height: number;
  };
};

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
  cropContainerSize = {
    height: 600,
    width: 600,
  },
  image,
  onCancel,
  onCropped,
}: ImageCropperProps) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area>();

  const { t } = useTranslation();

  const { createImage } = useImage();

  const onCropCompleteHandler = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const onClickOkButtonHandler = async () => {
    try {
      if (!croppedAreaPixels) return;
      const croppedImage = (await getCroppedImageBlob(
        image.url,
        croppedAreaPixels
      )) as File;
      const cropped = createImage(croppedImage, image.type);
      onCropped(cropped);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Stack>
      <Box
        sx={{
          height: cropContainerSize.height,
          position: 'relative',
          width: cropContainerSize.width,
        }}
      >
        <Cropper
          aspect={aspect}
          crop={crop}
          image={image.url}
          onCropChange={setCrop}
          onCropComplete={onCropCompleteHandler}
          onMediaLoaded={(mediaSize) => {
            setZoom(600 / mediaSize.naturalHeight);
          }}
          onZoomChange={setZoom}
          zoom={zoom}
        />
      </Box>
      <Stack pb={3} pt={4} px={4} spacing={2}>
        <Slider
          defaultValue={0}
          max={5}
          min={1}
          onChange={(_, v) => setZoom(Number(v))}
          step={0.05}
          value={zoom}
        />
        <Stack direction="row" gap={1} justifyContent="right">
          <Button onClick={onCancel} variant="outlined">
            {t('cancel')}
          </Button>
          <Button onClick={onClickOkButtonHandler} variant="contained">
            {t('ok')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
