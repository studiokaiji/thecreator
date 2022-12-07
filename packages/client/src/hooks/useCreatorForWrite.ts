import { arrayUnion, setDoc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import { useWallet } from './useWallet';

import { CreatorDocDataPlan } from '#types/firestore/creator';
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
      plans: [],
      updatedAt: new Date(),
    });
  };

  const updateCreator = async (creatorName?: string, description?: string) => {
    if (!docRef || !account) throw refErr;
    await updateDoc(docRef, {
      creatorName,
      description,
    });
  };

  const addPlan = async (plan: CreatorDocDataPlan) => {
    if (!docRef) throw refErr;
    await updateDoc(docRef, {
      plans: arrayUnion(plan),
    });
  };

  return { addCreator, addPlan, docRef, updateCreator };
};
