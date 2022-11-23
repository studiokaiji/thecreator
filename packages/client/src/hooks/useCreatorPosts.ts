import {
  collection,
  getDocs,
  query,
  QueryConstraint,
} from 'firebase/firestore';
import useSWR from 'swr';

import { creatorConverter } from '@/converters/creatorConverter';
import { db } from '@/firebase';

export const useCreatorPosts = async (
  creatorContractAddress: string,
  queries: QueryConstraint[] = []
) => {
  const postsRef = collection(
    db,
    `/creators/${creatorContractAddress}/posts`
  ).withConverter(creatorConverter);

  const fetcher = async () => {
    const docsSnapshot = await getDocs(query(postsRef, ...queries));
    docsSnapshot.docs
  };

  return useSWR(postsRef.path, fetcher);
};
