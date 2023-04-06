import EditNotificationsOutlinedIcon from '@mui/icons-material/EditNotificationsOutlined';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import MoreVertIcon from '@mui/icons-material/MoreVertOutlined';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { BigNumber } from 'ethers';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExtendModal } from './ExtendModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';

import { useSupportingCreatorPlanForWrite } from '@/hooks/useSupportingCreatorsForWrite';

type SupportingCreatorMenuButtonProps = {
  data: {
    id: string;
    tokenId: BigNumber;
    lockAddress: string;
    notificationSettings: NotificationSettings;
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

  const { extendPlanPeriod, updateNotificationSettings } =
    useSupportingCreatorPlanForWrite(data.lockAddress);

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
    closeMenu();
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
    closeMenu();
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

  const [isOpenNotificationSettings, setIsOpenNotificationSettings] =
    useState(false);

  const updateNotification = async (settings: NotificationSettings) => {
    await updateNotificationSettings(data.id, settings);
  };

  const openNotificationSettings = () => {
    closeMenu();
    setIsOpenNotificationSettings(true);
  };

  const closeNotificationSettings = () => {
    setIsOpenNotificationSettings(false);
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
        <MenuItem onClick={openNotificationSettings}>
          <ListItemIcon>
            <EditNotificationsOutlinedIcon />
          </ListItemIcon>
          {t('notificationSettings')}
        </MenuItem>
      </Menu>
      <ExtendModal
        extendError={extendError}
        extendStatus={extendStatus}
        isOpen={!!extendStatus}
        onClose={closeExtendModal}
      />
      <NotificationSettingsModal
        isOpen={isOpenNotificationSettings}
        notificationSettings={data.notificationSettings}
        onClose={closeNotificationSettings}
        onUpdateNotificationSettings={updateNotification}
      />
    </>
  );
};
