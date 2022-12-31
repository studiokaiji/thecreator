import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';

import { WithdrawButton } from './WithdrawButton';

import { Table } from '@/components/helpers/Table';
import { PlanWithBalance } from '@/hooks/useCreatorPlansBalanceList';
import { tokenAddressToCurrency } from '@/utils/currency-converter';
import { formatWeiUnits } from '@/utils/wei-units-converter';

const getStrBalances = (balance: BigNumber, tokenAddress: string) => {
  const currency = tokenAddressToCurrency(tokenAddress);
  const formatted = formatWeiUnits(balance, currency);
  return `${formatted} ${currency}`;
};

type WithdrawTableProps = {
  planWithBalanceList?: PlanWithBalance[];
  onWithdrawn: (id: string, currentBalance: BigNumber) => void;
};

export const Withdraw = ({
  onWithdrawn,
  planWithBalanceList,
}: WithdrawTableProps) => {
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
          onWithdrawn={onWithdrawn}
          planWithBalance={planWithBalanceList[i]}
        />,
      ];
    }) || [];

  const { t } = useTranslation();

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
