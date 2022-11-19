import { getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import {
  getCreatorDocRef,
  getCreatorsCollectionRef,
} from '@/converters/creators';

type UseCreatorOpts = {
  contractAddress?: string;
  creatorAddress?: string;
};

export const useCreator = (opts: UseCreatorOpts = {}) => {
  if (!opts.contractAddress && !opts.creatorAddress) {
    const { currentUser } = useCurrentUser();
    if (currentUser) {
      opts.creatorAddress = currentUser.uid;
    } else if (currentUser === null) {
      throw Error();
    }
  }

  const fetcher = async ({
    contractAddress,
    creatorAddress,
  }: UseCreatorOpts = {}) => {
    if (contractAddress) {
      const creatorRef = getCreatorDocRef(contractAddress);
      const snapshot = await getDoc(creatorRef);
      const data = snapshot.data();
      if (!data) {
        throw Error('Creator data does not exist');
      }
      return data;
    } else {
      const creatorsCollectionRef = getCreatorsCollectionRef();
      const creatorQuery = query(
        creatorsCollectionRef,
        where('creatorAddress', '==', creatorAddress),
        limit(1)
      );
      const snapshot = await getDocs(creatorQuery);
      const data = snapshot.docs[0].data();
      if (!data) {
        throw Error('Creator data does not exist');
      }
      return data;
    }
  };

  return useSWR(opts, fetcher, { revalidateOnFocus: false });
};
