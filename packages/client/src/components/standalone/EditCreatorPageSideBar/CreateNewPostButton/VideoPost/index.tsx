import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Iframe } from '@/components/helpers/Iframe';
import { useCreatorPostForWrite } from '@/hooks/useCreatorPostForWrite';
import { useVideoIframeParam } from '@/hooks/useVideoIframeParam';

type VideoPostFormInput = {
  customUrl: string;
  description: string;
} & PostFormInput;

type VideoPostProps = {
  onDone: () => void;
};

export const VideoPost = ({ onDone }: VideoPostProps) => {
  const form = useForm<VideoPostFormInput>();

  const { t } = useTranslation();

  const customUrl = form.watch('customUrl');
  const iframeParam = useVideoIframeParam({ height: 300, src: customUrl });

  const { postDocument } = useCreatorPostForWrite();

  const post = async () => {
    if (!form.formState.isValid) {
      return;
    }

    const value = form.getValues();
    await postDocument({ ...value, contentsType: 'video' });

    onDone();
  };

  return (
    <FormProvider {...form}>
      <Stack spacing={3}>
        <Typography variant="h5">{t('postVideo')}</Typography>
        {iframeParam ? (
          <>
            <Iframe {...iframeParam} />
            <Button onClick={post} variant="contained">
              {t('post')}
            </Button>
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
