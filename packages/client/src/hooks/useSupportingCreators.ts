import {
  CollectionReference,
  endBefore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';
import { useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';

import { getCreatorDocRef } from './../converters/creatorConverter';
import { useCurrentUser } from './useCurrentUser';

import { getUserSupportingCreatorPlansCollectionRef } from '@/converters/userSupportingCreatorConverter';

export const useSupportingCreators = (supportingCreatorsLimit = 0) => {
  const { currentUser } = useCurrentUser();

  const supportingCreatorsRef = useMemo(() => {
    if (!currentUser?.uid) return null;
    return getUserSupportingCreatorPlansCollectionRef(currentUser.uid);
  }, [currentUser?.uid]);

  const fetcher = async (
    colRef: CollectionReference<WithId<SupportingCreatorPlanDocData>>,
    docsLimit: number,
    supportedAt: Date
  ) => {
    const supportingCreatorsQueries = [
      orderBy('supportedAt', 'desc'),
      endBefore(Timestamp.fromDate(supportedAt)),
    ];
    if (docsLimit) {
      supportingCreatorsQueries.push(limit(docsLimit));
    }

    const supportingCreatorDocsSnapshot = await getDocs(
      query(colRef, ...supportingCreatorsQueries)
    );
    const supportingCreatorsDocDatas = supportingCreatorDocsSnapshot.docs.map(
      (doc) => doc.data()
    );

    const returnData: WithId<
      SupportingCreatorPlanDocData & { creator?: CreatorDocData }
    >[] = [];

    await Promise.allSettled(
      supportingCreatorsDocDatas.map(async (d, i) => {
        const creatorRef = getCreatorDocRef(d.creatorId);
        const doc = await getDoc(creatorRef);
        const creator = doc.data();
        returnData[i] = { ...d, creator };
      })
    );

    return returnData;
  };

  const getKey = (
    _pageIndex: number,
    prevData?: WithId<SupportingCreatorPlanDocData>[]
  ) => {
    if (prevData && !prevData.length) return null;
    const supportedAt = prevData?.slice(-1)[0].supportedAt || new Date(0);
    return [supportingCreatorsRef, supportingCreatorsLimit, supportedAt];
  };

  const {
    data: supportingCreatorsList,
    error,
    setSize,
    size,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnFocus: false,
  });

  const back = () => {
    if (size <= 1) return;
    setSize(size - 1);
  };

  const next = () => {
    setSize(size + 1);
  };

  const isFirst = size <= 1;

  const isLast = supportingCreatorsList
    ? supportingCreatorsList.filter(
        (list) => list.length < supportingCreatorsLimit
      ).length > 0
    : false;

  const data = supportingCreatorsList ? supportingCreatorsList.flat() : null;

  return { back, data, error, isFirst, isLast, next };
};
