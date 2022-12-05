import Box from '@mui/material/Box';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';

export const EditCreatorProfilePage = () => {
  const router = useNavigate();

  const onErrorHandler = useCallback((error: any) => {
    if (error && error.toString() === 'Error: Creator data does not exist') {
      router('/404');
    }
  }, []);

  return (
    <Box sx={{ minHeight: '101vh' }}>
      <Creator editable onError={onErrorHandler} />
    </Box>
  );
};
