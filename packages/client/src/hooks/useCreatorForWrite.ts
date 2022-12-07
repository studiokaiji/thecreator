import { setDoc, updateDoc } from 'firebase/firestore';
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
      plans: {},
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

  const addPlan = async (
    currentLengthOfPlans: number,
    plan: CreatorDocDataPlan
  ) => {
    if (!docRef) throw refErr;
    await updateDoc(docRef, {
      [`plans.${currentLengthOfPlans}`]: plan,
    });
  };

  const updatePlan = async (
    index: number,
    plan: Partial<Omit<CreatorDocDataPlan, 'priceEthPerMonth' | 'currency'>>
  ) => {
    if (!docRef) throw refErr;
    const baseKey = `plans.${index}`;
    const keys = Object.keys(plan).map((k) => `${baseKey}.${k}`);
    const setValues = keys.reduce<{ [key: string]: any }>((prev, key) => {
      prev[key] = plan[key as keyof typeof plan];
      return prev;
    }, {});
    await updateDoc(docRef, setValues);
  };

  return { addCreator, addPlan, docRef, updateCreator, updatePlan };
};
