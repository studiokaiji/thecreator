import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

import { MinimalLink } from '../helpers/MinimalLink';

import { UserWallet } from './UserWallet';

import logoPath from '@/assets/TheCreator.svg';

export const NavBar = () => {
  return (
    <AppBar
      position="static"
      sx={(theme) => ({
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        height: 64,
      })}
    >
      <Toolbar>
        <Link to="/">
          <Box sx={{ height: 16 }}>
            <img src={logoPath} />
          </Box>
        </Link>
        <Box sx={{ ml: 4 }}>
          <MinimalLink to="/creators">
            <Typography fontWeight={600}>Creators</Typography>
          </MinimalLink>
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        <UserWallet
          anchorOrigin={{
            horizontal: 'right',
            vertical: 'bottom',
          }}
          height={64}
        />
      </Toolbar>
    </AppBar>
  );
};
