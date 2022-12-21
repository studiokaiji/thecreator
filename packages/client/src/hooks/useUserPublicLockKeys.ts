import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, BytesLike, utils } from 'ethers';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import { MulticallInput } from '#types/multicall/MulticallInput';
import { rpcProvider } from '@/rpc-provider';
import { aggregate } from '@/utils/multicall';

const TOKEN_OF_OWNER_BY_INDEX_FRAGMENT = 'tokenOfOwnerByIndex';
const KEY_EXPIRATION_TIMESTAMP_FOR_FRAGMENT = 'keyExpirationTimestampFor';

export const useUserPublicLockKeys = (publicLockAddresses: string[] = []) => {
  const { currentUser } = useCurrentUser();

  const fetcher = async (userAddress: string, publicLocks: string[]) => {
    if (!userAddress || publicLockAddresses.length < 1) return null;

    const iface = new utils.Interface(PublicLockV11.abi);
    // 各PublicLockでuserAddressが保有しているトークンのIDを取得する
    const tokenOfOwnerByIndexCallData = iface.encodeFunctionData(
      TOKEN_OF_OWNER_BY_INDEX_FRAGMENT,
      [userAddress, 0]
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

    const returnData = expirationTimestamps.map((timestamp, i) => ({
      timestamp,
      tokenId: tokenIds[i],
    }));

    return returnData;
  };

  return useSWR([currentUser?.uid, publicLockAddresses], fetcher, {
    revalidateOnFocus: false,
  });
};
