import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { MinimalLink } from '@/components/helpers/MinimalLink';

export const MenuCard = () => {
  const { t } = useTranslation();

  const menuList = [
    {
      icon: <AccountCircleIcon />,
      text: t('mypage'),
      to: '/mypage',
    },
    {
      icon: <GroupIcon />,
      text: t('supportingCreators'),
      to: '/mypage#supporting-creators',
    },
    {
      icon: <SettingsIcon />,
      text: t('settings'),
      to: '/mypage#settings',
    },
  ];

  const { hash, pathname } = useLocation();

  return (
    <Paper>
      <MenuList>
        {menuList.map((menu, i) => (
          <MinimalLink key={`menu-item-${i}`} to={menu.to}>
            <MenuItem
              selected={menu.to === `${pathname}${hash}`}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>{menu.icon}</ListItemIcon>
              <ListItemText>
                <Typography fontWeight={500}>{menu.text}</Typography>
              </ListItemText>
            </MenuItem>
          </MinimalLink>
        ))}
      </MenuList>
    </Paper>
  );
};
