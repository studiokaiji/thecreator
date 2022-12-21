import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  QueryConstraint,
} from 'firebase/firestore';
import useSWR from 'swr';

import { creatorConverter } from '@/converters/creatorConverter';
import { db } from '@/firebase';

export const useCreatorPosts = (
  creatorContractAddress: string,
  queries: QueryConstraint[] = [limit(10), orderBy('createdAt', 'desc')]
) => {
  const postsRef = collection(
    db,
    `/creators/${creatorContractAddress}/posts`
  ).withConverter(creatorConverter);

  const fetcher = async () => {
    const docsSnapshot = await getDocs(query(postsRef, ...queries));
    return docsSnapshot.docs.map((doc) => doc.data);
  };

  return useSWR(postsRef.path, fetcher, {
    revalidateOnFocus: false,
  });
};
