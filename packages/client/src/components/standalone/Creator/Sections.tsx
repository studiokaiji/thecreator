import Stack from '@mui/material/Stack';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { MinimalLink } from '../../helpers/MinimalLink';

type SectionsProps = {
  postsSection: ReactNode;
  plansSection: ReactNode;
};

export const Sections = ({ plansSection, postsSection }: SectionsProps) => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    if (!hash || hash === '#' || (hash !== '#posts' && hash !== '#plans')) {
      return navigate('#posts');
    }
  }, [hash]);

  return (
    <Stack spacing={5}>
      <Stack direction="row" spacing={2} sx={{ fontWeight: 500, mx: 'auto' }}>
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
      {hash === '#posts' && postsSection}
      {hash === '#plans' && plansSection}
    </Stack>
  );
};
