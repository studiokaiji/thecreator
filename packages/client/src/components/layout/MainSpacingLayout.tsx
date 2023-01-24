import Box from '@mui/material/Box';
import { ReactNode } from 'react';

export const MainSpacingLayout = ({ children }: { children: ReactNode }) => (
  <Box component="main" sx={{ p: 6 }}>
    {children}
  </Box>
);
