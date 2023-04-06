import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { MainLoading } from '../MainLoading';

import { MinimalLink } from '@/components/helpers/MinimalLink';

type Section = {
  component: ReactNode;
  i18nKey: string;
  hash?: string;
};

type SectionsProps = {
  sections: Section[];
};

export const Sections = ({ sections }: SectionsProps) => {
  const validHashes = sections.map(
    ({ hash, i18nKey }) => hash || `#${i18nKey}`
  );

  const { hash } = useLocation();
  const navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    if (!hash || hash === '#' || !validHashes.includes(hash)) {
      return navigate(validHashes[0]);
    }
  }, [hash]);

  const selectedSectionIndex = validHashes.findIndex((h) => h === hash);

  if (selectedSectionIndex >= 0) {
    return (
      <Stack spacing={5} sx={{ width: '100%' }}>
        <Stack direction="row" spacing={2} sx={{ fontWeight: 500, mx: 'auto' }}>
          {sections.map((section, i) => (
            <MinimalLink
              key={`section-selector-${section.i18nKey}`}
              sx={{
                borderBottom: hash === validHashes[i] ? '2px solid black' : '',
              }}
              to={validHashes[i]}
            >
              {t(section.i18nKey)}
            </MinimalLink>
          ))}
        </Stack>
        <Box>{sections[selectedSectionIndex].component}</Box>
      </Stack>
    );
  }

  return <MainLoading />;
};
