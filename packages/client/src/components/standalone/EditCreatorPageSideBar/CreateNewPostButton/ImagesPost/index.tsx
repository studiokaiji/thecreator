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

export type ImagesPostFormInput = {
  descriptions: string[];
  borderLockAddress: string;
  title: string;
};

export const ImagesPost = () => {
  const { t } = useTranslation();

  const [fileUrls, setFileUrls] = useState<string[]>([]);
  const [urlToFile, setUrlToFile] = useState<{ [url: string]: File }>({});

  const form = useForm<ImagesPostFormInput>({
    mode: 'onChange',
  });

  const onRetriveValidFilesHandler = (files: File[]) => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setFileUrls(urls);
    setUrlToFile(
      urls.reduce<{ [url: string]: File }>((prev, url, i) => {
        prev[url] = files[i];
        return prev;
      }, {})
    );
  };

  const { postData, uploadContents } = useCreatorPostForWrite();

  const [uploadStatus, setUploadStatus] = useState<
    'waitingSelectFiles' | 'uploading' | 'done'
  >('waitingSelectFiles');

  const post = async () => {
    const { borderLockAddress, descriptions, title } = form.getValues();

    const id = await postData({
      borderLockAddress,
      contentsCount: fileUrls.length,
      contentsType: 'images',
      description: JSON.stringify(descriptions),
      title,
    });

    const files = fileUrls.map((url) => urlToFile[url]);

    setUploadStatus('uploading');
    await uploadContents(
      {
        borderLockAddress: '',
        contentsType: 'images',
        id,
      },
      files
    );
    setUploadStatus('done');
  };

  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postImages')}</Typography>
        {fileUrls.length ? (
          <>
            <ImageList fileUrls={fileUrls} onChangeFileUrls={setFileUrls} />
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
