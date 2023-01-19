import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TitleTextField } from '../common/TitleTextField';

import { ImageList } from './ImageList';

import { FileUploader } from '@/components/standalone/FileUploader';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useImage, UseImageData } from '@/hooks/useImage';

export type ImagesPostFormInput = {
  descriptions: string[];
  borderLockAddress: string;
  title: string;
};

type ImagesPostProps = {
  onDone: () => void;
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

  const { postData, uploadContents } = useCreatorPostForWrite();

  const [uploadStatus, setUploadStatus] = useState<'typing' | 'uploading'>(
    'typing'
  );

  const post = async () => {
    const { borderLockAddress, descriptions, title } = form.getValues();

    const id = await postData({
      borderLockAddress,
      contentsCount: images.length,
      contentsType: 'images',
      description: JSON.stringify(descriptions),
      title,
    });

    setUploadStatus('uploading');
    await uploadContents(
      {
        borderLockAddress: '',
        contentsType: 'images',
        id,
      },
      images
    );
    onDone();
  };

  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  useBeforeUnload(uploadStatus === 'uploading');

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postImages')}</Typography>
        {images.length ? (
          <>
            {uploadStatus === 'typing' ? (
              <>
                <ImageList images={images} onChangeImages={setImages} />
                <TitleTextField />
                <Controller
                  control={form.control}
                  name="borderLockAddress"
                  render={({ field }) => (
                    <TextField
                      required
                      select
                      label={t('plan')}
                      variant="standard"
                      {...field}
                      defaultValue={plans?.[0].id}
                    >
                      {plans?.map((plan) => (
                        <MenuItem
                          key={`plan-select-${plan.id}`}
                          value={plan.id}
                        >
                          <>
                            {plan.name} ({plan.id})
                          </>
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Button
                  disabled={!form.formState.isValid}
                  onClick={post}
                  variant="contained"
                >
                  {t('post')}
                </Button>
              </>
            ) : (
              <Stack spacing={2} textAlign="center">
                <CircularProgress sx={{ mx: 'auto' }} />
                <Typography>{t('uploading')}...</Typography>
              </Stack>
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
