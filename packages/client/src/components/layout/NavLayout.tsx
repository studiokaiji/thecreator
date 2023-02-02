import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { EditCreatorPageSideBar } from '../standalone/EditCreatorPageSideBar';
import { NavBar } from '../standalone/NavBar';

export const NavLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  const matchesMinimize = useMediaQuery('(max-width:1000px)');

  const Component = () => {
    if (pathname.split('/')[1] === 'edit') {
      return (
        <Box sx={{ display: matchesMinimize ? 'block' : 'flex' }}>
          <Box
            sx={
              matchesMinimize
                ? {
                    position: 'absolute',
                    top: 0,
                    zIndex: 10,
                  }
                : {}
            }
          >
            <EditCreatorPageSideBar minimize={matchesMinimize} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>{children}</Box>
        </Box>
      );
    }

    return (
      <Box>
        <NavBar />
        {children}
      </Box>
    );
  };

  return (
    <Box sx={{ backgroundColor: '#F9F9FA', minHeight: '100vh', width: '100%' }}>
      <Component />
    </Box>
  );
};
