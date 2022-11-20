import Box from '@mui/material/Box';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { EditCreatorPageSideBar } from '../standalone/EditCreatorPageSideBar';
import { NavBar } from '../standalone/NavBar';

import { useWindowSize } from '@/hooks/useWindowSize';

export const NavLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  const { width } = useWindowSize();

  const Component = () => {
    if (pathname.split('/')[1] === 'edit') {
      const minimize = width < 1000;
      return (
        <Box sx={{ display: minimize ? 'block' : 'flex' }}>
          <Box
            sx={
              minimize
                ? {
                    position: 'absolute',
                    top: 0,
                    zIndex: 10,
                  }
                : {}
            }
          >
            <EditCreatorPageSideBar minimize={minimize} />
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
