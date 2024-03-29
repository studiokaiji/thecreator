import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AppRegistrationIcon from '@mui/icons-material/AppRegistrationOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import LoyaltyIcon from '@mui/icons-material/LoyaltyOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { PopoverOrigin } from '@mui/material';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import metamaskLogoPath from '@/assets/metamask-logo.svg';
import walletConnectLogoPath from '@/assets/walletconnect-logo.svg';
import { MinimalLink } from '@/components/helpers/MinimalLink';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useIsCreator } from '@/hooks/useIsCreator';

type UserWalletProps = {
  width?: number | string;
  height?: number | string;
  horizontal?: number | 'left' | 'right' | 'center';
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
};

type UserWalletMenuBodyProps = {
  width?: number | string;
  isCreator: boolean;
  isConnected: boolean;
};

const UserWalletMenuBody = ({
  isConnected,
  isCreator,
  width,
}: UserWalletMenuBodyProps) => {
  const { signIn } = useAuth();

  const { t } = useTranslation();

  const options: {
    [key in 'connected' | 'notConnected']: (
      | {
          icon?: ReactNode;
          text: string;
          onClick?: () => void;
          to?: string;
        }
      | string
    )[];
  } = {
    connected: [
      {
        icon: <GroupIcon />,
        text: t('supportingCreators'),
        to: '/mypage/supporting-creators',
      },
      {
        icon: <NotificationsNoneIcon />,
        text: t('notifications'),
        to: '/mypage/notifications',
      },
      {
        icon: <SettingsIcon />,
        text: t('settings'),
        to: '/mypage/settings',
      },
      'Creator',
      isCreator
        ? {
            icon: <AppRegistrationIcon />,
            text: t('creatorConsole'),
            to: '/edit/profile#posts',
          }
        : {
            icon: <LoyaltyIcon />,
            text: t('becomeACreator'),
            to: '/create',
          },
    ],
    notConnected: [
      t('walletSelectMessage'),
      {
        icon: metamaskLogoPath,
        onClick: () => signIn('injected'),
        text: 'Metamask',
      },
      {
        icon: walletConnectLogoPath,
        onClick: () => signIn('walletConnect'),
        text: 'WalletConnect',
      },
    ],
  };

  return (
    <Paper elevation={0} sx={{ maxWidth: '100%', width }}>
      {options[isConnected ? 'connected' : 'notConnected'].map((item, i) => {
        const key = `user-wallet-menu-items-${i}`;

        if (typeof item === 'string') {
          return (
            <Typography
              key={key}
              color="gray"
              sx={{ mx: 2, my: 0.5 }}
              variant="body2"
            >
              {item}
            </Typography>
          );
        }

        const menuItem = (
          <MenuItem key={key} onClick={item.onClick}>
            {item.icon && (
              <ListItemIcon>
                {typeof item.icon === 'string' ? (
                  <img height={24} src={item.icon} width={24} />
                ) : (
                  item.icon
                )}
              </ListItemIcon>
            )}
            <ListItemText>{item.text}</ListItemText>
          </MenuItem>
        );

        if (item.to) {
          return (
            <MinimalLink key={key} to={item.to}>
              {menuItem}
            </MinimalLink>
          );
        }

        return <>{menuItem}</>;
      })}
    </Paper>
  );
};

export const UserWallet = ({
  anchorOrigin = { horizontal: 'left', vertical: 'bottom' },
  height = 64,
  transformOrigin,
  width = 300,
}: UserWalletProps) => {
  const { checking, currentUser } = useCurrentUser();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isOpenMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const { t } = useTranslation();

  const { data: isCreator } = useIsCreator(currentUser?.uid);

  const loading = useMemo(
    () => checking || typeof isCreator !== 'boolean',
    [checking, isCreator]
  );

  return (
    <Box>
      <ButtonBase
        onClick={handleClick}
        sx={(theme) => ({
          ':hover': {
            backgroundColor: theme.palette.grey[200],
          },
          height,
          textAlign: 'left',
          width,
        })}
      >
        <Box sx={{ width: 'calc(100% - 30px)' }}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
            sx={{ width: '100%' }}
          >
            <WalletIcon htmlColor="gray" />
            {loading ? (
              <Stack sx={{ width: '100%' }}>
                <Skeleton sx={{ fontSize: '1rem' }} variant="text" />
                <Skeleton sx={{ fontSize: '0.875rem' }} variant="text" />
              </Stack>
            ) : currentUser ? (
              <Box sx={{ overflowX: 'hidden', width: '100%' }}>
                <Box>
                  <Typography
                    fontWeight={600}
                    sx={{
                      overflowX: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {currentUser.displayName || 'User'}
                  </Typography>
                  <Typography
                    color="GrayText"
                    sx={{
                      overflowX: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    variant="body2"
                  >
                    {currentUser.uid}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography sx={{ width: '100%' }}>
                {t('notConnectedWallet').toString()}
              </Typography>
            )}
          </Stack>
        </Box>
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={anchorOrigin}
        onClose={handleClose}
        open={isOpenMenu}
        transformOrigin={transformOrigin}
      >
        <UserWalletMenuBody
          isConnected={!!currentUser}
          isCreator={!!isCreator}
          width={width}
        />
      </Menu>
    </Box>
  );
};
