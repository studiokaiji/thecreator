import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { Withdraw } from '@/components/pages/edit/payout/Withdraw';
import { MainLoading } from '@/components/standalone/MainLoading';
import { usePayout } from '@/hooks/usePayout';

export const PayoutPage = () => {
  const { data: plans, error } = usePayout();

  const { t } = useTranslation();

  if (!plans && !error) {
    return <MainLoading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('payout')}</Typography>
        <Withdraw plans={plans} />
        <Typography variant="h4">{t('recentPayments')}</Typography>
      </Stack>
    </MainSpacingLayout>
  );
};
