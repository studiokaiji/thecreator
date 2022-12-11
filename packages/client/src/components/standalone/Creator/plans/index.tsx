import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useLocation } from 'react-router-dom';

import { AddPlanActionCard } from './AddPlanActionCard';
import { PlanCard } from './PlanCard';

import { CreatorDocDataPlan } from '#types/firestore/creator';
import { Plan } from '@/hooks/usePlans';

type PlansProps = {
  editable: boolean;
  plans: Plan[];
  onChangePlan: (index: number, plan: CreatorDocDataPlan) => void;
};

export const Plans = ({ editable, onChangePlan, plans }: PlansProps) => {
  const matches: boolean = useMediaQuery('(max-width:899px)');

  const { pathname } = useLocation();

  const path = pathname.match('/.*/$')
    ? pathname.replace(/\/+$/, '')
    : pathname;

  const plansLength = plans.length;

  return (
    <Grid
      container
      alignItems="stretch"
      gap={matches ? 2 : 0}
      justifyContent="center"
      spacing={matches ? 0 : 2}
      sx={matches ? { maxWidth: 400, mx: 'auto' } : {}}
    >
      {plans.map((plan, i) => (
        <Grid key={`plans-${i}`} item lg={4} md={6} xs={12}>
          <PlanCard
            editable={editable}
            plan={plan}
            subscribeUrl={`${path}/subscribe/${plan.lockAddress}`}
          />
        </Grid>
      ))}
      {editable && (
        <Grid item lg={4} md={6} xs={12}>
          <AddPlanActionCard
            currentLengthOfPlans={plansLength}
            minHeight={400}
            onAdded={(plan) => onChangePlan(plansLength, plan)}
          />
        </Grid>
      )}
    </Grid>
  );
};
