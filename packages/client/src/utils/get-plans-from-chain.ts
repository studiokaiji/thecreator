import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, constants, Contract } from 'ethers';

import { aggregate } from './multicall';

import { CreatorPlanDoc } from '#types/firestore/creator/plan';
import { currencies } from '@/constants';
import { rpcProvider } from '@/rpc-provider';

export const getPlansFromChain = async <T extends boolean = true>(
  docPlans: WithId<CreatorPlanDoc>[],
  excludeInvalidPlans: T
): Promise<Plan<T>[]> => {
  const checkResults = await checkPlans(docPlans);

  const filtered = excludeInvalidPlans
    ? checkResults.filter((result) => result.ok)
    : (checkResults as unknown as PlanCheckResult<true>[]);

  const plans = filtered.map((result, i) => ({
    ...docPlans[i],
    ...result,
  }));

  const sorted = sortPlans(plans);

  return sorted as Plan<T>[];
};

type Input = { target: string; callData: string };

type CurrencyWithUnknown = typeof currencies[number] | 'Unknown';

type PlanCheckResult<T extends boolean> = {
  currency: T extends true ? typeof currencies[number] : CurrencyWithUnknown;
  keyPrice: BigNumber;
  ok: boolean;
};

export type Plan<T extends boolean = true> = WithId<
  CreatorPlanDoc & PlanCheckResult<T>
>;

const lockInputKeys = [
  'tokenAddress',
  'keyPrice',
  'expirationDuration',
] as const;

const checkPlans = async (docPlans: WithId<CreatorPlanDoc>[]) => {
  if (docPlans.length < 1) return [];

  const contracts = docPlans
    .filter(({ lockAddress }) => lockAddress)
    .map(({ lockAddress }) => new Contract(lockAddress, PublicLockV11.abi));

  const lockInputs: Input[] = [];
  contracts.forEach((contract) => {
    lockInputKeys.forEach((k) => {
      const target = contract.address;
      const callData = contract.interface.encodeFunctionData(k);
      lockInputs.push({ callData, target });
    });
  });

  const { returnData: lockData } = await aggregate(lockInputs, rpcProvider);

  const checkResults: PlanCheckResult<false>[] = [];

  (lockData as any[]).forEach((d, i) => {
    const lockIndex = Math.floor(i / lockInputKeys.length);
    const keyIndex = i % lockInputKeys.length;
    const key = lockInputKeys[keyIndex];

    if (!checkResults[lockIndex]) {
      checkResults[lockIndex] = {
        currency: 'Unknown',
        keyPrice: BigNumber.from(0),
        ok: false,
      };
    }

    const lock = contracts[lockIndex];
    const data = lock.interface.decodeFunctionResult(
      lockInputKeys[keyIndex],
      d
    )[0];

    if (key === 'tokenAddress') {
      const currency = (() => {
        switch (data) {
          case constants.AddressZero:
            return 'MATIC';
          case import.meta.env.VITE_USDC_ADDRESS:
            return 'USDC';
          case import.meta.env.WETH_USDC_ADDRESS:
            return 'WETH';
          default:
            return 'Unknown';
        }
      })();
      checkResults[lockIndex].currency = currency;
      if (currency === 'Unknown') {
        checkResults[lockIndex].ok = false;
      }
    } else if (key === 'keyPrice') {
      checkResults[lockIndex].keyPrice = data;
    } else if (key === 'expirationDuration') {
      checkResults[lockIndex].ok = data.eq(30 * 24 * 60 * 60);
    }
  });

  return checkResults;
};

const tokenPriorityOrder = ['USDC', 'WETH', 'MATIC'];

const sortPlans = <T extends boolean>(plans: Plan<T>[]) => {
  const planIndexesByCurrencies: { [currency: string]: number[] } = {};

  plans.forEach((plan, i) => {
    if (planIndexesByCurrencies[plan.currency]) {
      planIndexesByCurrencies[plan.currency].push(i);
    } else {
      planIndexesByCurrencies[plan.currency] = [i];
    }
  });

  const sortedExistsCurrenciesInPlans = Object.keys(
    planIndexesByCurrencies
  ).sort((first, second) => {
    const firstIndex = tokenPriorityOrder.indexOf(first);
    const secondIndex = tokenPriorityOrder.indexOf(second);

    if (firstIndex === -1 || secondIndex === -1 || firstIndex < secondIndex) {
      return -1;
    }
    if (firstIndex > secondIndex) {
      return 1;
    }
    return 0;
  });

  const sortedIndexes = sortedExistsCurrenciesInPlans
    .map((currency) => {
      const sortedIndexesByCurrencies = planIndexesByCurrencies[currency].sort(
        (firstIndex, secondIndex) => {
          const firstPlan = plans[firstIndex];
          const secondPlan = plans[secondIndex];

          if (firstPlan.keyPrice < secondPlan.keyPrice) {
            return -1;
          }
          if (firstPlan.keyPrice > secondPlan.keyPrice) {
            return 1;
          }
          return 0;
        }
      );
      return sortedIndexesByCurrencies;
    })
    .flat();

  const sortedPlans = sortedIndexes.map((i) => plans[i]);
  return sortedPlans;
};
