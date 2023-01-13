import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FileUploader } from '@/components/standalone/FileUploader';

export const AudioPost = () => {
  const { t } = useTranslation();

  const [audioFile, setAudioFile] = useState<File>();
  const onRetriveValidFilesHandler = (files: File[]) => {
    setAudioFile(files[0]);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('postAudio')}</Typography>
      {audioFile ? (
        <>
          {audioFile.name} {audioFile.size}
        </>
      ) : (
        <FileUploader
          onRetriveValidFiles={onRetriveValidFilesHandler}
          type="audio"
        />
      )}
    </Stack>
  );
};
