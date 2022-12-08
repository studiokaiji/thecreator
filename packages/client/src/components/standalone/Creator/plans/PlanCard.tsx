import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { CreatorDocDataPlan } from '#types/firestore/creator';
import { SeeMore } from '@/components/helpers/SeeMore';

type PlanCardProps = {
  plan: CreatorDocDataPlan;
  editable?: boolean;
  isSubscribed?: boolean;
};

export const PlanCard = ({ editable, isSubscribed, plan }: PlanCardProps) => {
  const { currency, description, features, name, priceEthPerMonth } = plan;
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

          {editable ? (
            <Button variant="outlined">{t('edit')}</Button>
          ) : isSubscribed ? (
            <Button variant="contained">{t('subscribed')}</Button>
          ) : (
            <Button variant="contained">{t('subscribe')}</Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
