import { deleteUser, sendEmailVerification, updateEmail } from 'firebase/auth';
import { useContext, useEffect, useState } from 'react';

import { useAuth } from './useAuth';
import { useWallet } from './useWallet';

import { AuthContext } from '@/contexts/AuthContext';

const CURRENT_USER_DOES_NOT_EXIST_ERROR = Error('currentUser does not exist');

export const useCurrentUser = () => {
  const [checking, setChecking] = useState(true);

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    if (currentUser !== undefined) {
      setChecking(false);
    }
  }, [currentUser]);

  const { authentication, getConnector } = useAuth();

  const { activate } = useWallet();

  const updateUserEmail = async (email: string) => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }

    const connector = getConnector();
    if (!connector) {
      throw Error('Invalid connector');
    }

    await activate(connector, undefined, true);

    const { user } = await authentication();
    if (!user) {
      throw Error('No authenticated');
    }
    await updateEmail(user, email);
    await sendEmailVerification(user);
  };

  const removeUser = async () => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }
    await deleteUser(currentUser);
  };

  return { checking, currentUser, removeUser, updateUserEmail };
};
