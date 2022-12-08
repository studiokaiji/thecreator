import { Suspense, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Creator } from '@/components/standalone/Creator';
import { MainLoading } from '@/components/standalone/MainLoading';
import { NotFound } from '@/pages/404';

export const CreatorPage = () => {
  const { pathname } = useLocation();
  const id = useMemo(() => pathname.split('/')[2], [pathname]);

  const [error, setError] = useState('');

  if (error === 'Error: Creator data does not exist') {
    return <NotFound />;
  }

  return (
    <Suspense fallback={<MainLoading />}>
      <Creator
        editable={false}
        id={id}
        onError={(e) => setError(e.toString())}
      />
    </Suspense>
  );
};
