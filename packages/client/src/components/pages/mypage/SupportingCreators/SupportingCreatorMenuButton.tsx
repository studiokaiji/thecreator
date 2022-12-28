import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BigNumber } from 'ethers';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CenterModal } from '@/components/helpers/CenterModal';
import { useSupportingCreatorPlanForWrite } from '@/hooks/useSupportingCreatorsForWrite';

type SupportingCreatorMenuButtonProps = {
  data: {
    tokenId: BigNumber;
    lockAddress: string;
  };
  onExtend: (
    lockAddress: string,
    tokenId: BigNumber,
    newTimestamp: BigNumber
  ) => void;
};

export const SupportingCreatorMenuButton = ({
  data,
  onExtend,
}: SupportingCreatorMenuButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { t } = useTranslation();

  const { extendPlanPeriod } = useSupportingCreatorPlanForWrite(
    data.lockAddress
  );

  const [extendStatus, setExtendStatus] = useState<
    '' | 'waitingSendTx' | 'sentApproveTx' | 'sentExtendTx' | 'complete'
  >('');
  const [extendError, setExtendError] = useState('');

  const closeExtendModal = () => {
    if (extendStatus !== 'complete' && !extendError) {
      return;
    }
    setExtendStatus('');
    setExtendError('');
  };

  const openMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setIsOpen(false);
  };

  const extend = async () => {
    setExtendStatus('waitingSendTx');
    try {
      const newTimestamp = await extendPlanPeriod({
        onApproveTxSend: () => setExtendStatus('sentApproveTx'),
        onExtendTxSend: () => setExtendStatus('sentExtendTx'),
        tokenId: data.tokenId,
      });
      setExtendStatus('complete');
      onExtend(data.lockAddress, data.tokenId, newTimestamp);
    } catch (e) {
      setExtendError(JSON.stringify(e, null, 2));
    }
  };

  return (
    <>
      <IconButton onClick={openMenu}>
        <MoreVertIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} onClose={closeMenu} open={isOpen}>
        <MenuItem onClick={extend}>
          <ListItemIcon>
            <MoreTimeIcon />
          </ListItemIcon>
          {t('extendThePeriod')}
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <EditNotificationsOutlinedIcon />
          </ListItemIcon>
          {t('updateNotificationSettings')}
        </MenuItem>
      </Menu>
      <CenterModal onClose={closeExtendModal} open={!!extendStatus}>
        <Stack spacing={3}>
          <Typography variant="h4">{t('extendThePeriod')}</Typography>
          {extendError ? (
            <>
              <Typography component={'pre'}>{t(extendError)}</Typography>
            </>
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
            <Button onClick={closeExtendModal} variant="contained">
              {t('close')}
            </Button>
          )}
        </Stack>
      </CenterModal>
    </>
  );
};
