import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { SupportersTable } from '@/components/pages/edit/supporters/SupportersTable';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';

export const SupportersPage = () => {
  useOnlyValidNetwork();

  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">Supporters</Typography>
        <SupportersTable />
      </Stack>
    </MainSpacingLayout>
  );
};
