import Box from '@mui/material/Box';
import { FC, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { EditCreatorPageSideBar } from '../standalone/EditCreatorPageSideBar';
import { NavBar } from '../standalone/NavBar';

export const NavLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();

  if (pathname.split('/')[1] === 'edit') {
    return (
      <Box sx={{ display: 'flex' }}>
        <EditCreatorPageSideBar
          sx={{
            flexShrink: 0,
            width: 300,
          }}
        />
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
