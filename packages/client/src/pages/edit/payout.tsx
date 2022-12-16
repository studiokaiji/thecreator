import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { Withdraw } from '@/components/pages/edit/payout/Withdraw';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCreatorPlansBalanceList } from '@/hooks/useCreatorPlansBalanceList';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const PayoutPage = () => {
  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);
  const { data: balances, error } = useCreatorPlansBalanceList(plans);

  const planWithBalanceList = useMemo(() => {
    if (!plans || !balances) return undefined;
    return plans.map((plan, i) => ({ ...plan, balance: balances[i] }));
  }, [plans, balances, error]);

  const { t } = useTranslation();

  if (!planWithBalanceList && !error) {
    return <MainLoading />;
  }

  if (error) {
    return <pre>{error}</pre>;
  }

  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('payout')}</Typography>
        <Withdraw planWithBalanceList={planWithBalanceList} />
        <Typography variant="h4">{t('recentPayments')}</Typography>
      </Stack>
    </MainSpacingLayout>
  );
};
