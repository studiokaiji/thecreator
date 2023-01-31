import {
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

export const useCreatorPosts = (
  creatorContractAddress: string,
  fetchLimit = 10
) => {
  const postsRef = getCreatorPostsCollectionRef(creatorContractAddress);

  const fetcher = async (_: string, createdAt?: Date) => {
    const docsSnapshot = await getDocs(
      query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(fetchLimit),
        startAfter(createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now())
      )
    );
    return docsSnapshot.docs.map((doc) => doc.data());
  };

  const getKey: SWRInfiniteKeyLoader = (
    _,
    data?: WithId<CreatorPostDocData>[]
  ) => {
    return [postsRef.path, data?.slice(-1)[0].createdAt];
  };

  const swr = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const loadMore = () => {
    swr.setSize(swr.size + 1);
  };

  return { ...swr, loadMore };
};
