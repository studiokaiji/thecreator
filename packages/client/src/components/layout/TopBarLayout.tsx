import Box from '@mui/material/Box';
import { FC, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import { NavBar } from '../standalone/NavBar';

export const TopBarLayout: FC<Partial<PropsWithChildren>> = ({ children }) => {
  return (
    <Box>
      <NavBar />
      {children}
      <Outlet />
    </Box>
  );
};
