import { CircularProgress, useMediaQuery } from '@mui/material';
import Grid from '@mui/material/Grid';
import { constants } from 'ethers';
import { Suspense, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { AddPlanActionCard } from './AddPlanActionCard';
import { PlanCard } from './PlanCard';
import { PlanForm, PlanFormValues } from './PlanForm';

import { CenterModal } from '@/components/helpers/CenterModal';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { Plan } from '@/utils/get-plans-from-chain';
import { formatWeiUnits } from '@/utils/wei-units-converter';

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
    isAdd: boolean,
    plan: Omit<Plan<true>, 'lockAddress'>
  ) => {
    mutate([...(data || []), { ...plan, lockAddress: '' }]);
  };

  const [editingPlanIndex, setEditingPlanIndex] = useState(-1);

  const { t } = useTranslation();

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

  const defaultValues = useMemo(() => {
    const plan = data?.[editingPlanIndex];
    if (!plan) return {};

    const features = plan.features.map((feature) => ({
      feature,
    }));

    const values: Partial<PlanFormValues> = {
      ...plan,
      features,
      maxNumberOfMembers: plan.maxNumberOfKeys.gte(constants.MaxUint256)
        ? undefined
        : plan.maxNumberOfKeys,
      priceEthPerMonth: Number(formatWeiUnits(plan.keyPrice, plan.currency)),
    };

    return values;
  }, [editingPlanIndex]);

  return (
    <Suspense fallback={<CircularProgress />}>
      {editingPlanIndex > -1 && (
        <CenterModal
          onClose={() => setEditingPlanIndex(-1)}
          open={editingPlanIndex > -1}
        >
          <PlanForm
            buttonChild={t('save')}
            defaultValues={defaultValues}
            onClose={() => setEditingPlanIndex(-1)}
            onDone={(plan) => onChangePlan(false, plan)}
            title={t('editPlan')}
          />
        </CenterModal>
      )}
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
                onClickEditButton={() => setEditingPlanIndex(i)}
                plan={plan}
                subscribeUrl={`${path}/subscribe/${plan.id}`}
              />
            </Grid>
          ))}
        {editable && (
          <Grid item lg={4} md={6} xs={12}>
            <AddPlanActionCard
              minHeight={400}
              onAdded={(plan) => onChangePlan(true, plan)}
            />
          </Grid>
        )}
      </Grid>
    </Suspense>
  );
};
