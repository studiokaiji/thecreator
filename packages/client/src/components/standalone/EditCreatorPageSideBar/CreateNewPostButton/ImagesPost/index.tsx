import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { FileUploader } from '@/components/standalone/FileUploader';

export const ImagesPost = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('postImages')}</Typography>
      <FileUploader type="images" />
    </Stack>
  );
};
