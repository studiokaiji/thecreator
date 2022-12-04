import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCreator } from '@/hooks/useCreator';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const EditCreatorProfilePage = () => {
  const { currentUser } = useCurrentUser();
  const { data, error } = useCreator({ creatorAddress: currentUser?.uid });

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
