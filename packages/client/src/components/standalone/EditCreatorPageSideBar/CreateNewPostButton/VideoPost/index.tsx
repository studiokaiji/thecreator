import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { DescriptionTextField } from '../common/DescriptionTextField';
import { PlansSelect } from '../common/PlansSelect';
import { TitleTextField } from '../common/TitleTextField';

import { Iframe } from '@/components/helpers/Iframe';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import { useVideoIframeParam } from '@/hooks/useVideoIframeParam';

type VideoPostFormInput = {
  customUrl: string;
  description?: string;
} & PostFormInput;

type VideoPostProps = {
  onDone: () => void;
};

export const VideoPost = ({ onDone }: VideoPostProps) => {
  const form = useForm<VideoPostFormInput>({
    mode: 'onChange',
  });

  const { t } = useTranslation();

  const customUrl = form.watch('customUrl');
  const iframeParam = useVideoIframeParam({ height: 300, src: customUrl });

  const { postOnlyDocument } = useCreatorPostForWrite();

  const [isUploading, setIsUploading] = useState(false);

  const post = async () => {
    if (!form.formState.isValid) {
      return;
    }

    const value = form.getValues();

    setIsUploading(true);
    await postOnlyDocument({ ...value, contentsType: 'video' });
    setIsUploading(false);

    onDone();
  };

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postVideo')}</Typography>
        {iframeParam ? (
          <>
            <Iframe {...iframeParam} />
            <TitleTextField />
            <DescriptionTextField />
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
        ) : (
          <TextField
            helperText={t('onlyYouTubeOrVimeoVideoUrlHelperText')}
            label={t('videoUrl')}
            type="url"
            variant="standard"
            {...form.register('customUrl')}
          />
        )}
      </Stack>
    </FormProvider>
  );
};
