import { useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useLocation } from 'react-router-dom';

import { AddPlanActionCard } from './AddPlanActionCard';
import { PlanCard } from './PlanCard';

import { CreatorDocDataPlan } from '#types/firestore/creator';

type PlansProps = {
  editable: boolean;
  plans: { [key: number]: CreatorDocDataPlan };
  onChangePlan: (index: number, plan: CreatorDocDataPlan) => void;
};

const currencyPriorityOrder = ['USDC', 'WETH', 'MATIC'];

const sortPlans = (plans: { [key: number]: CreatorDocDataPlan }) => {
  const planIndexesByCurrencies: { [currency: string]: number[] } = {};

  Object.values(plans).forEach((plan, i) => {
    if (planIndexesByCurrencies[plan.currency]) {
      planIndexesByCurrencies[plan.currency].push(i);
    } else {
      planIndexesByCurrencies[plan.currency] = [i];
    }
  });

  const sortedExistsCurrenciesInPlans = Object.keys(
    planIndexesByCurrencies
  ).sort((first, second) => {
    const firstIndex = currencyPriorityOrder.indexOf(first);
    const secondIndex = currencyPriorityOrder.indexOf(second);

    if (firstIndex === -1 || secondIndex === -1 || firstIndex < secondIndex) {
      return 1;
    }
    if (firstIndex > secondIndex) {
      return -1;
    }
    return 0;
  });

  const sortedIndexes = sortedExistsCurrenciesInPlans
    .map((currency) => {
      const sortedIndexesByCurrencies = planIndexesByCurrencies[currency].sort(
        (firstIndex, secondIndex) => {
          const firstPlan = plans[firstIndex];
          const secondPlan = plans[secondIndex];

          if (firstPlan.priceEthPerMonth < secondPlan.priceEthPerMonth) {
            return 1;
          }
          if (firstPlan.priceEthPerMonth > secondPlan.priceEthPerMonth) {
            return 1;
          }
          return 0;
        }
      );
      return sortedIndexesByCurrencies;
    })
    .flat();

  const sortedPlans = sortedIndexes.map((i) => plans[i]);

  return sortedPlans;
};

export const Plans = ({ editable, onChangePlan, plans }: PlansProps) => {
  const matches: boolean = useMediaQuery('(max-width:899px)');

  const { pathname } = useLocation();

  const sortedPlans = sortPlans(plans);

  const plansLength = Object.keys(plans).length;

  return (
    <Grid
      container
      alignItems="stretch"
      gap={matches ? 2 : 0}
      justifyContent="center"
      spacing={matches ? 0 : 2}
      sx={matches ? { maxWidth: 400, mx: 'auto' } : {}}
    >
      {sortedPlans.map((plan, i) => (
        <Grid key={`plans-${i}`} item lg={4} md={6} xs={12}>
          <PlanCard
            editable={editable}
            plan={plan}
            subscribeUrl={`${pathname}subscribe/${plan.lockAddress}`}
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
