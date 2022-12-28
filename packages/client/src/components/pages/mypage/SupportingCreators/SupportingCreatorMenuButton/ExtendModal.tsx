import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';

import { CenterModalWithTitle } from '@/components/helpers/CenterModalWithTitle';

type ExtendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  extendError?: string;
  extendStatus:
    | ''
    | 'waitingSendTx'
    | 'sentApproveTx'
    | 'sentExtendTx'
    | 'complete';
};

export const ExtendModal = ({
  extendError,
  extendStatus,
  isOpen,
  onClose,
}: ExtendModalProps) => {
  const { t } = useTranslation();

  return (
    <CenterModalWithTitle
      onClose={onClose}
      open={isOpen}
      title={t('extendThePeriod')}
    >
      <Stack spacing={3}>
        {extendError ? (
          <Typography component={'pre'}>{t(extendError)}</Typography>
        ) : (
          <Stack justifyContent="center" spacing={2}>
            {extendStatus === 'complete' ? (
              <CheckCircleOutlineIcon
                color="success"
                fontSize="large"
                sx={{ mx: 'auto' }}
              />
            ) : (
              <CircularProgress sx={{ mx: 'auto' }} />
            )}
            <Typography textAlign="center">{t(extendStatus)}</Typography>
          </Stack>
        )}
        {(extendStatus === 'complete' || extendError) && (
          <Button onClick={onClose} variant="contained">
            {t('close')}
          </Button>
        )}
      </Stack>
    </CenterModalWithTitle>
  );
};
