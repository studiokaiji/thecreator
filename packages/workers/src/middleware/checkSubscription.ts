import { BigNumber } from '@ethersproject/bignumber';
import type { BigNumberish } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { FallbackProvider, JsonRpcProvider } from '@ethersproject/providers';
import type { Context } from 'hono';

export interface CheckSubsctiptionEnv {
  CHAIN_ID: number;
  CHAIN_RPC_ENDPOINTS: string[];
  SUBSCRIPTION_CACHE_KV: KVNamespace;
}

export type CheckSubscriptionContext = Context<
  string,
  { Bindings: CheckSubsctiptionEnv }
>;

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

export const checkSubscription = async (
  c: CheckSubscriptionContext,
  id: string,
  creatorContractAddress: string,
  usage: BigNumberish,
  noCache = false
) => {
  // Check exist of access flags on KV
  const cacheKey = `${creatorContractAddress}/${id}`;

  const cachedUsage = noCache
    ? null
    : await c.env.SUBSCRIPTION_CACHE_KV.get(cacheKey, 'text');

  // If the cached usage exists, compare it to the passed usage and return true if it is greater than or equal to the passed usage
  if (cachedUsage) {
    return BigNumber.from(usage).gte(cachedUsage);
  }

  const provider = new FallbackProvider(
    c.env.CHAIN_RPC_ENDPOINTS.map((url) => new JsonRpcProvider(url)),
    1
  );

  // Getting Subscription from Creator Contracts
  const contract = new Contract(creatorContractAddress, creatorAbi, provider);
  const subscription: Subscription = await contract.subscriptions(id);

  // Save cache to KV
  await c.env.SUBSCRIPTION_CACHE_KV.put(
    cacheKey,
    subscription.usage.toString()
  );

  // Check if the plan you are signing up for meets your plan requirements.
  return subscription.isValid && BigNumber.from(usage).gte(subscription.usage);
};
