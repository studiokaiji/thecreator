import Box from '@mui/material/Box';
import { ReactNode } from 'react';

export const MainSpacingLayout = ({ children }: { children: ReactNode }) => (
  <Box component="main" sx={{ maxWidth: 1280, mx: 'auto', p: 6 }}>
    {children}
  </Box>
);
