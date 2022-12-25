import { getDoc } from 'firebase/firestore';
import useSWR from 'swr';

import { getCreatorPlanDocRef } from '@/converters/creatorPlanConverter';
import { getPlansFromChain } from '@/utils/get-plans-from-chain';

export const useCreatorPlan = (creatorId: string, planId: string) => {
  const docRef = getCreatorPlanDocRef(creatorId, planId);

  const fetcher = async () => {
    const snapshot = await getDoc(docRef);

    const docPlan = snapshot.data();
    if (!docPlan) {
      throw Error('Plan does not exist.');
    }

    const plan = (await getPlansFromChain([docPlan], true))[0];
    return plan;
  };

  return useSWR(docRef.path, fetcher, {
    revalidateOnFocus: false,
  });
};
