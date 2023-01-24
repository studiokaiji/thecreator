import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PlansSelect } from '../common/PlansSelect';
import { TitleTextField } from '../common/TitleTextField';

import { ImageList } from './ImageList';

import { FileUploader } from '@/components/standalone/FileUploader';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import { useImage, UseImageData } from '@/hooks/useImage';

type ImagesPostProps = {
  onDone: () => void;
};

export type ImagesPostFormInput = PostFormInput & {
  descriptions: string[];
};

export const ImagesPost = ({ onDone }: ImagesPostProps) => {
  const { t } = useTranslation();

  const [images, setImages] = useState<UseImageData[]>([]);

  const form = useForm<ImagesPostFormInput>({
    mode: 'onChange',
  });

  const { createImage } = useImage();

  const onRetriveValidFilesHandler = (files: File[]) => {
    const images = files.map((file) => createImage(file, 'images'));
    setImages(images);
  };

  const { postContents } = useCreatorPostForWrite();

  const [isUploading, setIsUploading] = useState(false);

  const post = async () => {
    const { borderLockAddress, descriptions, title } = form.getValues();

    setIsUploading(true);

    await postContents(
      {
        borderLockAddress,
        contentsCount: images.length,
        contentsType: 'images',
        description: JSON.stringify(descriptions),
        title,
      },
      images
    );

    images.forEach(({ revoke }) => revoke());

    setIsUploading(false);

    onDone();
  };

  useBeforeUnload(isUploading);

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postImages')}</Typography>
        {images.length ? (
          <>
            {isUploading ? (
              <Stack spacing={2} textAlign="center">
                <CircularProgress sx={{ mx: 'auto' }} />
                <Typography>{t('uploading')}...</Typography>
              </Stack>
            ) : (
              <>
                <ImageList images={images} onChangeImages={setImages} />
                <TitleTextField />
                <PlansSelect formKeyName="borderLockAddress" />
                <Button
                  disabled={!form.formState.isValid}
                  onClick={post}
                  variant="contained"
                >
                  {t('post')}
                </Button>
              </>
            )}
          </>
        ) : (
          <FileUploader
            onRetriveValidFiles={onRetriveValidFilesHandler}
            type="images"
          />
        )}
      </Stack>
    </FormProvider>
  );
};
