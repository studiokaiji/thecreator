import { BigNumber } from '@ethersproject/bignumber';
import type { BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  BaseProvider,
  FallbackProvider,
  JsonRpcProvider,
} from '@ethersproject/providers';

import { Multicall__factory } from '../../../hardhat/typechain-types/factories/contracts/multicall/multicall.sol';
import { TheCreatorProduct__factory } from '../../../hardhat/typechain-types/factories/contracts/the-creator-product.sol';

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
  if (!process.env.CHAIN_RPC_ENDPOINTS) {
    throw Error('Need process.env.CHAIN_RPC_ENDPOINTS');
  }

  const endpoints = JSON.parse(
    process.env.CHAIN_RPC_ENDPOINTS || '[]'
  ) as string[];

  return new FallbackProvider(
    endpoints.map((url) => new JsonRpcProvider(url)),
    1
  );
};

export const checkSubscription = async (
  id: string,
  creatorContractAddress: string,
  planId: BigNumberish,
  provider: BaseProvider = getProviderFromEnv(),
  multicallContractAddress = process.env.MULTICALL_ADDRESS
): Promise<[boolean, { subscription: Subscription; plan: Plan }]> => {
  // Getting Subscription and plan from Creator contract with multicall
  const contract = TheCreatorProduct__factory.getContract(
    creatorContractAddress,
    TheCreatorProduct__factory.abi
  );
  const multicallInputs = [
    {
      callData: contract.interface.encodeFunctionData('subscriptions', [id]),
      target: creatorContractAddress,
    },
    {
      callData: contract.interface.encodeFunctionData('plans', [planId]),
      target: creatorContractAddress,
    },
  ];

  if (!multicallContractAddress) {
    throw Error(
      'If process.env.MULTICALL_ADDRESS does not exist, multicallContractAddress is required.'
    );
  }

  const multicall = new Contract(
    multicallContractAddress,
    Multicall__factory.abi,
    provider
  );
  const { returnData } = await multicall.callStatic.aggregate(multicallInputs);

  const subscription = contract.interface.decodeFunctionResult(
    'subscriptions',
    returnData[0]
  )[0] as Subscription;

  const plan = contract.interface.decodeFunctionResult(
    'plans',
    returnData[1]
  )[0] as Plan;

  // Check if the plan you are signing up for meets your plan requirements.
  return [
    subscription.isValid && plan.usage.gte(subscription.usage),
    {
      plan,
      subscription,
    },
  ];
};
