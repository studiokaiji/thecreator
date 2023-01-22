import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PlansSelect } from '../common/PlansSelect';
import { ThumbnailSelector } from '../common/ThumbnailSelector';
import { TitleTextField } from '../common/TitleTextField';

import { FileUploader } from '@/components/standalone/FileUploader';
import type { UseImageData } from '@/hooks/useImage';
import { useUploadPostContents } from '@/hooks/useUploadPostContents';

type AudioPostProps = {
  onDone: () => void;
};

type AudioPostFormInput = PostFormInput & { description: string };

export const AudioPost = ({ onDone }: AudioPostProps) => {
  const { t } = useTranslation();

  const [audioFile, setAudioFile] = useState<File>();
  const onRetriveValidFilesHandler = (files: File[]) => {
    setAudioFile(files[0]);
  };

  const [thumbnail, setThumbnail] = useState<UseImageData>();

  const form = useForm<AudioPostFormInput>();

  const { upload } = useUploadPostContents();

  const post = async () => {
    if (!audioFile) return;

    const promises = [];

    if (thumbnail) {
      promises.push(
        upload({
          contents: thumbnail,
          contentsType: 'thumbnail',
        })
      );
    }

    promises.push(
      upload({
        contents: audioFile,
        contentsType: 'audio',
      })
    );

    await Promise.all(promises);

    onDone();
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('postAudio')}</Typography>
      {audioFile ? (
        <FormProvider {...form}>
          <Stack spacing={3}>
            <ThumbnailSelector onDone={setThumbnail} />
            <TitleTextField />
            <TextField
              label="description"
              {...form.register('description', {
                maxLength: {
                  message: t('validationErrors.maxLength', {
                    maxLength: '1000',
                  }),
                  value: 1000,
                },
              })}
            />
            <PlansSelect formKeyName="" />
            <Button onClick={post} variant="contained">
              {t('post')}
            </Button>
          </Stack>
        </FormProvider>
      ) : (
        <FileUploader
          onRetriveValidFiles={onRetriveValidFilesHandler}
          type="audio"
        />
      )}
    </Stack>
  );
};
