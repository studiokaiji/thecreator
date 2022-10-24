import { useContext, useEffect, useState } from 'react';

import { AuthContext } from '@/contexts/AuthContext';

export const useCurrentUser = () => {
  const [checking, setChecking] = useState(true);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser !== undefined) {
      setChecking(false);
    }
  }, [currentUser]);

  return { checking, currentUser };
};
