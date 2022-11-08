import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { MinimalLink } from '../../helpers/MinimalLink';

import { ActionButtons } from './ActionButton';
import { ProfileImages } from './ProfileImages';

import { useCreator } from '@/hooks/useCreator';
import { useWindowSize } from '@/hooks/useWindowSize';

type CreatorProps = {
  editable: boolean;
};

export const Creator = ({ editable }: CreatorProps) => {
  const { data } = useCreator();

  const { t } = useTranslation();

  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hash || hash === '#') {
      navigate('#posts');
    }
  }, [hash]);

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
            <Typography>
              {data?.description}
            </Typography>
          </Stack>
        </Stack>
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ fontWeight: 500, mx: 'auto' }}
          >
            <MinimalLink
              sx={{
                borderBottom: hash === '#posts' ? '2px solid black' : '',
              }}
              to="#posts"
            >
              {t('posts')}
            </MinimalLink>
            <MinimalLink
              sx={{
                borderBottom: hash === '#plans' ? '2px solid black' : '',
              }}
              to="#plans"
            >
              {t('plans')}
            </MinimalLink>
          </Stack>
          <div>A</div>
        </Stack>
      </Stack>
    </Box>
  );
};
