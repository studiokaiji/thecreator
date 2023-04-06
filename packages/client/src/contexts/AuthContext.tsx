import { User } from 'firebase/auth';
import { createContext, ReactNode, useEffect, useState } from 'react';

import { auth } from '@/firebase';
import { useWallet } from '@/hooks/useWallet';
import { isConnectedWallet } from '@/utils/is-connected-wallet';

type AuthContextProps = {
  currentUser: User | null | undefined;
};

export const AuthContext = createContext<AuthContextProps>({
  currentUser: null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined
  );

  const { account } = useWallet();

  useEffect(() => {
    auth.onAuthStateChanged(setCurrentUser);
  }, []);

  useEffect(() => {
    if (currentUser === undefined) return;
    isConnectedWallet(currentUser?.uid).then(async (isConnected) => {
      if (!isConnected && currentUser) await auth.signOut();
    });
  }, [account, currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
