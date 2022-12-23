import { BigNumber, BytesLike, constants, providers, utils } from 'ethers';
import useSWR from 'swr';

import { ERC20 } from '@/abis';
import { Plan } from '@/utils/get-plans-from-chain';
import { aggregate } from '@/utils/multicall';

const batchProvider = new providers.JsonRpcBatchProvider(
  import.meta.env.VITE_RPC_ENDPOINT_URL
);
const erc20Interface = new utils.Interface(ERC20);
const balanceOfFragment = 'balanceOf';

export type PlanWithBalance = Plan & { balance: BigNumber };

export const useCreatorPlansBalanceList = (basePlans?: Plan[]) => {
  const balancesOfAllPlans = async (plans: Plan[]): Promise<BigNumber[]> => {
    if (!plans || plans.length < 1) return [];

    const promises: Promise<unknown>[] = [];
    const balanceInput: MulticallInput[] = [];

    plans.forEach((plan) => {
      if (plan.tokenAddress === constants.AddressZero) {
        promises.push(batchProvider.getBalance(plan.lockAddress));
      } else {
        balanceInput.push({
          callData: erc20Interface.encodeFunctionData(balanceOfFragment, [
            plan.lockAddress,
          ]),
          target: plan.tokenAddress,
        });
      }
    });

    if (balanceInput.length > 0) {
      promises.push(aggregate(balanceInput, batchProvider));
    }

    const promiseResults = await Promise.all(promises);

    const nativeBalances = promiseResults.slice(0, -1) as BigNumber[];

    const { returnData: erc20BalancesData } = promiseResults.slice(-1)[0] as {
      returnData: BytesLike[];
    };
    const erc20Balances = erc20BalancesData.map((data) => {
      const balance = erc20Interface.decodeFunctionResult(
        balanceOfFragment,
        data
      )[0] as BigNumber;
      return balance;
    });

    let nativeCurrentIndex = 0;
    let erc20CurrentIndex = 0;

    const balances = plans.map((plan) => {
      const isNative = plan.tokenAddress === constants.AddressZero;
      if (isNative) {
        const balance = nativeBalances[nativeCurrentIndex];
        nativeCurrentIndex++;
        return balance;
      } else {
        const balance = erc20Balances[erc20CurrentIndex];
        erc20CurrentIndex++;
        return balance;
      }
    });

    return balances;
  };

  return useSWR([basePlans], balancesOfAllPlans, {
    revalidateOnFocus: false,
  });
};
