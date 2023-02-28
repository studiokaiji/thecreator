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

  const postsColRef = getCreatorPostsCollectionRef(creatorId);

  const isLastRef = useRef(false);

  const fetcher = async (
    plans: Plan[],
    colRef: CollectionReference<WithId<SupportingCreatorPlanDocData>>,
    createdAt?: Date
  ) => {
    const queries = [
      orderBy('createdAt', 'desc'),
      limit(fetchLimit),
      startAfter(createdAt ? Timestamp.fromDate(createdAt) : Timestamp.now()),
    ];

    if (account !== creatorId) {
      queries.unshift(where('isPublic', '==', true));
    }

    const docsSnapshot = await getDocs(query(postsColRef, ...queries));

    const posts = docsSnapshot.docs.map((doc) => doc.data());

    if (docsSnapshot.empty || posts.length < fetchLimit) {
      isLastRef.current = true;
    }

    if (docsSnapshot.empty) {
      return [];
    }

    const allowedPlans = await getAllowedPlans(plans, creatorId, colRef);

    const getDownloadSignedUrlsRequest: {
      posts: { creatorId: string; postId: string }[];
    } = { posts: [] };

    posts
      .filter((d) => d.contents[0].key)
      .forEach(({ borderLockAddress, id }) => {
        if (
          account !== creatorId &&
          !checkBorder(allowedPlans, borderLockAddress)
        ) {
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

    const createdAt = data?.slice(-1)[0].createdAt || null;
    return [
      basePlans,
      supportingCreatorPlansColRef,
      createdAt,
      `${postsColRef.path}?limit=${fetchLimit}&createdAt_startAfter=${createdAt}`,
    ];
  };

  const swr = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const data = useMemo(() => swr.data?.flat(), [swr.data]);

  const isLast = isLastRef.current;

  const loadMore = () => {
    if (isLast) return;
    swr.setSize(swr.size + 1);
  };

  return { ...swr, data, isLast, loadMore };
};
