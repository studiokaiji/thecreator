import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreator } from '@/hooks/useCreator';

export const EditCreatorProfilePage = () => {
  const { data, error } = useCreator();

  const router = useNavigate();

  if (error && error.toString() === 'Error: Creator data does not exist') {
    router('/404');
  }

  return (
    <Box sx={{ minHeight: '101vh' }}>
      {!data ? <MainLoading /> : <Creator editable data={data} />}
    </Box>
  );
};
