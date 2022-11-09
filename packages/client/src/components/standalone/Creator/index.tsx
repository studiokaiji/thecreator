import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButtons } from './ActionButton';
import { ProfileImages } from './ProfileImages';
import { Sections } from './Sections';

import { useCreator } from '@/hooks/useCreator';
import { useWindowSize } from '@/hooks/useWindowSize';

type CreatorProps = {
  editable: boolean;
};

export const Creator = ({ editable }: CreatorProps) => {
  const { data } = useCreator();

  const { width } = useWindowSize();
  const minimize = editable ? width < 620 : width < 320;

  return (
    <Box>
      <ProfileImages />
      <Stack spacing={2} sx={{ mx: 'auto', textAlign: 'center' }}>
        <Stack spacing={2} sx={{ m: 3 }}>
          <ActionButtons editable={editable} minimize={minimize} />
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '2rem' }} variant="h1">
              {data?.creatorName}
            </Typography>
            <Typography>{data?.description}</Typography>
          </Stack>
        </Stack>
        <Sections
          plansSection={<div>Plans</div>}
          postsSection={<div>Posts</div>}
        />
      </Stack>
    </Box>
  );
};
