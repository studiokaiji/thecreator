import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, BytesLike, providers, utils } from 'ethers';
import useSWRInfinite from 'swr/infinite';

import { useWallet } from './useWallet';

import { aggregate } from '@/utils/multicall';

type UseCreatorSuportersProps = {
  lockAddresses?: string[];
  limitPerLock?: number;
};

const lockKeyDetailInputKeys = [
  'keyExpirationTimestampFor',
  'keyManagerOf',
] as const;

// @dev
// 各lockのtotalSupplyを取得して、その値を元に降順でトークンをlimitPerLock分取得する
// (limitPerLockにトークン数が満たない場合は全てのトークン)。
// 取得したトークンをBlockNumberとトランザクションのインデックスを使って降順に並べる。
// トークンの基本情報を

export const usePublicLocksSupporters = ({
  limitPerLock = 15,
  lockAddresses = [],
}: UseCreatorSuportersProps) => {
  const { library } = useWallet();

  const getKey = (pageIndex: number) => {};

  const handler = async (
    locks: {
      address: string;
      startlockKeyId: BigNumber;
    }[],
    perLimit: number,
    provider: providers.Web3Provider
  ) => {
    if (!provider) return null;
    if (locks.length < 1 || perLimit < 1) return [];

    const iface = new utils.Interface(PublicLockV11.abi);

    // Get total supplys
    const totalSupplyInputs: MulticallInput[] = locks.map(({ address }) => {
      const callData = iface.encodeFunctionData('totalSupply');
      const target = address;
      return { callData, target };
    });

    const { returnData: totalSupplyDatas }: { returnData: BytesLike[] } =
      await aggregate(totalSupplyInputs, provider);

    const totalSupplys = totalSupplyDatas.map(
      (data) => iface.decodeFunctionResult('totalSupply', data)[0] as BigNumber
    );

    // Get lockKey detail
    const lockKeyDetailInputs: MulticallInput[] = [];
    const numberToBeFetchedPerLocks: number[] = [];

    totalSupplys.forEach((t, i) => {
      const total = t.toNumber();
      const numberToBeFetched = total > perLimit ? perLimit : total;
      numberToBeFetchedPerLocks[i] = numberToBeFetched;

      const target = locks[i].address;

      for (let i = 0; i < numberToBeFetched; i++) {
        const lockKeyId = total - i;
        // Add lockKey detail inputs
        lockKeyDetailInputKeys.forEach((inputKey) => {
          const callData = iface.encodeFunctionData(inputKey, [lockKeyId]);
          lockKeyDetailInputs.push({
            callData,
            target,
          });
        });
      }
    });

    const { returnData: lockKeyDetailDatas }: { returnData: BytesLike[] } =
      await aggregate(lockKeyDetailInputs, provider);

    const lockKeyDetailResults: {
      [lockAddress: string]: {
        details: {
          keyExpirationTimestampFor: BigNumber;
          keyManagerOf: string;
          lockKeyId: number;
        }[];
      };
    } = {};

    const getLockIndex = (flattenIndex: number) => {
      for (let i = 0; i < numberToBeFetchedPerLocks.length; i++) {
        if (numberToBeFetchedPerLocks[i] > flattenIndex) {
          // lockKeyの取得数よりflattenIndexが小さい場合
          return i;
        }
      }
      throw new Error('Invalid flatten index');
    };

    lockKeyDetailDatas.forEach((data, i) => {
      const lockIndex = getLockIndex(i);
      const lockAddress = locks[lockIndex].address;
      const resultIndex = Math.floor(i / 2);
      const inputKeyIndex = i % lockKeyDetailDatas.length;

      const key = lockKeyDetailInputKeys[inputKeyIndex];

      const result = iface.decodeFunctionResult(key, data)[0];
      lockKeyDetailResults[lockAddress].details[resultIndex][key] = result;

      lockKeyDetailResults[lockAddress].details[resultIndex].lockKeyId ??= ;
    });

    return lockKeyDetailResults;
  };

  useSWRInfinite([limitPerLock, library], handler, {
    revalidateOnFocus: false,
  });
};
