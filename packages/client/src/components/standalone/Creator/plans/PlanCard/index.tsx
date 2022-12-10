import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CreatorDocDataPlan } from '#types/firestore/creator';
import { SeeMore } from '@/components/helpers/SeeMore';
import { blockTimestampToDate } from '@/utils/block-timestamp-to-date';

type PlanCardProps = {
  plan: CreatorDocDataPlan;
  editable?: boolean;
  expirationTimestamp?: BigNumber;
  subscribeUrl?: string;
  hiddenButton?: boolean;
};

export const PlanCard = ({
  editable,
  expirationTimestamp,
  hiddenButton,
  plan: { currency, description, features, name, priceEthPerMonth },
  subscribeUrl = '',
}: PlanCardProps) => {
  const { t } = useTranslation();
  return (
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
              {priceEthPerMonth} {currency}
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
              <Stack component="ul" sx={{ my: 0, px: 2.5, textAlign: 'left' }}>
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
                <Button variant="outlined">{t('edit')}</Button>
              ) : expirationTimestamp ? (
                <Stack spacing={1}>
                  <Button variant="contained">{t('extendThePeriod')}</Button>
                  <Button variant="outlined">{t('settings')}</Button>
                  <Typography color="GrayText" variant="subtitle2">
                    {blockTimestampToDate(expirationTimestamp).toLocaleString()}
                  </Typography>
                </Stack>
              ) : (
                <Button component={Link} to={subscribeUrl} variant="contained">
                  {t('subscribe')}
                </Button>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
