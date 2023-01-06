import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { MenuCard } from '@/components/pages/mypage/MenuCard';
import { useWindowSize } from '@/hooks/useWindowSize';

export const MyPage = () => {
  const { t } = useTranslation();
  const { width } = useWindowSize();
  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('mypage')}</Typography>
        <Stack alignItems="flex-start" direction="row" gap={3}>
          {width > 768 && <MenuCard />}
          <Card sx={{ width: '100%' }}>
            <Outlet />
          </Card>
        </Stack>
      </Stack>
    </MainSpacingLayout>
  );
};
