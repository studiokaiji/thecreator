import { BigNumber } from '@ethersproject/bignumber';
import type { BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  BaseProvider,
  FallbackProvider,
  JsonRpcProvider,
} from '@ethersproject/providers';

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

const creatorAbi =
  '[{"inputs":[{"internalType":"address","name":"_customer","type":"address"}],"name":"subscriptions","outputs":[{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"lastMintedAt","type":"uint256"},{"internalType":"uint256","name":"planId","type":"uint256"},{"internalType":"uint256","name":"usage","type":"uint256"},{"internalType":"address","name":"nft","type":"address"},{"internalType":"string","name":"meta","type":"string"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct Product.Subscription","name":"_subsctiption","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_planId","type":"uint256"}],"name":"plans","outputs":[{"components":[{"internalType":"uint256","name":"usage","type":"uint256"},{"internalType":"address","name":"nft","type":"address"},{"internalType":"string","name":"meta","type":"string"}],"internalType":"struct Product.Plan","name":"_plan","type":"tuple"}],"stateMutability":"view","type":"function"}]';

const multicallAbi =
  '[{"constant":true,"inputs":[],"name":"getCurrentBlockTimestamp","outputs":[{"name":"timestamp","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"components":[{"name":"target","type":"address"},{"name":"callData","type":"bytes"}],"name":"calls","type":"tuple[]"}],"name":"aggregate","outputs":[{"name":"blockNumber","type":"uint256"},{"name":"returnData","type":"bytes[]"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getLastBlockHash","outputs":[{"name":"blockHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getEthBalance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockDifficulty","outputs":[{"name":"difficulty","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockGasLimit","outputs":[{"name":"gaslimit","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getCurrentBlockCoinbase","outputs":[{"name":"coinbase","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"blockNumber","type":"uint256"}],"name":"getBlockHash","outputs":[{"name":"blockHash","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"}]';

const endpoints = JSON.parse(
  process.env.CHAIN_RPC_ENDPOINTS as string
) as string[];

const defaultProvider = new FallbackProvider(
  endpoints.map((url) => new JsonRpcProvider(url)),
  1
);

export const checkSubscription = async (
  id: string,
  creatorContractAddress: string,
  planId: BigNumberish,
  provider: BaseProvider = defaultProvider
): Promise<[boolean, { subscription: Subscription; plan: Plan }]> => {
  // Getting Subscription and plan from Creator contract with multicall
  const contract = new Contract(creatorContractAddress, creatorAbi);
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

  const multicall = new Contract(
    process.env.MULTICALL_ADDRESS as string,
    multicallAbi,
    provider
  );
  const { returnData } = await multicall.aggregate(multicallInputs);

  const subscription: Subscription = returnData[0];
  const plan: Plan = returnData[1];

  // Check if the plan you are signing up for meets your plan requirements.
  return [
    subscription.isValid && BigNumber.from(plan.usage).gte(subscription.usage),
    {
      plan,
      subscription,
    },
  ];
};
