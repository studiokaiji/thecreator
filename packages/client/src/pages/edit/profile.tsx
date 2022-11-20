import Box from '@mui/material/Box';

import { Creator } from '@/components/pages/edit/profile/Creator';

export const EditCreatorProfilePage = () => {
  return (
    <Box sx={{ minHeight: '101vh' }}>
      <Creator editable />
    </Box>
  );
};
