import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect } from 'react';

import { MainLoading } from '../MainLoading';

import { ActionButtons } from './ActionButtons';
import { ProfileImages } from './ProfileImages';
import { Sections } from './Sections';
import { Plans } from './plans';
import { Posts } from './posts';

import { CreatorDocDataPlan } from '#types/firestore/creator';
import { useCreator } from '@/hooks/useCreator';
import { usePlans } from '@/hooks/usePlans';
import { useWindowSize } from '@/hooks/useWindowSize';

type CreatorProps = {
  editable: boolean;
  id?: string;
  creatorAddress?: string;
  onError?: (error: any) => void;
};

export const Creator = ({
  creatorAddress,
  editable,
  id,
  onError,
}: CreatorProps) => {
  const { width } = useWindowSize();
  const minimize = editable ? width < 620 : width < 320;

  const { data, error, mutate } = useCreator({
    creatorAddress: creatorAddress,
    id: id,
  });
  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error]);

  const { loading, plans } = usePlans(data?.plans || {});

  if (!data || loading || !plans) {
    return <MainLoading />;
  }

  const onChangePlanHandler = useCallback(
    (index: number, plan: CreatorDocDataPlan) => {
      const currentPlans: CreatorDocDataPlan[] = [...(plans || [])];
      currentPlans[index] = plan;
      mutate({ ...data, plans: currentPlans });
    },
    []
  );

  return (
    <Box>
      <ProfileImages />
      <Stack spacing={2} sx={{ mx: 'auto', textAlign: 'center' }}>
        <Stack spacing={2} sx={{ m: 3 }}>
          <ActionButtons
            data={data}
            editable={editable}
            minimize={minimize}
            onChangeData={mutate}
          />
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '2rem' }} variant="h1">
              {data.creatorName}
            </Typography>
            <Typography>{data.description}</Typography>
          </Stack>
        </Stack>
        <Box sx={{ mx: 'auto', width: '100%' }}>
          <Box sx={{ mx: 4 }}>
            <Sections
              sections={[
                {
                  component: (
                    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
                      <Posts editable={editable} id={data.id || ''} />,
                    </Box>
                  ),
                  i18nKey: 'posts',
                },
                {
                  component: (
                    <Box sx={{ maxWidth: 1080, mx: 'auto' }}>
                      <Plans
                        editable={editable}
                        onChangePlan={onChangePlanHandler}
                        plans={plans}
                      />
                    </Box>
                  ),
                  i18nKey: 'plans',
                },
              ]}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
