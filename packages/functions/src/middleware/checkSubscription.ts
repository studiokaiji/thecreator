import { BigNumber } from '@ethersproject/bignumber';
import type { BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers';

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

const creatorAbi =
  '[{"inputs":[{"internalType":"address","name":"_customer","type":"address"}],"name":"subscriptions","outputs":[{"components":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"balance","type":"uint256"},{"internalType":"uint256","name":"lastMintedAt","type":"uint256"},{"internalType":"uint256","name":"planId","type":"uint256"},{"internalType":"uint256","name":"usage","type":"uint256"},{"internalType":"address","name":"nft","type":"address"},{"internalType":"string","name":"meta","type":"string"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct Product.Subscription","name":"_subsctiption","type":"tuple"}],"stateMutability":"view","type":"function"}]';

const endpoints = ['127.0.0.1:8545'];
const provider = new FallbackProvider(
  endpoints.map((url) => new JsonRpcProvider(url)),
  1
);

export const checkSubscription = async (
  id: string,
  creatorContractAddress: string,
  usage: BigNumberish
) => {
  // Getting Subscription from Creator Contracts
  const contract = new Contract(creatorContractAddress, creatorAbi, provider);
  const subscription: Subscription = await contract.subscriptions(id);
  // Check if the plan you are signing up for meets your plan requirements.
  return subscription.isValid && BigNumber.from(usage).gte(subscription.usage);
};
