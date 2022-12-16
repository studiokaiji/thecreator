import { getDocs } from 'firebase/firestore';
import useSWR from 'swr';

import { getCreatorPlansCollectionRef } from '@/converters/creatorPlanConverter';
import { getPlansFromChain } from '@/utils/get-plans-from-chain';

export const useCreatorPlans = (creatorId?: string) => {
  const fetcher = async (docId?: string) => {
    if (!docId) return undefined;

    const colRef = getCreatorPlansCollectionRef(docId);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return [];

    const docPlans = snapshot.docs.map((doc) => doc.data());
    const plans = await getPlansFromChain(docPlans, true);

    return plans;
  };

  return useSWR(creatorId, fetcher, { revalidateOnFocus: false });
};
