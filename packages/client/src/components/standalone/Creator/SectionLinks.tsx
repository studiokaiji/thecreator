import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { MinimalLink } from '../../helpers/MinimalLink';

export type Section = 'posts' | 'plans';

type SectionLinksProps = {
  onChangeSection: (section: Section) => void;
};

export const SectionLinks = ({ onChangeSection }: SectionLinksProps) => {
  const { hash } = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    if (!hash || hash === '#') {
      return navigate('#posts');
    }
    if (hash !== '#posts' && hash !== '#plans') {
      return;
    }
    onChangeSection(hash.split('#')[1] as Section);
  }, [hash]);

  return (
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
  );
};
