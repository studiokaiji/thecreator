import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { PlansSelect } from '@/components/PlansSelect';
import { MainSpacingLayout } from '@/components/layout/MainSpacingLayout';
import { SupportersTable } from '@/components/pages/edit/supporters/SupportersTable';
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
  return (
    <MainSpacingLayout>
      <Box>
        <Typography variant="h1">Supporters</Typography>
        <Box mt={6}>
          <Box mb={3}>
            <PlansSelect
              onChange={(e) => setPlanId(e.target.value)}
              sx={{ maxWidth: '220px' }}
            />
          </Box>
          <SupportersTable planId={planId} />
        </Box>
      </Box>
    </MainSpacingLayout>
  );
};
