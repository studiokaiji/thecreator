import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { ActionButtons } from './ActionButtons';
import { ProfileImages } from './ProfileImages';
import { Sections } from './Sections';
import { Plans } from './plans';
import { Posts } from './posts';

import { CreatorDocData } from '#types/firestore/creator';
import { useWindowSize } from '@/hooks/useWindowSize';

type CreatorProps = {
  editable: boolean;
  data: CreatorDocData;
};

export const Creator = ({ data, editable }: CreatorProps) => {
  const { width } = useWindowSize();
  const minimize = editable ? width < 620 : width < 320;

  return (
    <Box>
      <ProfileImages />
      <Stack spacing={2} sx={{ mx: 'auto', textAlign: 'center' }}>
        <Stack spacing={2} sx={{ m: 3 }}>
          <ActionButtons data={data} editable={editable} minimize={minimize} />
          <Stack spacing={2}>
            <Typography sx={{ fontSize: '2rem' }} variant="h1">
              {data.creatorName}
            </Typography>
            <Typography>{data.description}</Typography>
          </Stack>
        </Stack>
        <Box>
          <Box sx={{ maxWidth: 640, mx: 'auto' }}>
            <Sections
              sections={[
                {
                  component: <Posts editable={editable} id={data.id || ''} />,
                  i18nKey: 'posts',
                },
                {
                  component: (
                    <Plans
                      contractAddress={data.id || ''}
                      editable={editable}
                    />
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
