import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useLocation } from 'react-router-dom';

import { SupportingCreators } from './SupportingCreators';

export const MainCard = () => {
  const { hash } = useLocation();
  return (
    <Card sx={{ width: '100%' }}>
      <Box>
        {hash === '#' || hash === '' ? (
          <div />
        ) : hash === '#supporting-creators' ? (
          <SupportingCreators />
        ) : (
          <div />
        )}
      </Box>
    </Card>
  );
};
