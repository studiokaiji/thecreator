import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber, constants } from 'ethers';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { PlanForm } from '../PlanForm';

import { CenterModal } from '@/components/helpers/CenterModal';
import { SeeMore } from '@/components/helpers/SeeMore';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';
import { tokenAddressToCurrency } from '@/utils/currency-converter';
import { Plan } from '@/utils/get-plans-from-chain';
import { formatWeiUnits } from '@/utils/wei-units-converter';

type PlanCardProps = {
  plan: Plan;
  editable?: boolean;
  expirationTimestamp?: BigNumber;
  subscribeUrl?: string;
  hiddenButton?: boolean;
  onChangePlan?: (plan: Plan) => void;
};

export const PlanCard = ({
  editable,
  expirationTimestamp,
  hiddenButton,
  onChangePlan,
  plan,
  subscribeUrl = '',
}: PlanCardProps) => {
  const { t } = useTranslation();

  const {
    description,
    features,
    keyPrice,
    maxNumberOfKeys,
    name,
    tokenAddress,
  } = plan;

  const currency = tokenAddressToCurrency(tokenAddress);

  const priceEth = formatWeiUnits(keyPrice, currency);

  const defaultValues = useMemo(() => {
    const values = {
      ...plan,
      features: features.map((feature) => ({
        feature,
      })),
      maxNumberOfMembers: maxNumberOfKeys.gte(constants.MaxUint256)
        ? undefined
        : maxNumberOfKeys,
      priceEthPerMonth: Number(priceEth),
    };
    return values;
  }, [plan]);

  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  const onChangePlanHandler = (plan: Plan) => {
    onChangePlan && onChangePlan(plan);
  };

  return (
    <>
      {isOpenEditModal && (
        <CenterModal
          onClose={() => setIsOpenEditModal(false)}
          open={isOpenEditModal}
        >
          <PlanForm
            update
            buttonChild={t('save')}
            defaultValues={defaultValues}
            onClose={() => setIsOpenEditModal(false)}
            onDone={onChangePlanHandler}
            publicLockAddress={plan.lockAddress}
            title={t('editPlan')}
          />
        </CenterModal>
      )}
      <Card sx={{ height: '100%', p: 1.5, width: '100%' }}>
        <CardContent sx={{ height: '100%' }}>
          <Stack
            spacing={3}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              justifyContent: 'space-between',
              textAlign: 'center',
            }}
          >
            <Stack spacing={3}>
              <Stack>
                <Typography
                  gutterBottom
                  fontWeight={500}
                  lineHeight={1}
                  variant="h5"
                >
                  {name}
                </Typography>
                <Typography
                  color="GrayText"
                  fontWeight={500}
                  lineHeight={1}
                  sx={{ visibility: description ? 'unset' : 'hidden' }}
                  variant="body2"
                >
                  {description || 'dummy'}
                </Typography>
              </Stack>
              <Typography gutterBottom variant="h6">
                {priceEth} {currency}
                <Typography
                  color="GrayText"
                  fontWeight={500}
                  sx={{ display: 'inline' }}
                >
                  {' '}
                  / {t('month')}
                </Typography>
              </Typography>
            </Stack>

            <SeeMore heightOnMinimized={240}>
              {features.length ? (
                <Stack
                  component="ul"
                  sx={{ my: 0, px: 2.5, textAlign: 'left' }}
                >
                  {features.map((feature, i) => (
                    <li key={`feature-${i}`}>{feature}</li>
                  ))}
                </Stack>
              ) : (
                <div />
              )}
            </SeeMore>

            {!hiddenButton && (
              <>
                {editable ? (
                  <Button
                    onClick={() => setIsOpenEditModal(true)}
                    variant="outlined"
                  >
                    {t('edit')}
                  </Button>
                ) : expirationTimestamp ? (
                  <Stack spacing={1}>
                    <Button variant="contained">{t('extendThePeriod')}</Button>
                    <Button variant="outlined">{t('settings')}</Button>
                    <Typography color="GrayText" variant="subtitle2">
                      {blockTimestampToDate(
                        expirationTimestamp
                      ).toLocaleString()}
                    </Typography>
                  </Stack>
                ) : (
                  <Button
                    component={Link}
                    to={subscribeUrl}
                    variant="contained"
                  >
                    {t('subscribe')}
                  </Button>
                )}
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};
