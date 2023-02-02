import { CollectionReference, getDocs, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useCreatorPlans } from './useCreatorPlans';
import { useWallet } from './useWallet';

import { getUserSupportingCreatorPlansCollectionRef } from '@/converters/userSupportingCreatorConverter';

export const useAccessibleCreatorPlans = (creatorId: string) => {
  const { account } = useWallet();

  const supportingCreatorPlanDocRef = useMemo(() => {
    if (!account) return null;
    return getUserSupportingCreatorPlansCollectionRef(account);
  }, [account]);

  const { data: plans } = useCreatorPlans(creatorId);

  const fetcher = async (
    colRef: CollectionReference<WithId<SupportingCreatorPlanDocData>>,
    id: string
  ) => {
    if (!plans) return null;

    const docsSnapshot = await getDocs(
      query(colRef, where('creatorId', '==', id))
    );
    if (docsSnapshot.empty) {
      return null;
    }

    const { lockAddress } = docsSnapshot.docs[0].data();

    const supportingPlan = plans.filter(({ id }) => id === lockAddress)[0];

    const allowedPlans = plans.filter(
      ({ keyPrice }) => keyPrice <= supportingPlan.keyPrice
    );

    return allowedPlans;
  };

  return useSWR([supportingCreatorPlanDocRef, creatorId], fetcher);
};
