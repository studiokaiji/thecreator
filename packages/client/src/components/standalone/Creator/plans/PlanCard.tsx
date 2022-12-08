import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { CreatorDocDataPlan } from '#types/firestore/creator';

type PlanCardProps = {
  plan: CreatorDocDataPlan;
  editable?: boolean;
};

export const PlanCard = ({ editable, plan }: PlanCardProps) => {
  const { currency, description, features, name, priceEthPerMonth } = plan;
  const { t } = useTranslation();
  return (
    <Card sx={{ height: '100%', p: 1.5, width: '100%' }}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          textAlign: 'center',
        }}
      >
        <Stack spacing={2.5}>
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
              variant="body2"
            >
              {description}
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

          <Stack component="ul" sx={{ px: 2.5, textAlign: 'left' }}>
            {features.map((feature, i) => (
              <li key={`feature-${i}`}>{feature}</li>
            ))}
          </Stack>

          {editable ? (
            <Button variant="outlined">{t('edit')}</Button>
          ) : (
            <Button variant="contained">{t('subscribe')}</Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};
