import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, BytesLike, constants, Contract } from 'ethers';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';

import { useWallet } from '@/hooks/useWallet';
import { aggregate } from '@/utils/multicall';

const lockKeyDetailInputKeys = [
  'keyExpirationTimestampFor',
  'ownerOf',
] as const;

type LockSettings = {
  address: string;
  startLockKeyId: BigNumber | null;
};

export type LockKeyDetail = {
  keyExpirationTimestampFor: BigNumber;
  ownerOf: string;
  isValidKey: boolean;
  id: BigNumber;
};

export const usePublicLockSupporters = (
  publicLock?: string,
  fetchLimit = 20
) => {
  const { library } = useWallet();

  const getKey: SWRInfiniteKeyLoader = (_, data: LockKeyDetail[]) => {
    const lastId = data && data.length ? data[0].id : null;
    const lock: LockSettings = {
      address: publicLock || constants.AddressZero,
      startLockKeyId: lastId ? lastId.add(1) : null,
    };
    return [lock, fetchLimit];
  };

  const fetcher = async (
    { address, startLockKeyId }: LockSettings,
    limit: number
  ): Promise<{ results: LockKeyDetail[]; totalSupply: BigNumber } | null> => {
    if (!library || address === constants.AddressZero) return null;

    const signer = library.getSigner();
    if (
      signer.provider.network.chainId !== Number(import.meta.env.VITE_CHAIN_ID)
    ) {
      return null;
    }

    const contract = new Contract(address, PublicLockV11.abi, signer);

    const totalSupply: BigNumber = await contract.totalSupply();
    const total = totalSupply.toNumber();

    startLockKeyId ??= totalSupply;

    const numberToBeFetched =
      totalSupply.add(startLockKeyId).sub(totalSupply).toNumber() > limit
        ? limit
        : total;

    // Get lockKey detail
    const lockKeyDetailInputs: MulticallInput[] = [];

    for (let i = 0; i < numberToBeFetched; i++) {
      const lockKeyId = startLockKeyId.sub(i);
      // Add lockKey detail inputs
      lockKeyDetailInputKeys.forEach((inputKey) => {
        const callData = contract.interface.encodeFunctionData(inputKey, [
          lockKeyId,
        ]);
        lockKeyDetailInputs.push({
          callData,
          target: address,
        });
      });
    }

    const { returnData: lockKeyDetailDatas }: { returnData: BytesLike[] } =
      await aggregate(lockKeyDetailInputs, signer);

    const parsedResults: {
      keyExpirationTimestampFor: BigNumber;
      ownerOf: string;
    }[] = [];

    lockKeyDetailDatas.forEach((data, i) => {
      const inputKeyIndex = i % lockKeyDetailInputKeys.length;

      const resultIndex = Math.floor(i / lockKeyDetailInputKeys.length);
      if (!resultIndex) {
        parsedResults[resultIndex] = {
          keyExpirationTimestampFor: BigNumber.from(0),
          ownerOf: '',
        };
      }

      const key = lockKeyDetailInputKeys[inputKeyIndex];
      const funcResult = contract.interface.decodeFunctionResult(key, data)[0];

      parsedResults[resultIndex][key] = funcResult;
    });

    const blockTimestamp = (
      await signer.provider.getBlock(await signer.provider.getBlockNumber())
    ).timestamp;

    const lockKeyDetailResults = parsedResults.map((r, i) => ({
      ...r,
      id: startLockKeyId?.sub(i) || BigNumber.from(0),
      isValidKey:
        r.keyExpirationTimestampFor.gte(blockTimestamp) &&
        r.ownerOf !== constants.AddressZero,
    }));

    return { results: lockKeyDetailResults, totalSupply };
  };

  return useSWRInfinite(getKey, fetcher, { revalidateOnFocus: false });
};
