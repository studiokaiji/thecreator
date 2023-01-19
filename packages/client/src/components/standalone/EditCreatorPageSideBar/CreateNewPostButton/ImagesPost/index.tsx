import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ImageList } from './ImageList';

import { FileUploader } from '@/components/standalone/FileUploader';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useImage, UseImageData } from '@/hooks/useImage';

export type ImagesPostFormInput = {
  descriptions: string[];
  borderLockAddress: string;
  title: string;
};

export const ImagesPost = () => {
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

  const [uploadStatus, setUploadStatus] = useState<
    'waitingSelectFiles' | 'uploading' | 'done'
  >('waitingSelectFiles');

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
    setUploadStatus('done');
  };

  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postImages')}</Typography>
        {images.length ? (
          <>
            <ImageList images={images} onChangeImages={setImages} />
            <TextField
              label={t('title')}
              variant="standard"
              {...form.register('title', {
                required: t('validationErrors.required'),
              })}
              required
              error={!!form.formState.errors.title?.message}
              helperText={form.formState.errors.title?.message}
            />
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
                    <MenuItem key={`plan-select-${plan.id}`} value={plan.id}>
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
          <FileUploader
            onRetriveValidFiles={onRetriveValidFilesHandler}
            type="images"
          />
        )}
      </Stack>
    </FormProvider>
  );
};
