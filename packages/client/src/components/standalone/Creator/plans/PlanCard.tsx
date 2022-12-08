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
        <Stack>
          <Typography gutterBottom variant="h5">
            {name}
          </Typography>
          <Typography color="GrayText" variant="body2">
            {description}
          </Typography>
        </Stack>
        <Stack component="ul" sx={{ px: 2.5, py: 1.5, textAlign: 'left' }}>
          {features.map((feature, i) => (
            <li key={`feature-${i}`}>{feature}</li>
          ))}
        </Stack>
        <Stack spacing={1.5}>
          <Typography gutterBottom variant="h6">
            {priceEthPerMonth} {currency}
            <Typography color="GrayText" sx={{ display: 'inline' }}>
              {' '}
              / {t('month')}
            </Typography>
          </Typography>
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
