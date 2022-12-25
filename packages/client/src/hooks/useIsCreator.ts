import { getDocs, limit, query, where } from 'firebase/firestore';
import useSWR from 'swr';

import { getCreatorsCollectionRef } from './../converters/creatorConverter';
import { useCurrentUser } from './useCurrentUser';

const IS_CREATOR_LOCAL_STORAGE_KEY = 'is_creator';

const getKey = (address: string) =>
  `${IS_CREATOR_LOCAL_STORAGE_KEY}_${address}`;

export const useIsCreator = (address?: string) => {
  const { currentUser } = useCurrentUser();

  const handler = async (addr?: string) => {
    if (!addr) return null;

    const flag = getIsCreatorFlag(addr);
    if (flag !== null) {
      return flag;
    }

    const creatorsCollectionRef = getCreatorsCollectionRef();
    const creatorQuery = query(
      creatorsCollectionRef,
      where('creatorAddress', '==', addr),
      limit(1)
    );
    const snapshot = await getDocs(creatorQuery);
    const isCreator = !!(
      snapshot.docs &&
      snapshot.docs[0] &&
      snapshot.docs[0].exists()
    );
    setIsCreatorFlag(addr, isCreator);

    return isCreator;
  };

  return {
    ...useSWR(address || currentUser?.uid, handler, {
      revalidateOnFocus: false,
    }),
    getIsCreatorFlag,
    setIsCreatorFlag,
  };
};

export const setIsCreatorFlag = (address: string, value: boolean | null) => {
  localStorage.setItem(
    getKey(address),
    String(value === null ? null : value ? 1 : 0)
  );
};

export const getIsCreatorFlag = (address: string) => {
  const strVal = localStorage.getItem(getKey(address));
  if (strVal === null) return null;
  return !!Number(strVal);
};