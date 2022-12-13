import Box from '@mui/material/Box';
import { Suspense, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';
import { MainLoading } from '@/components/standalone/MainLoading';
import { NotFound } from '@/pages/404';

export const CreatorPage = () => {
  const { id } = useParams();

  const [error, setError] = useState('');

  if (error === 'Error: Creator data does not exist') {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<MainLoading />}>
      <Box sx={{ mb: 4 }}>
        <Creator
          editable={false}
          id={id}
          onError={(e) => setError(e.toString())}
        />
      </Box>
    </Suspense>
  );
};
