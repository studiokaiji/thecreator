import type { Product } from '@contracts';
import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useState } from 'react';

import { AddPlanActionCard } from './AddPlanActionCard';
import { PlanCard } from './PlanCard';

type PlansProps = {
  contractAddress: string;
  editable: boolean;
};

export const Plans = ({ contractAddress, editable }: PlansProps) => {
  const [plans, setPlans] = useState<Product.PlanStructOutput[]>([]);

  const matches: boolean = useMediaQuery('(max-width:899px)');

  return (
    <Grid
      container
      alignItems="stretch"
      gap={matches ? 2 : 0}
      justifyContent="space-between"
      spacing={matches ? 0 : 2}
      sx={matches ? { maxWidth: 400, mx: 'auto' } : {}}
    >
      <Grid item lg={4} md={6} sx={{ minHeight: 400 }} xs={12}>
        <PlanCard></PlanCard>
      </Grid>
      <Grid item lg={4} md={6} sx={{ minHeight: 400 }} xs={12}>
        <PlanCard></PlanCard>
      </Grid>
      {editable && (
        <Grid item lg={4} md={6} sx={{ minHeight: 400 }} xs={12}>
          <AddPlanActionCard
            currentLengthOfPlans={plans.length}
            minHeight={400}
          />
        </Grid>
      )}
    </Grid>
  );
};
