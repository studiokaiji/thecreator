import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
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
  const {
    data: balances,
    error,
    mutate: balancesMutate,
  } = useCreatorPlansBalanceList(plans);

  const planWithBalanceList = (() => {
    if (!plans || !balances) return undefined;
    return plans.map((plan, i) => ({ ...plan, balance: balances[i] }));
  })();

  const { t } = useTranslation();

  if (error) {
    return <pre>{error}</pre>;
  }

  if (!planWithBalanceList) {
    return <MainLoading />;
  }

  const onWithdrawnHandler = (id: string, balance: BigNumber) => {
    if (!balances || !plans) return;

    const index = plans.findIndex((plan) => plan.id === id);
    if (index === -1) return;

    const currentBalances = [...balances];
    currentBalances[index] = balance;

    balancesMutate(currentBalances);
  };

  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">{t('payout')}</Typography>
        <Withdraw
          onWithdrawn={onWithdrawnHandler}
          planWithBalanceList={planWithBalanceList}
        />
      </Stack>
    </MainSpacingLayout>
  );
};
