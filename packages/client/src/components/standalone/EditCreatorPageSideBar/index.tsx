import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import TollIcon from '@mui/icons-material/TollOutlined';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Divider from '@mui/material/Divider';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import Item from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { styled } from '@mui/system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { UserWallet } from '../UserWallet';

import { CreateNewPostButton } from './CreateNewPostButton';

import logoPath from '@/assets/TheCreator.svg';
import { MinimalLink } from '@/components/helpers/MinimalLink';

const MenuItem = styled(Item)(() => ({
  borderRadius: '5px',
  fontWeight: 500,
  padding: '10px 16px',
}));

type EditCreatorPageSideBarProps = DrawerProps & {
  minimize?: boolean;
};

const openButtonSize = 56;

export const EditCreatorPageSideBar = (props: EditCreatorPageSideBarProps) => {
  const { pathname } = useLocation();

  const { t } = useTranslation();

  const [open, setOpen] = useState(!props.minimize);

  const items = [
    {
      Icon: HomeIcon,
      path: '/edit/profile',
      text: t('profile'),
      to: '/edit/profile#posts',
    },
    {
      Icon: CreditCardIcon,
      path: '/edit/membership',
      text: t('membership'),
    },
    {
      Icon: PeopleIcon,
      path: '/edit/supporters',
      text: t('supporters'),
    },
    {
      Icon: TollIcon,
      path: '/edit/payout',
      text: t('payout'),
    },
    {
      Icon: SettingsIcon,
      path: '/edit/settings',
      text: t('settings'),
    },
  ];

  return (
    <Box>
      {props.minimize && (
        <ButtonBase
          onClick={() => setOpen(true)}
          sx={{
            background: 'black',
            height: openButtonSize,
            width: openButtonSize,
          }}
        >
          <MenuIcon
            htmlColor="white"
            sx={{ height: openButtonSize / 2, width: openButtonSize / 2 }}
          />
        </ButtonBase>
      )}
      <Drawer
        anchor="left"
        onClose={() => setOpen(false)}
        open={open}
        sx={{
          width: props.minimize ? 0 : 300,
        }}
        variant={props.minimize ? 'temporary' : 'permanent'}
        {...props}
      >
        <Box
          sx={{
            display: 'flex',
            flexFlow: 'column',
            height: '100%',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ height: '100%', p: 3 }}>
            <Box sx={{ p: 2 }}>
              <Link to="/">
                <Box sx={{ height: 18 }}>
                  <img src={logoPath} />
                </Box>
              </Link>
            </Box>
            <MenuList sx={{ my: 4 }}>
              {items.map(({ Icon, path, text, to }) => (
                <Box key={path} sx={{ mb: 1 }}>
                  <MinimalLink to={to || path}>
                    <MenuItem selected={path === pathname}>
                      <ListItemIcon>
                        <Icon sx={{ color: 'black' }} />
                      </ListItemIcon>
                      {text}
                    </MenuItem>
                  </MinimalLink>
                </Box>
              ))}
            </MenuList>
            <CreateNewPostButton />
          </Box>
          <Box>
            <Divider />
            <UserWallet
              anchorOrigin={{
                horizontal: 'left',
                vertical: 'top',
              }}
              transformOrigin={{
                horizontal: 'left',
                vertical: 'bottom',
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};
