import { useNavigate } from 'react-router-dom';

import { useCurrentUser } from './useCurrentUser';

export const useOnlyCurrentUser = () => {
  const navigate = useNavigate();
  const { checking, currentUser } = useCurrentUser();
  if (!checking && !currentUser) {
    navigate(-1);
  }
};
