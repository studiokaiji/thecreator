import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import HomeIcon from '@mui/icons-material/HomeOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import TollIcon from '@mui/icons-material/TollOutlined';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer, { DrawerProps } from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import Item from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { styled } from '@mui/system';
import { Link, useLocation } from 'react-router-dom';

import { MinimalLink } from '../helpers/MinimalLink';
import { RoundedButton } from '../helpers/RoundedButton';

import { UserWallet } from './UserWallet';

import logoPath from '@/assets/TheCreator.svg';

const MenuItem = styled(Item)(() => ({
  borderRadius: '5px',
  fontWeight: 500,
  padding: '10px 16px',
}));

const items = [
  {
    Icon: HomeIcon,
    path: '/edit/profile',
    text: 'Profile',
  },
  {
    Icon: CreditCardIcon,
    path: '/edit/membership',
    text: 'Membership',
  },
  {
    Icon: PeopleIcon,
    path: '/edit/supporters',
    text: 'Supporters',
  },
  {
    Icon: TollIcon,
    path: '/edit/payout',
    text: 'Payout',
  },
  {
    Icon: SettingsIcon,
    path: '/edit/settings',
    text: 'Settings',
  },
];

export const EditCreatorPageSideBar = (props: DrawerProps) => {
  const { pathname } = useLocation();
  return (
    <Drawer
      open
      anchor="left"
      sx={{
        width: 300,
      }}
      variant="permanent"
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
            {items.map(({ Icon, path, text }) => (
              <Box key={path} sx={{ mb: 1 }}>
                <MinimalLink to={path}>
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
          <RoundedButton fullWidth size="large" variant="contained">
            + Create New Post
          </RoundedButton>
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
  );
};
