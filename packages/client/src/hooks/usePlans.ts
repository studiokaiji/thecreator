import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, constants, Contract } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useMulticall } from './useMulticall';

import { CreatorDocDataPlan } from '#types/firestore/creator';
import { currencies } from '@/constants';

const lockInputKeys = [
  'tokenAddress',
  'keyPrice',
  'expirationDuration',
] as const;

type Input = { target: string; callData: string };

type CurrencyWithUnknown = typeof currencies[number] | 'Unknown';

type PlanCheckResult = {
  currency: CurrencyWithUnknown;
  keyPrice: BigNumber;
  ok: boolean;
};

export type Plan = CreatorDocDataPlan & PlanCheckResult;

export const usePlans = (docPlansMap: {
  [key: number]: CreatorDocDataPlan;
}) => {
  const { aggregate } = useMulticall();

  const docPlans = useMemo(() => Object.values(docPlansMap), []);

  const checkPlans = useCallback(async () => {
    const contracts = docPlans.map(
      ({ lockAddress }) => new Contract(lockAddress, PublicLockV11.abi)
    );

    const lockInputs: Input[] = [];
    contracts.forEach((contract) => {
      lockInputKeys.forEach((k) => {
        const target = contract.address;
        const callData = contract.interface.encodeFunctionData(k);
        lockInputs.push({ callData, target });
      });
    });

    const { returnData: lockData } = await aggregate(lockInputs);

    const checkResults: PlanCheckResult[] = [];

    (lockData as any[]).forEach((data, i) => {
      const lockIndex = Math.floor(i / lockInputKeys.length);
      const keyIndex = i % lockInputKeys.length;
      const key = lockInputKeys[keyIndex];

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
        checkResults[lockIndex].ok = data === 30 * 24 * 60 * 60;
      }
    });

    return checkResults;
  }, []);

  const getPlans = useCallback(
    async (includeInvalidPlans = false): Promise<Plan[]> => {
      const checkResults = await checkPlans();

      const filtered = includeInvalidPlans
        ? checkResults
        : checkResults.filter((result) => result.ok);

      const plans = filtered.map((result, i) => ({
        ...docPlans[i],
        ...result,
      }));

      return sortPlans(plans);
    },
    []
  );

  const [plans, setPlans] = useState<Plan[]>();

  useEffect(() => {
    getPlans().then(setPlans);
  }, []);

  return { checkPlans, getPlans, loading: typeof plans === 'undefined', plans };
};

const tokenPriorityOrder = ['USDC', 'WETH', 'MATIC'];

const sortPlans = (plans: Plan[]) => {
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
      return 1;
    }
    if (firstIndex > secondIndex) {
      return -1;
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
            return 1;
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
