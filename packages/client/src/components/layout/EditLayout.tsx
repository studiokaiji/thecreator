import { useMediaQuery } from '@mui/material';
import Box from '@mui/material/Box';
import { FC, PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';

import { EditCreatorPageSideBar } from '@/components/standalone/EditCreatorPageSideBar';

export const EditLayout: FC<Partial<PropsWithChildren>> = () => {
  const matchesMinimize = useMediaQuery('(max-width:1000px)');

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
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
