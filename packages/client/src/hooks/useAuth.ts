import { getAdditionalUserInfo, signInWithCustomToken } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';

import { auth, functions } from '@/firebase';
import { connectors, useWallet } from '@/hooks/useWallet';

const CONNECTOR_LOCAL_STORAGE_KEY = 'web3_auth_connector';

const toHex = (v: string) =>
  v
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

export const useAuth = () => {
  const { account, activate, active, deactivate, library } = useWallet();

  const [needAuth, setNeedAuth] = useState(false);
  const [isNewUser, setIsNewUser] = useState<boolean>();

  useEffect(() => {
    if (!needAuth || !account || !active || !library) return;
    authentication().catch(() => {
      deactivate();
    });
  }, [needAuth, account, active, library]);

  const authentication = async () => {
    if (!account || !active || !library) {
      throw Error('Wallet is not connected.');
    }

    setNeedAuth(false);

    const { data: nonceData } = await httpsCallable<
      { address: string },
      { nonce: string }
    >(
      functions,
      'getNonceToSign'
    )({ address: account }).catch((e) => {
      throw Error(`Failed to fetch nonce. Reason: ${e.message}`);
    });

    // Sign to nonce
    const signature = await library.send('personal_sign', [
      `0x${toHex(nonceData.nonce)}`,
      account,
    ]);

    // Verify signature
    const { data: verifyData } = await httpsCallable<
      {
        address: string;
        signature: string;
      },
      { token: string }
    >(
      functions,
      'verifySignedMessage'
    )({ address: account, signature }).catch((e) => {
      throw Error(`Failed to verify signature. Reason: ${e.message}`);
    });

    // Sign in with custom token
    const cred = await signInWithCustomToken(auth, verifyData.token);

    const isNewUser = getAdditionalUserInfo(cred)?.isNewUser;
    setIsNewUser(isNewUser);

    return cred;
  };

  const signIn = async (connector: keyof typeof connectors) => {
    await activate(connector, undefined, true);
    setNeedAuth(true);
    localStorage.setItem(CONNECTOR_LOCAL_STORAGE_KEY, connector);
  };

  const signOut = async () => {
    deactivate();
    await auth.signOut();
    localStorage.removeItem(CONNECTOR_LOCAL_STORAGE_KEY);
  };

  const getConnector = () => {
    return localStorage.getItem(CONNECTOR_LOCAL_STORAGE_KEY) as
      | keyof typeof connectors
      | null;
  };

  return {
    authentication,
    getConnector,
    isNewUser,
    processing: needAuth,
    signIn,
    signOut,
  };
};
