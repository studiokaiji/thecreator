import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useCurrentUser } from '@/hooks/useCurrentUser';

export const AuthCheck: FC<{ children: ReactNode }> = ({ children }) => {
  const { checking, currentUser } = useCurrentUser();

  if (checking) {
    return <div>AUTH CHEKING...</div>;
  }

  if (currentUser) {
    return <>{children}</>;
  }

  return <Navigate replace to="/" />;
};
