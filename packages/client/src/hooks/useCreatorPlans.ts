import { getDocs } from 'firebase/firestore';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import { getCreatorPlansCollectionRef } from '@/converters/creatorPlanConverter';
import { getPlansFromChain } from '@/utils/get-plans-from-chain';

export const useCreatorPlans = (creatorId?: string) => {
  const { checking, currentUser } = useCurrentUser();

  const fetcher = async (creatorId: string, checkingUser: boolean) => {
    if (!creatorId || checkingUser) return undefined;

    const colRef = getCreatorPlansCollectionRef(creatorId);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) return [];

    const docPlans = snapshot.docs.map((doc) => doc.data());
    const plans = await getPlansFromChain(docPlans, currentUser?.uid);

    return plans;
  };

  return useSWR([creatorId, checking], fetcher, {
    revalidateOnFocus: false,
  });
};
