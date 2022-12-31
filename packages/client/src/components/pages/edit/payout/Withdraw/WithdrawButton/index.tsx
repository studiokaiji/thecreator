import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { BigNumber } from 'ethers';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SpecityWithdrawalAmount } from './SpecityWithdrawalAmount';

import { CenterModalWithStatus } from '@/components/helpers/CenterModalWithStatus';
import { LoaderWithMessage } from '@/components/standalone/LoaderWithMessage';
import { PlanWithBalance } from '@/hooks/useCreatorPlansBalanceList';
import { usePublicLock } from '@/hooks/usePublicLock';
import { tokenAddressToCurrency } from '@/utils/currency-converter';
import { formatWeiUnits, parseWeiUnits } from '@/utils/wei-units-converter';

type WithdrawProps = {
  planWithBalance: PlanWithBalance;
  onWithdrawn: (id: string, currentBalance: BigNumber) => void;
};

export const WithdrawButton = ({
  onWithdrawn,
  planWithBalance,
}: WithdrawProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const { t } = useTranslation();

  const currency = tokenAddressToCurrency(planWithBalance.tokenAddress);
  const ethBalance = formatWeiUnits(planWithBalance.balance, currency);

  const { withdraw } = usePublicLock(planWithBalance.id);

  const [error, setError] = useState<unknown>();

  const onClickNextButtonHandler = async (specifiedEthBalance: number) => {
    try {
      setActiveStep(1);
      const weiBalance = parseWeiUnits(String(specifiedEthBalance), currency);
      await withdraw({
        onTxSend: () => {
          setActiveStep(2);
        },
        value: {
          tokenAddress: planWithBalance.tokenAddress,
          value: weiBalance,
        },
      });

      setActiveStep(3);

      const currentBalance = planWithBalance.balance.sub(weiBalance);
      onWithdrawn(planWithBalance.id, currentBalance);
    } catch (e) {
      setError(e);
    }
  };

  return (
    <Box>
      <IconButton onClick={() => setIsOpen(true)}>
        <PaymentsOutlinedIcon />
      </IconButton>
      <CenterModalWithStatus
        activeStep={activeStep}
        components={[
          {
            closable: true,
            component: (
              <SpecityWithdrawalAmount
                currency={currency}
                ethBalance={ethBalance}
                onClickNextButton={onClickNextButtonHandler}
                planName={planWithBalance.name}
              />
            ),
            stepLabel: t('specifyWithdrawalAmount'),
          },
          {
            closable: true,
            component: <LoaderWithMessage message={t('waitingSendTx')} />,
            stepLabel: t('sendingTx'),
          },
          {
            closable: true,
            component: <LoaderWithMessage message={t('waitingConfirmation')} />,
            stepLabel: t('waitingConfirmation'),
          },
        ]}
        err={error}
        onClose={() => setIsOpen(false)}
        open={isOpen}
        title={`Withdraw`}
      />
    </Box>
  );
};
