import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CreateNewPostPlansSelect } from '../common/CreateNewPostPlansSelect';
import { DescriptionTextField } from '../common/DescriptionTextField';
import { ThumbnailSelector } from '../common/ThumbnailSelector';
import { TitleTextField } from '../common/TitleTextField';

import { FileUploader } from '@/components/standalone/FileUploader';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import type { UseImageData } from '@/hooks/useImage';

type AudioPostProps = {
  onDone: () => void;
};

type AudioPostFormInput = PostFormInput & { description?: string };

export const AudioPost = ({ onDone }: AudioPostProps) => {
  const { t } = useTranslation();

  const [audioFile, setAudioFile] = useState<File>();
  const onRetriveValidFilesHandler = (files: File[]) => {
    setAudioFile(files[0]);
  };

  const [thumbnail, setThumbnail] = useState<UseImageData>();

  const form = useForm<AudioPostFormInput>({
    mode: 'onChange',
  });

  const { postContents } = useCreatorPostForWrite();

  const [isUploading, setIsUploading] = useState(false);

  const post = async () => {
    if (!audioFile || !form.formState.isValid) return;

    setIsUploading(true);

    await postContents(
      {
        contentsType: 'audio',
        ...form.getValues(),
      },
      audioFile,
      thumbnail
    );

    setIsUploading(false);

    onDone();
  };

  useBeforeUnload(isUploading);

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postAudio')}</Typography>
        {audioFile ? (
          <Stack spacing={3}>
            <ThumbnailSelector onDone={setThumbnail} />
            <TitleTextField />
            <DescriptionTextField />
            <CreateNewPostPlansSelect />
            <LoadingButton
              disabled={!form.formState.isValid}
              loading={isUploading}
              onClick={post}
              variant="contained"
            >
              {t('post')}
            </LoadingButton>
          </Stack>
        ) : (
          <FileUploader
            onRetriveValidFiles={onRetriveValidFilesHandler}
            type="audio"
          />
        )}
      </Stack>
    </FormProvider>
  );
};
