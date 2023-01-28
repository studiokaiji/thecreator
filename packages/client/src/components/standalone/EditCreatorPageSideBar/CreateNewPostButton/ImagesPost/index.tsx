import LoadingButton from '@mui/lab/LoadingButton';
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
        contentsType: 'images',
        descriptions,
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
                <PlansSelect />
                <LoadingButton
                  disabled={!form.formState.isValid}
                  loading={isUploading}
                  onClick={post}
                  variant="contained"
                >
                  {t('post')}
                </LoadingButton>
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
