import {
  CollectionReference,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useMemo, useRef } from 'react';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { useCreatorPlans } from './useCreatorPlans';
import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';
import { getUserSupportingCreatorPlansCollectionRef } from '@/converters/userSupportingCreatorConverter';
import { functions } from '@/firebase';
import { Plan } from '@/utils/get-plans-from-chain';

const getAllowedPlans = async (
  plans: Plan[],
  creatorId: string,
  ref: CollectionReference<WithId<SupportingCreatorPlanDocData>>
) => {
  const supportingCreatorDocsSnapshot = await getDocs(
    query(ref, where('creatorId', '==', creatorId))
  );
  if (supportingCreatorDocsSnapshot.empty) {
    return [];
  }

  const { lockAddress } = supportingCreatorDocsSnapshot.docs[0].data();

  const supportingPlan = plans.filter(({ id }) => id === lockAddress)[0];

  const allowedPlans = plans.filter(
    ({ keyPrice }) => keyPrice <= supportingPlan.keyPrice
  );

  return allowedPlans;
};

const checkBorder = (allowedPlans: Plan[], borderLockAddress: string) => {
  return !!allowedPlans.find(({ id }) => id === borderLockAddress);
};

export const useCreatorPosts = (creatorId: string, fetchLimit = 10) => {
  const { account } = useWallet();

  const supportingCreatorPlansColRef = useMemo(() => {
    if (!account) return null;
    return getUserSupportingCreatorPlansCollectionRef(account);
  }, [account]);

  const { data: basePlans } = useCreatorPlans(creatorId);

  const postsRef = getCreatorPostsCollectionRef(creatorId);

  const isLastRef = useRef(false);

  const fetcher = async (
    plans: Plan[],
    colRef: CollectionReference<WithId<SupportingCreatorPlanDocData>>,
    createdAt?: Date
  ) => {
    const allowedPlans = await getAllowedPlans(plans, creatorId, colRef);

    const docsSnapshot = await getDocs(
      query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(fetchLimit),
        startAfter(createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now())
      )
    );

    const posts = docsSnapshot.docs.map((doc) => doc.data());

    if (docsSnapshot.empty || posts.length < fetchLimit) {
      isLastRef.current = true;
    }

    const getDownloadSignedUrlsRequest: {
      posts: { creatorId: string; postId: string }[];
    } = { posts: [] };

    posts
      .filter((d) => d.contents[0].key)
      .forEach(({ borderLockAddress, id }) => {
        if (!checkBorder(allowedPlans, borderLockAddress)) {
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
    });

    return posts;
  };

  const getKey: SWRInfiniteKeyLoader = (
    _,
    data?: WithId<CreatorPostDocData>[]
  ) => {
    if (!basePlans || !supportingCreatorPlansColRef) return null;
    return [
      basePlans,
      supportingCreatorPlansColRef,
      data?.slice(-1)[0].createdAt,
      `${postsRef.path}?limit=${fetchLimit}`,
    ];
  };

  const swr = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const data = useMemo(() => swr.data?.flat(), [swr.data]);

  const loadMore = () => {
    swr.setSize(swr.size + 1);
  };

  return { ...swr, data, isLast: isLastRef.current, loadMore };
};
