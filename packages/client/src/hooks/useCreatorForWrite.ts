import { setDoc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import { setIsCreatorFlag } from './useIsCreator';
import { useWallet } from './useWallet';

import { getCreatorDocRef } from '@/converters/creatorConverter';

const refErr = Error('Creator document reference does not exist.');

export const useCreatorForWrite = () => {
  const { account } = useWallet();

  const docRef = useMemo(() => {
    if (!account) return null;
    return getCreatorDocRef(account);
  }, [account]);

  const addCreator = async (creatorName: string, description: string) => {
    if (!docRef || !account) throw refErr;
    await setDoc(docRef, {
      createdAt: new Date(),
      creatorAddress: account,
      creatorName,
      description,
      id: '',
      pinningPostId: '',
      settings: {
        isNSFW: false,
        isPublish: true,
      },
      updatedAt: new Date(),
    });
    setIsCreatorFlag(account, true);
  };

  const updateCreator = async ({
    creatorName,
    description,
    pinningPostId,
    settings,
  }: Partial<
    Omit<CreatorDocData, 'id' | 'creatorAddress' | 'updatedAt' | 'createdAt'>
  >) => {
    if (!docRef || !account) throw refErr;
    await updateDoc(docRef, {
      creatorName,
      description,
      pinningPostId,
      settings,
    });
  };

  return { addCreator, docRef, updateCreator };
};
