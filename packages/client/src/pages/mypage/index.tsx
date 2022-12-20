import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { MainCard } from '@/components/pages/mypage/MainCard';
import { MenuCard } from '@/components/pages/mypage/MenuCard';

export const MyPage = () => {
  const { t } = useTranslation();
  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('mypage')}</Typography>
        <Stack direction="row" gap={3}>
          <MenuCard />
          <MainCard />
        </Stack>
      </Stack>
    </MainSpacingLayout>
  );
};
