import { PublicLockV11 } from '@unlock-protocol/contracts';
import { BigNumber, BytesLike, constants, Contract } from 'ethers';

import { aggregate } from './multicall';

import { rpcProvider } from '@/rpc-provider';

export const getPlansFromChain = async (
  docPlans: WithId<CreatorPlanDoc>[],
  excludeInvalidPlans: boolean
): Promise<Plan[]> => {
  const checkResults = await checkPlans(docPlans);

  const filtered = excludeInvalidPlans
    ? checkResults.filter((result) => result.ok)
    : (checkResults as unknown as PlanCheckResult[]);

  const plans = filtered.map((result, i) => ({
    ...docPlans[i],
    ...result,
  }));

  const sorted = sortPlans(plans);

  return sorted as Plan[];
};

type PlanCheckResult = {
  tokenAddress: string;
  keyPrice: BigNumber;
  ok: boolean;
  maxNumberOfKeys: BigNumber;
};

export type Plan = WithId<CreatorPlanDoc & PlanCheckResult>;

const lockInputKeys = [
  'tokenAddress',
  'keyPrice',
  'expirationDuration',
  'maxNumberOfKeys',
] as const;

const checkPlans = async (docPlans: WithId<CreatorPlanDoc>[]) => {
  if (docPlans.length < 1) return [];

  const contracts = docPlans
    .filter(({ lockAddress }) => lockAddress)
    .map(({ lockAddress }) => new Contract(lockAddress, PublicLockV11.abi));

  const lockInputs: MulticallInput[] = [];
  contracts.forEach((contract) => {
    lockInputKeys.forEach((k) => {
      const target = contract.address;
      const callData = contract.interface.encodeFunctionData(k);
      lockInputs.push({ callData, target });
    });
  });

  const { returnData: lockData } = await aggregate(lockInputs, rpcProvider);

  const checkResults: PlanCheckResult[] = [];

  (lockData as BytesLike[]).forEach((d, i) => {
    const lockIndex = Math.floor(i / lockInputKeys.length);
    const keyIndex = i % lockInputKeys.length;
    const key = lockInputKeys[keyIndex];

    if (!checkResults[lockIndex]) {
      checkResults[lockIndex] = {
        keyPrice: BigNumber.from(0),
        maxNumberOfKeys: BigNumber.from(0),
        ok: false,
        tokenAddress: constants.AddressZero,
      };
    }

    const lock = contracts[lockIndex];
    const data = lock.interface.decodeFunctionResult(
      lockInputKeys[keyIndex],
      d
    )[0];

    if (key === 'tokenAddress') {
      checkResults[lockIndex].tokenAddress = data;
      if (
        data !== import.meta.env.VITE_USDC_ADDRESS &&
        data !== import.meta.env.VITE_WETH_ADDRESS &&
        data !== constants.AddressZero
      ) {
        checkResults[lockIndex].ok = false;
      }
    } else if (key === 'keyPrice') {
      checkResults[lockIndex].keyPrice = data;
    } else if (key === 'expirationDuration') {
      checkResults[lockIndex].ok = data.eq(30 * 24 * 60 * 60);
    } else if (key === 'maxNumberOfKeys') {
      checkResults[lockIndex].maxNumberOfKeys = data;
    }
  });

  return checkResults;
};

const tokenPriorityOrder = [
  import.meta.env.VITE_USDC_ADDRESS,
  import.meta.env.VITE_WETH_ADDRESS,
  constants.AddressZero,
];

const sortPlans = (plans: Plan[]) => {
  const planIndexesByTokens: { [token: string]: number[] } = {};

  plans.forEach((plan, i) => {
    if (planIndexesByTokens[plan.tokenAddress]) {
      planIndexesByTokens[plan.tokenAddress].push(i);
    } else {
      planIndexesByTokens[plan.tokenAddress] = [i];
    }
  });

  const sortedExistsCurrenciesInPlans = Object.keys(planIndexesByTokens).sort(
    (first, second) => {
      const firstIndex = tokenPriorityOrder.indexOf(first);
      const secondIndex = tokenPriorityOrder.indexOf(second);

      if (firstIndex === -1 || secondIndex === -1 || firstIndex < secondIndex) {
        return -1;
      }
      if (firstIndex > secondIndex) {
        return 1;
      }
      return 0;
    }
  );

  const sortedIndexes = sortedExistsCurrenciesInPlans
    .map((currency) => {
      const sortedIndexesByCurrencies = planIndexesByTokens[currency].sort(
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
