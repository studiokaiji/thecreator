import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';

export const SettingsPage = () => {
  const { t } = useTranslation();

  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('settings')}</Typography>
        <Card sx={{ maxWidth: 600, padding: 3.5 }}>
          <Stack spacing={6}>
            <Stack spacing={2}>
              <Typography variant="h5">{t('page')}</Typography>
              <Stack spacing={1}>
                <Stack alignItems="center" direction="row" gap={1.5}>
                  <Typography>{t('nsfwAccount')}</Typography>
                  <Button variant="contained">{t('enable')}</Button>
                </Stack>
                <Typography color="red" variant="caption">
                  {t('nsfwAccountSettingsCaution')}
                </Typography>
              </Stack>
              <FormControlLabel
                control={<Switch />}
                label={t('publishPage')}
                labelPlacement="start"
                sx={{ justifyContent: 'left' }}
              />
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </MainSpacingLayout>
  );
};
