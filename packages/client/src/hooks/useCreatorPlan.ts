import { getDoc } from 'firebase/firestore';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import { getCreatorPlanDocRef } from '@/converters/creatorPlanConverter';
import { getPlansFromChain } from '@/utils/get-plans-from-chain';

export const useCreatorPlan = (creatorId: string, planId: string) => {
  const docRef = getCreatorPlanDocRef(creatorId, planId);

  const { checking, currentUser } = useCurrentUser();

  const fetcher = async (_: string, isChecking: boolean, uid: string) => {
    if (isChecking) return;

    const snapshot = await getDoc(docRef);

    const docPlan = snapshot.data();
    if (!docPlan) {
      throw Error('Plan does not exist.');
    }

    const plan = (await getPlansFromChain([docPlan], uid))[0];
    return plan;
  };

  return useSWR([docRef.path, checking, currentUser?.uid], fetcher, {
    revalidateOnFocus: false,
  });
};
