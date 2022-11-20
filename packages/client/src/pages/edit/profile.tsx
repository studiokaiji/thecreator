import Box from '@mui/material/Box';

import { Creator } from '@/components/standalone/Creator';

export const EditCreatorProfilePage = () => {
  return (
    <Box sx={{ minHeight: '101vh' }}>
      <Creator editable />
    </Box>
  );
};
