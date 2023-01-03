import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { SupportersTable } from '@/components/pages/edit/supporters/SupportersTable';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreatorPlans } from '@/hooks/useCreatorPlans';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useOnlyValidNetwork } from '@/hooks/useOnlyValidNetwork';

export const SupportersPage = () => {
  useOnlyValidNetwork();

  const { currentUser } = useCurrentUser();
  const { data: plans } = useCreatorPlans(currentUser?.uid);

  const [planId, setPlanId] = useState(plans?.[0].id);

  useEffect(() => {
    if (plans && !planId) {
      setPlanId(plans[0].id);
    }
  }, [plans]);

  const { t } = useTranslation();

  if (!plans || !planId) {
    return <MainLoading />;
  }

  return (
    <MainSpacingLayout>
      <Box>
        <Typography variant="h1">Supporters</Typography>
        <Box mt={6}>
          <Box mb={3}>
            <Select
              label={t('plan')}
              onChange={(e) => setPlanId(e.target.value)}
              value={planId}
              variant="standard"
            >
              {plans.map((plan) => (
                <MenuItem key={`plan-select-${plan.id}`} value={plan.id}>
                  {plan.name} ({plan.id.slice(0, 12)}...)
                </MenuItem>
              ))}
            </Select>
          </Box>
          <SupportersTable planId={planId} />
        </Box>
      </Box>
    </MainSpacingLayout>
  );
};
