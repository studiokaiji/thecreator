import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { CreatorPageSettingsCard } from '@/components/pages/edit/settings/page/CreatorPageSettingsCard';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreatorSettings } from '@/hooks/useCreatorSettings';

export const SettingsPage = () => {
  const { t } = useTranslation();

  const { data, error, updateSettings } = useCreatorSettings();

  if (error) {
    console.error(error);
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  if (!data) {
    return <MainLoading />;
  }

  return (
    <Suspense fallback={<MainLoading />}>
      <MainSpacingLayout>
        <Stack spacing={6} sx={{ maxWidth: 600 }}>
          <Typography variant="h1">{t('settings')}</Typography>
          <CreatorPageSettingsCard onChange={updateSettings} values={data} />
        </Stack>
      </MainSpacingLayout>
    </Suspense>
  );
};
