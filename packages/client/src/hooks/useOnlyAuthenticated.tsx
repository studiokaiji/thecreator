import { useNavigate } from 'react-router-dom';

import { useCurrentUser } from './useCurrentUser';

import { MainLoading } from '@/components/standalone/MainLoading';

export const useOnlyAuthenticated = () => {
  const navigate = useNavigate();
  const { checking, currentUser } = useCurrentUser();
  if (checking) {
    return <MainLoading />;
  }
  if (!checking && !currentUser) {
    navigate(-1);
  }
};
