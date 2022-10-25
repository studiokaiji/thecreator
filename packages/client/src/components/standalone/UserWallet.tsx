import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import GroupIcon from '@mui/icons-material/Group';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import SettingsIcon from '@mui/icons-material/Settings';
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
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import metamaskLogoPath from '@/assets/metamask-logo.svg';
import walletConnectLogoPath from '@/assets/walletconnect-logo.svg';
import { MinimalLink } from '@/components/helpers/MinimalLink';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type UserWalletProps = {
  width?: number | string;
  height?: number | string;
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
        to: '/supporing-creators',
      },
      {
        icon: <SettingsIcon />,
        text: t('settings'),
        to: '/settings',
      },
      'Creator',
      isCreator
        ? {
            icon: <AppRegistrationIcon />,
            text: t('creatorConsole'),
            to: '/edit/profile',
          }
        : {
            icon: <LoyaltyIcon />,
            text: t('becomeACreator'),
            to: '/become-a-creator',
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

export const UserWallet = ({ height = 56, width = 300 }: UserWalletProps) => {
  const { checking, currentUser } = useCurrentUser();

  const [isOpenMenu, setIsOpenMenu] = useState(false);

  const { t } = useTranslation();

  return (
    <Box>
      <ButtonBase
        onClick={() => setIsOpenMenu(true)}
        sx={(theme) => ({
          ':hover': {
            backgroundColor: theme.palette.grey[200],
          },
          height,
          textAlign: 'left',
          width,
        })}
      >
        <Box sx={{ width: '100%' }}>
          <Stack
            alignItems="center"
            direction="row"
            justifyContent="space-between"
            spacing={1}
            sx={{ width: '100%' }}
          >
            <WalletIcon htmlColor="gray" />
            {checking ? (
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
            {!checking && <KeyboardArrowDownIcon htmlColor="gray" />}
          </Stack>
        </Box>
      </ButtonBase>
      <Menu onClose={() => setIsOpenMenu(false)} open={isOpenMenu}>
        <UserWalletMenuBody
          isConnected={!!currentUser}
          isCreator={true}
          width={width}
        />
      </Menu>
    </Box>
  );
};
