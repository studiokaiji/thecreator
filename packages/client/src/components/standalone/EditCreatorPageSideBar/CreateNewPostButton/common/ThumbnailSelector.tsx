import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ImageCell } from './ImageCell';

import { FileUploader } from '@/components/standalone/FileUploader';
import { useAutoCropImage } from '@/hooks/useAutoCropImage';
import { useImage, UseImageData } from '@/hooks/useImage';

type ThumbnailSelectorProps = {
  onDone: (imageData: UseImageData) => void;
};

export const ThumbnailSelector = ({ onDone }: ThumbnailSelectorProps) => {
  const { t } = useTranslation();

  const { createImage } = useImage();

  const [imageData, setImageData] = useState<UseImageData>();
  const onRetriveThumbnailFileHandler = ([file]: File[]) => {
    const image = createImage(file, 'thumbnail');
    setImageData(image);
  };

  const cropped = useAutoCropImage({
    imageData,
    size: { height: 170, width: 170 },
  });
  
  useEffect(() => {
    if (cropped) {
      onDone(cropped);
    }
  }, [cropped]);

  return (
    <Stack spacing={1.5}>
      <InputLabel sx={{ display: 'block' }}>{t('thumbnail')}</InputLabel>
      {cropped ? (
        <ImageCell
          onRequestDelete={() => setImageData(undefined)}
          src={cropped.url}
        />
      ) : (
        <FileUploader
          onRetriveValidFiles={onRetriveThumbnailFileHandler}
          type="thumbnail"
        />
      )}
    </Stack>
  );
};
