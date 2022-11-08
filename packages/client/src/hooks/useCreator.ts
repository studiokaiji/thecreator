import { getDoc } from 'firebase/firestore';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import { getCreatorDocRef } from '@/converters/creators';

export const useCreator = (address?: string) => {
  if (!address) {
    const { currentUser } = useCurrentUser();
    if (currentUser) {
      address = currentUser.uid;
    } else if (currentUser === null) {
      throw Error();
    }
  }

  const fetcher = async (addr: string) => {
    const ref = getCreatorDocRef(addr);
    const snapshot = await getDoc(ref);
    return snapshot.data();
  };

  return useSWR(() => address, fetcher, { revalidateOnFocus: false });
};
