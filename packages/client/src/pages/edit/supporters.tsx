import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Table } from '@/components/helpers/Table';
import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';

export const SupportersPage = () => {
  return (
    <MainSpacingLayout>
      <Stack spacing={6}>
        <Typography variant="h1">Supporters</Typography>
        <Stack spacing={2}>
          <Typography variant="h3">All</Typography>
          <Grid container gap={2} sx={{ width: '70%' }}>
            <Grid item lg={5}>
              <StatusCard label="Active Supporters" value={42} />
            </Grid>
            <Grid item lg={5}>
              <StatusCard label="Registered supporters" value={15} />
            </Grid>
            <Grid item lg={5}>
              <StatusCard
                label="XX plan active supporters / 30 days"
                value={9}
              />
            </Grid>
            <Grid item lg={5}>
              <StatusCard
                label="XX plan registered supporters / 30 days"
                value={4}
              />
            </Grid>
          </Grid>
        </Stack>
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

type StatusCardProps = {
  label: string;
  value: string | number;
};

const StatusCard = ({ label, value }: StatusCardProps) => (
  <Card>
    <CardContent>
      <Stack spacing={0.5}>
        <Typography variant="h4">{value}</Typography>
        <Typography fontWeight={500} variant="body2">
          {label}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);
