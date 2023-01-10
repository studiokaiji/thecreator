import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { Table } from '@/components/helpers/Table';

export const Notifications = () => {
  const { t } = useTranslation();

  const notifications = [];

  const rows = [t('creator')];

  return (
    <Stack px={3} spacing={3}>
      <Typography pb={2} pt={3} variant="h4">
        {t('notifications')}
      </Typography>
      <Table />
    </Stack>
  );
};
