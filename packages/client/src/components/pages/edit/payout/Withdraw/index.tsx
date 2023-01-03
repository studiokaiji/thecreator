import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';

import { WithdrawButton } from './WithdrawButton';

import { Table } from '@/components/helpers/Table';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCreatorPlansBalanceList } from '@/hooks/useCreatorPlansBalanceList';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { tokenAddressToCurrency } from '@/utils/currency-converter';
import { formatWeiUnits } from '@/utils/wei-units-converter';

const getStrBalances = (balance: BigNumber, tokenAddress: string) => {
  const currency = tokenAddressToCurrency(tokenAddress);
  const formatted = formatWeiUnits(balance, currency);
  return `${formatted} ${currency}`;
};

export const Withdraw = () => {
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

  const tableData =
    planWithBalanceList?.map((plan, i) => {
      return [
        plan.name,
        getStrBalances(plan.balance, plan.tokenAddress),
        <Typography
          key={`payout-plan-contract-address-${i}`}
          textOverflow="ellipsis"
          variant="body2"
        >
          {plan.id}
        </Typography>,
        <WithdrawButton
          key={`payout-plan-button-${i}`}
          onWithdrawn={onWithdrawnHandler}
          planWithBalance={planWithBalanceList[i]}
        />,
      ];
    }) || [];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{t('withdraw')}</Typography>
      <Table
        data={tableData}
        headRows={[t('plan'), t('balance'), t('address'), t('withdraw')]}
      />
    </Stack>
  );
};
