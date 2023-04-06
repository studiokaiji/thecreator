import { CircularProgress, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Suspense } from 'react';
import { useLocation } from 'react-router-dom';

import { AddPlanActionCard } from './AddPlanActionCard';
import { PlanCard } from './PlanCard';

import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { Plan } from '@/utils/get-plans-from-chain';

type PlansProps = {
  editable: boolean;
  creatorId: string;
  onError?: () => void;
};

export const Plans = ({ creatorId, editable, onError }: PlansProps) => {
  const matches: boolean = useMediaQuery('(max-width:899px)');

  const { pathname } = useLocation();

  const path = pathname.match('/.*/$')
    ? pathname.replace(/\/+$/, '')
    : pathname;

  const { data, error, mutate } = useCreatorPlans(creatorId);

  const onChangePlan = (
    plan: Omit<Plan, 'lockAddress'>,
    index?: number
  ) => {
    const currentPlans = [...(data || [])];
    const convertedPlan = { ...plan, lockAddress: '' };
    if (typeof index === 'number') {
      currentPlans[index] = convertedPlan;
    } else {
      currentPlans.push(convertedPlan);
    }
    mutate(currentPlans);
  };

  if (!data && error) {
    onError && onError();
    console.log(error);
    return (
      <div>
        <p>Fetch Error</p>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <Suspense fallback={<CircularProgress />}>
      <Grid
        container
        alignItems="stretch"
        gap={matches ? 2 : 0}
        justifyContent="center"
        spacing={matches ? 0 : 2}
        sx={matches ? { maxWidth: 400, mx: 'auto' } : {}}
      >
        {data &&
          data.map((plan, i) => (
            <Grid key={`plans-${i}`} item lg={4} md={6} xs={12}>
              <PlanCard
                editable={editable}
                onChangePlan={(plan) => onChangePlan(plan, i)}
                plan={plan}
                subscribeUrl={`${path}/subscribe/${plan.id}`}
              />
            </Grid>
          ))}
        {editable && (
          <Grid item lg={4} md={6} xs={12}>
            <AddPlanActionCard
              minHeight={400}
              onAdded={(plan) => onChangePlan(plan)}
            />
          </Grid>
        )}
      </Grid>
    </Suspense>
  );
};
