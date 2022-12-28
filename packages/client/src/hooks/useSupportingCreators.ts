import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, BytesLike, utils } from 'ethers';
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
import { rpcProvider } from '@/rpc-provider';
import { aggregate } from '@/utils/multicall';

const TOKEN_OF_OWNER_BY_INDEX_FRAGMENT = 'tokenOfOwnerByIndex';
const KEY_EXPIRATION_TIMESTAMP_FOR_FRAGMENT = 'keyExpirationTimestampFor';

export const useSupportingCreators = (supportingCreatorsLimit = 0) => {
  const { currentUser } = useCurrentUser();

  const supportingCreatorsRef = useMemo(() => {
    if (!currentUser?.uid) return null;
    return getUserSupportingCreatorPlansCollectionRef(currentUser.uid);
  }, [currentUser?.uid]);

  const fetcher = async (
    uid: string,
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

    const supportingCreators: WithId<
      SupportingCreatorPlanDocData & { creator?: CreatorDocData }
    >[] = [];

    await Promise.allSettled(
      supportingCreatorsDocDatas.map(async (d, i) => {
        const creatorRef = getCreatorDocRef(d.creatorId);
        const doc = await getDoc(creatorRef);
        const creator = doc.data();
        supportingCreators[i] = { ...d, creator };
      })
    );

    const iface = new utils.Interface(PublicLockV11.abi);
    // 各PublicLockでuserAddressが保有しているトークンのIDを取得する

    const publicLocks = supportingCreators.map(
      ({ lockAddress }) => lockAddress
    );

    const tokenOfOwnerByIndexCallData = iface.encodeFunctionData(
      TOKEN_OF_OWNER_BY_INDEX_FRAGMENT,
      [uid, 0]
    );
    const tokenOfOwnerByIndexInputs: MulticallInput[] = publicLocks.map(
      (target) => ({
        callData: tokenOfOwnerByIndexCallData,
        target,
      })
    );

    const { returnData: tokenOfOwnerByIndexDatas } = await aggregate(
      tokenOfOwnerByIndexInputs,
      rpcProvider
    );

    const tokenIds = (tokenOfOwnerByIndexDatas as BytesLike[]).map(
      (indexData) =>
        iface.decodeFunctionResult(
          TOKEN_OF_OWNER_BY_INDEX_FRAGMENT,
          indexData
        )[0] as BigNumber
    );

    // 取得したトークンのIDからそのトークンの有効期限を取得する
    const keyExpirationTimestampForInputs: MulticallInput[] = tokenIds.map(
      (tokenId, i) => {
        const callData = iface.encodeFunctionData(
          KEY_EXPIRATION_TIMESTAMP_FOR_FRAGMENT,
          [tokenId]
        );
        const target = publicLocks[i];
        return { callData, target };
      }
    );

    const { returnData: keyExpirationTimestampForDatas } = await aggregate(
      keyExpirationTimestampForInputs,
      rpcProvider
    );

    const expirationTimestamps = (
      keyExpirationTimestampForDatas as BytesLike[]
    ).map(
      (data) =>
        iface.decodeFunctionResult(
          KEY_EXPIRATION_TIMESTAMP_FOR_FRAGMENT,
          data
        )[0] as BigNumber
    );

    const returnData = expirationTimestamps.map((timestamp, i) => {
      return {
        timestamp,
        tokenId: tokenIds[i],
        ...supportingCreators[i],
      };
    });

    return returnData;
  };

  const getKey = (
    _pageIndex: number,
    prevData?: WithId<SupportingCreatorPlanDocData>[]
  ) => {
    if (prevData && !prevData.length) return null;
    const supportedAt = prevData?.slice(-1)[0].supportedAt || new Date(0);
    return [
      currentUser?.uid,
      supportingCreatorsRef,
      supportingCreatorsLimit,
      supportedAt,
    ];
  };

  const {
    data: supportingCreatorsList,
    error,
    mutate,
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

  return { back, data, error, isFirst, isLast, mutate, next };
};
