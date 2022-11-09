import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CenterModal } from '@/components/helpers/CenterModal';
import { RoundedButton } from '@/components/helpers/RoundedButton';

export const CreateNewPostButton = () => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  return (
    <>
      <CenterModal
        maxWidth={540}
        onClose={() => setOpen(false)}
        open={open}
        width="100%"
      >
        <Box>
          <Typography>A</Typography>
        </Box>
      </CenterModal>
      <RoundedButton
        fullWidth
        onClick={() => setOpen(true)}
        size="large"
        variant="contained"
      >
        + {t('createNewPost')}
      </RoundedButton>
    </>
  );
};
