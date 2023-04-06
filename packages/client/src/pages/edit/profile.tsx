import Box from '@mui/material/Box';
import { Suspense, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';
import { MainLoading } from '@/components/standalone/MainLoading';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const EditCreatorProfilePage = () => {
  const router = useNavigate();

  const onErrorHandler = useCallback((error: any) => {
    if (error && error.toString() === 'Error: Creator data does not exist') {
      router('/404');
    }
  }, []);

  const { currentUser } = useCurrentUser();

  return (
    <Suspense fallback={<MainLoading />}>
      <Box sx={{ mb: 4, minHeight: '101vh' }}>
        <Creator
          editable
          creatorAddress={currentUser?.uid}
          onError={onErrorHandler}
        />
      </Box>
    </Suspense>
  );
};
