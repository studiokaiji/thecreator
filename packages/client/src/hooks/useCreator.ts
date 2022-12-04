import { getDoc, getDocs, limit, query, where } from 'firebase/firestore';
import useSWR from 'swr';

import {
  getCreatorDocRef,
  getCreatorsCollectionRef,
} from '@/converters/creatorConverter';

type UseCreatorOpts = {
  id?: string;
  creatorAddress?: string;
};

export const useCreator = (opts: UseCreatorOpts) => {
  const fetcher = async ({ creatorAddress, id }: UseCreatorOpts = {}) => {
    if (!id && !creatorAddress) {
      return null;
    }

    if (id) {
      const creatorRef = getCreatorDocRef(id);
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
