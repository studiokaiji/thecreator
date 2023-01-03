import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { Withdraw } from '@/components/pages/edit/payout/Withdraw';

export const PayoutPage = () => {
  const { t } = useTranslation();
  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('payout')}</Typography>
        <Withdraw />
      </Stack>
    </MainSpacingLayout>
  );
};
