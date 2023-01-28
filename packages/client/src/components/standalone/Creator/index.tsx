import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';

import { MainLoading } from '../MainLoading';

import { ActionButtons } from './ActionButtons';
import { ProfileImages } from './ProfileImages';
import { Plans } from './plans';
import { Posts } from './posts';

import { useCreator } from '@/hooks/useCreator';
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

  if (!data) {
    return <MainLoading />;
  }

  return (
    <Stack>
      <ProfileImages {...data} />
      <Stack
        spacing={2}
        sx={{ mx: 'auto', textAlign: 'center', width: '100%' }}
      >
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
        <Box sx={{ mx: 'auto' }}>
          <Stack gap={8} sx={{ mx: 4 }}>
            <Box sx={{ maxWidth: 1080, mx: 'auto', width: '100%' }}>
              <Plans creatorId={data.id} editable={editable} />
            </Box>
            <Box sx={{ maxWidth: 640, mx: 'auto', width: '100%' }}>
              <Posts editable={editable} id={data.id || ''} />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};
