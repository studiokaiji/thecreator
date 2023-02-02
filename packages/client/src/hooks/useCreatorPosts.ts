import {
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { useAccessibleCreatorPlans } from './useAccessibleCreatorPlans';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';
import { functions } from '@/firebase';
import { Plan } from '@/utils/get-plans-from-chain';

export const useCreatorPosts = (creatorId: string, fetchLimit = 10) => {
  const postsRef = getCreatorPostsCollectionRef(creatorId);

  const { data: accessibleCreatorPlans } = useAccessibleCreatorPlans(creatorId);

  const checkBorder = (plans: Plan[], borderLockAddress: string) => {
    if (!plans) throw Error();
    return plans.map(({ id }) => id).includes(borderLockAddress);
  };

  const fetcher = async (
    _: string,
    createdAt?: Date,
    accessiblePlans?: Plan[]
  ) => {
    if (!accessiblePlans) return [];

    const docsSnapshot = await getDocs(
      query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(fetchLimit),
        startAfter(createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now())
      )
    );

    const posts = docsSnapshot.docs.map((doc) => doc.data());

    const getDownloadSignedUrlsRequest: {
      posts: { creatorId: string; postId: string }[];
    } = { posts: [] };

    posts
      .filter((d) => d.contents[0].key)
      .forEach(({ borderLockAddress, id }) => {
        if (!checkBorder(accessiblePlans, borderLockAddress)) {
          return;
        }
        getDownloadSignedUrlsRequest.posts.push({
          creatorId,
          postId: id,
        });
      });

    const { data: downloadUrls } = await httpsCallable<
      unknown,
      GetDownloadSignedUrlResponse
    >(
      functions,
      'getDownloadSignedUrls'
    )(getDownloadSignedUrlsRequest);

    downloadUrls.forEach(({ postId, urls }) => {
      const postIndex = posts.findIndex(({ id }) => id === postId);
      const post = posts[postIndex];
      post.contents = post.contents.map((content, i) => ({
        ...content,
        url: urls[i],
      }));
      posts[postIndex] = post;
      console.log('post', post);
    });

    return posts;
  };

  const getKey: SWRInfiniteKeyLoader = (
    _,
    data?: WithId<CreatorPostDocData>[]
  ) => {
    return [
      postsRef.path,
      data?.slice(-1)[0].createdAt,
      accessibleCreatorPlans,
    ];
  };

  const swr = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const data = swr.data?.flat();

  const loadMore = () => {
    swr.setSize(swr.size + 1);
  };

  return { ...swr, data, loadMore };
};
