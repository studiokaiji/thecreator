import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  BaseProvider,
  FallbackProvider,
  JsonRpcProvider,
} from '@ethersproject/providers';

import { Multicall__factory } from '@contracts';
import { constants, utils } from 'ethers';
import { functionsConfig } from '@/instances';

export type Subscription = {
  tokenId: BigNumber;
  balance: BigNumber;
  lastMintedAt: BigNumber;
  planId: BigNumber;
  usage: BigNumber;
  nft: string;
  meta: string;
  isValid: boolean;
};

export type Plan = {
  usage: BigNumber;
  nft: string;
  meta: string;
};

const getProviderFromEnv = () => {
  const endpoints: string[] = functionsConfig.nodeProviderEndpoints;
  return new FallbackProvider(
    endpoints.map((url) => new JsonRpcProvider(url)),
    1
  );
};

export const checkSubscription = async (
  holderAddress: string,
  holderLockAddress: string,
  borderLockAddress: string,
  provider: BaseProvider = getProviderFromEnv(),
  multicallContractAddress = process.env.MULTICALL_ADDRESS
) => {
  if (!multicallContractAddress) {
    throw Error(
      'If process.env.MULTICALL_ADDRESS does not exist, multicallContractAddress is required.'
    );
  }

  if (!borderLockAddress || borderLockAddress === constants.AddressZero) {
    return true;
  }

  const multicall = new Contract(
    multicallContractAddress,
    Multicall__factory.abi,
    provider
  );

  const lockIface = new utils.Interface(PublicLockV11.abi);

  const multicallInputs: MulticallInput[] = [];

  multicallInputs.push({
    target: borderLockAddress,
    callData: lockIface.encodeFunctionData('keyPrice'),
  });
  multicallInputs.push({
    target: holderLockAddress,
    callData: lockIface.encodeFunctionData('keyPrice'),
  });
  multicallInputs.push({
    target: holderLockAddress,
    callData: lockIface.encodeFunctionData('getHasValidKey', [holderAddress]),
  });

  const { returnData } = await multicall.callStatic.aggregate(multicallInputs);

  const borderLockKeyPrice = lockIface.decodeFunctionResult(
    'keyPrice',
    returnData[0]
  )[0] as BigNumber;
  const holderLockKeyPrice = lockIface.decodeFunctionResult(
    'keyPrice',
    returnData[1]
  )[0] as BigNumber;

  if (borderLockKeyPrice.gt(holderLockKeyPrice)) {
    return false;
  }

  const holderHasValidKey = lockIface.decodeFunctionResult(
    'getHasValidKey',
    returnData[2]
  )[0] as boolean;

  return holderHasValidKey;
};
