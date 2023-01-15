import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { ImageList } from './ImageList';

import { FileUploader } from '@/components/standalone/FileUploader';

export type ImagesPostFormInput = {
  descriptions: string[];
};

export const ImagesPost = () => {
  const { t } = useTranslation();

  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const form = useForm<ImagesPostFormInput>({
    mode: 'onChange',
  });

  const onRetriveValidFilesHandler = (files: File[]) => {
    setFileUrls(files.map((file) => URL.createObjectURL(file)));
  };

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postImages')}</Typography>
        {fileUrls.length ? (
          <>
            <ImageList fileUrls={fileUrls} onChangeFileUrls={setFileUrls} />
            <TextField />
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
