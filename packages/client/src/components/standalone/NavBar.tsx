import { alpha } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { MinimalLink } from '../helpers/MinimalLink';

import { UserWallet } from './UserWallet';

import logoPath from '@/assets/TheCreator.svg';
import { useScrollPosition } from '@/hooks/useScrollPosition';

const APP_BAR_HEIGHT = 64;

export const NavBar = () => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrollToUp, setIsScrollToUp] = useState(true);

  useScrollPosition((prevTop, currentTop) => {
    setIsScrollToUp(prevTop > currentTop);
    setScrollTop(currentTop);
  });

  return (
    <Box sx={{ mb: `${APP_BAR_HEIGHT}px` }}>
      <AppBar
        position="absolute"
        style={{
          position: 'fixed',
          top: scrollTop < APP_BAR_HEIGHT || isScrollToUp ? 0 : -APP_BAR_HEIGHT,
        }}
        sx={(theme) => ({
          backdropFilter: 'saturate(180%) blur(12px)',
          background: alpha(theme.palette.background.paper, 0.8),
          boxShadow: 'none',
          color: theme.palette.text.primary,
          height: APP_BAR_HEIGHT,
          top: isScrollToUp ? 0 : -APP_BAR_HEIGHT,
          transition: 'top 0.5s',
          zIndex: 9999,
        })}
      >
        <Toolbar>
          <Link to="/">
            <Box sx={{ height: 18 }}>
              <img src={logoPath} />
            </Box>
          </Link>
          <Box sx={{ ml: 4 }}>
            <MinimalLink to="/creators">
              <Typography fontWeight={600}>Creators</Typography>
            </MinimalLink>
          </Box>
          <Box sx={{ flexGrow: 1 }} />

          <UserWallet height={64} horizontal="right" />
        </Toolbar>
      </AppBar>
    </Box>
  );
};
