import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Table } from '@/components/helpers/Table';
import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';

export const SupportersPage = () => {
  return (
    <MainSpacingLayout>
      <Stack spacing={5}>
        <Typography variant="h1">Supporters</Typography>
        <Box>
          <Table
            data={[
              [
                '0x0000000000000000000000000000000000000000',
                'Hobby',
                '1000',
                '2000',
              ],
            ]}
            headRows={['User', 'Plan', 'Registration Date', 'Expiration Date']}
          />
        </Box>
      </Stack>
    </MainSpacingLayout>
  );
};
