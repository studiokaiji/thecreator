import { signInWithCustomToken } from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '@/firebase';
import { connectors, useWallet } from '@/hooks/useWallet';

type NonceResponse = {
  nonce: string;
};

type VerifyResponse = {
  token: string;
};

const toHex = (v: string) =>
  v
    .split('')
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');

export const useAuth = () => {
  const { account, activate, active, deactivate, library } = useWallet();

  const [needAuth, setNeedAuth] = useState(false);

  useEffect(() => {
    if (!needAuth || !account || !active || !library) return;
    authentication();
  }, [needAuth, account, active, library]);

  const authentication = async () => {
    if (!account || !active || !library) {
      throw Error('Wallet is not connected.');
    }

    setNeedAuth(false);

    // Fetch nonce
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const nonceRes = await fetch(
      `${import.meta.env.VITE_FIREBASE_FUNCTIONS_ENDPOINT}/getNonceToSign`,
      {
        body: JSON.stringify({ address: account }),
        headers,
        method: 'POST',
        mode: 'cors',
      }
    );
    if (nonceRes.status !== 200)
      throw Error(`Failed to fetch nonce. Reason: ${nonceRes.statusText}`);

    const { nonce }: NonceResponse = await nonceRes.json();

    // Sign to nonce
    const signature = await library.send('personal_sign', [
      `0x${toHex(nonce)}`,
      account,
    ]);

    // Verify signature
    const verifyRes = await fetch(
      `${import.meta.env.VITE_FIREBASE_FUNCTIONS_ENDPOINT}/verifySignedMessage`,
      {
        body: JSON.stringify({ address: account, signature }),
        headers,
        method: 'POST',
        mode: 'cors',
      }
    );
    if (verifyRes.status !== 200)
      throw Error(
        `Failed to verify signature. Reason: ${verifyRes.statusText}`
      );

    const { token }: VerifyResponse = await verifyRes.json();

    // Sign in with custom token
    const { user } = await signInWithCustomToken(auth, token);
    return user;
  };

  const signIn = async (connector: keyof typeof connectors) => {
    await activate(connector, undefined, true);
    setNeedAuth(true);
  };

  const signOut = async () => {
    deactivate();
    await auth.signOut();
  };

  return { signIn, signOut };
};
