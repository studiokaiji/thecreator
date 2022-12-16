import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { ChangeEvent, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Table } from '@/components/helpers/Table';
import { PlanWithBalance } from '@/hooks/usePayout';
import { tokenAddressToCurrency } from '@/utils/currency-converter';
import { formatWeiUnits } from '@/utils/wei-units-converter';

const getStrBalances = (balance: BigNumber, tokenAddress: string) => {
  const currency = tokenAddressToCurrency(tokenAddress);
  const formatted = formatWeiUnits(balance, currency);
  return `${formatted} ${currency}`;
};

type WithdrawTableProps = {
  plans?: PlanWithBalance[];
};

export const Withdraw = ({ plans }: WithdrawTableProps) => {
  const [tableData, setTableData] = useState<ReactNode[][]>();
  const [checkedCells, setCheckedCells] = useState<boolean[]>([]);

  useEffect(() => {
    if (!plans || plans.length < 1) return;

    if (!checkedCells.length) {
      setCheckedCells(plans.map(() => false));
    }

    setTableData(
      plans.map((plan, i) => {
        return [
          <Checkbox
            key={`payout-plan-checkbox-${i}`}
            checked={checkedCells[i]}
            onChange={(e) => check(e, i)}
          />,
          plan.name,
          getStrBalances(plan.balance, plan.tokenAddress),
          <Typography
            key={`payout-plan-contract-address-${i}`}
            textOverflow="ellipsis"
            variant="body2"
          >
            {plan.lockAddress}
          </Typography>,
          <IconButton key={`payout-plan-button-${i}`}>
            <PaymentsOutlinedIcon />
          </IconButton>,
        ];
      })
    );
  }, []);

  const { t } = useTranslation();

  const checkAll = (e: ChangeEvent<HTMLInputElement>) => {
    if (!tableData) return;
    setCheckedCells(tableData.map(() => e.target.checked));
  };

  const check = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const current = [...checkedCells];
    current[index] = e.target.checked;
    setCheckedCells(current);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">{t('withdraw')}</Typography>
      <Stack
        alignItems="center"
        direction="row"
        gap={3}
        justifyContent="space-between"
      >
        <Typography>
          Selected {checkedCells.filter((b) => b).length} Plans
        </Typography>
        <Button
          startIcon={<PaymentsOutlinedIcon />}
          sx={{
            visibility: checkedCells.filter((b) => b).length
              ? 'visible'
              : 'hidden',
          }}
          variant="contained"
        >
          Withdraw
        </Button>
      </Stack>
      <Table
        data={(tableData || []).map((d, i) => {
          d[0] = (
            <Checkbox
              key={`payout-plan-checkbox-${i}`}
              checked={checkedCells[i]}
              onChange={(e) => check(e, i)}
            />
          );
          return d;
        })}
        headRows={[
          <Checkbox
            key="all-payout-plan-checkbox"
            checked={checkedCells.every((c) => c)}
            onChange={checkAll}
          />,
          t('plan'),
          t('balance'),
          t('address'),
          t('withdraw'),
        ]}
      />
    </Stack>
  );
};
