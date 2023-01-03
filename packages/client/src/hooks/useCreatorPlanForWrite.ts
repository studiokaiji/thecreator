import { BigNumber, Contract, providers } from 'ethers';
import {
  arrayUnion,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { useMemo } from 'react';

import { usePublicLock } from './usePublicLock';
import { CreateLockOpts, useUnlock } from './useUnlock';
import { useWallet } from './useWallet';

import { getCreatorDocRef } from '@/converters/creatorConverter';
import {
  getCreatorPlanDocRef,
  getCreatorPlansCollectionRef,
} from '@/converters/creatorPlanConverter';
import { db } from '@/firebase';
import type { Plan } from '@/utils/get-plans-from-chain';

type PlanUpdateInput = Omit<Plan, 'ok' | 'currency' | 'txHash'> & {
  tokenAddress: string;
};

type PlanCreateInput = Omit<PlanUpdateInput, 'id'>;

type TxType = 'keyPricing' | 'maxNumberOfKeys' | 'name';

export const useCreatorPlanForWrite = (publicLockAddress?: string) => {
  const { account } = useWallet();

  const { createLock } = useUnlock();

  const plansColRef = useMemo(() => {
    if (!account) return null;
    return getCreatorPlansCollectionRef(account);
  }, [account]);

  const addPlan = async (
    plan: PlanCreateInput,
    opts: Omit<CreateLockOpts, 'request'> = {}
  ): Promise<{ contract: Contract; data: WithId<CreatorPlanDoc> }> => {
    if (!account) {
      throw Error('Need user wallet');
    }

    const contract = await createLock({
      onCreateLockEnded: opts.onCreateLockEnded,
      onCreateLockTxSend: async (res) => {
        opts.onCreateLockTxSend && opts.onCreateLockTxSend(res);
      },
      onFailedToTxSend: opts.onFailedToTxSend,
      onUserRejected: opts.onUserRejected,
      request: {
        keyPrice: plan.keyPrice,
        lockName: plan.name,
        tokenAddress: plan.tokenAddress,
      },
    });

    const data = {
      ...plan,
      id: contract.address,
    };

    const batch = writeBatch(db);

    const creatorDocRef = getCreatorDocRef(account);
    batch.update(creatorDocRef, { planIds: arrayUnion(contract.address) });

    const planDocRef = getCreatorPlanDocRef(account, contract.address);
    batch.set(planDocRef, data);

    await batch.commit();

    return { contract, data };
  };

  const { updateKeyPricing, updateLockName, updateMaxNumberOfKeys } =
    usePublicLock(publicLockAddress);

  const updatePlan = async (
    defaultPlan: Partial<PlanUpdateInput>,
    plan: PlanUpdateInput,
    opts: {
      onTxSend: (type: TxType, res: providers.TransactionResponse) => void;
      onTxConfirmed: (
        type: TxType,
        receipt: providers.TransactionReceipt
      ) => void;
    }
  ) => {
    const changedPlans: Partial<PlanUpdateInput> = {};

    (Object.keys(defaultPlan) as (keyof PlanUpdateInput)[]).forEach((key) => {
      const def = defaultPlan[key];
      const val = plan[key];

      let changed = false;

      if (typeof val === 'string' && def !== val && val.length > 0) {
        changed = true;
      } else if (Array.isArray(val) && val.length > 0) {
        if (Array.isArray(def)) {
          changed = val.some((v, i) => def[i] !== v);
        } else {
          changed = true;
        }
      } else if (BigNumber.isBigNumber(val)) {
        if (BigNumber.isBigNumber(def) && def.eq(val)) {
          changed = false;
        } else {
          changed = true;
        }
      }

      if (changed) {
        changedPlans[key] = plan[key] as any;
      }
    });

    const needToRecordOnChain = (
      Object.keys(changedPlans) as (keyof PlanUpdateInput)[]
    ).every((key) => {
      const onChainKeys = ['currency', 'keyPrice', 'maxNumberOfKeys', 'name'];
      return onChainKeys.includes(key);
    });

    if (needToRecordOnChain) {
      const promises: Promise<unknown>[] = [];

      if (changedPlans.tokenAddress || changedPlans.keyPrice) {
        const keyPrice = changedPlans.keyPrice || defaultPlan.keyPrice;
        const tokenAddress =
          changedPlans.tokenAddress || defaultPlan.tokenAddress;

        if (!keyPrice || !tokenAddress) {
          throw Error(
            'Invalid options. keyPrice or tokenAddress  does not exist.'
          );
        }

        promises.push(
          updateKeyPricing({
            onTxConfirmed: (receipt) =>
              opts.onTxConfirmed('keyPricing', receipt),
            onTxSend: (res) => opts.onTxSend('keyPricing', res),
            value: {
              keyPrice,
              tokenAddress,
            },
          })
        );
      }

      if (changedPlans.maxNumberOfKeys) {
        promises.push(
          updateMaxNumberOfKeys({
            onTxConfirmed: (receipt) =>
              opts.onTxConfirmed('maxNumberOfKeys', receipt),
            onTxSend: (res) => opts.onTxSend('maxNumberOfKeys', res),
            value: changedPlans.maxNumberOfKeys,
          })
        );
      }

      if (changedPlans.name) {
        promises.push(
          updateLockName({
            onTxConfirmed: (receipt) => opts.onTxConfirmed('name', receipt),
            onTxSend: (res) => opts.onTxSend('name', res),
            value: changedPlans.name,
          })
        );
      }

      await Promise.all(promises);
    }

    const updateData = {
      description: changedPlans.description,
      features: changedPlans.features,
    };

    const isUpdatableOnDatabase = Object.values(updateData).some(
      (data) => typeof data !== 'undefined'
    );

    if (isUpdatableOnDatabase) {
      await updatePlanDocById(plan.id, {
        description: changedPlans.description,
        features: changedPlans.features,
      });
    }
  };

  const updatePlanDocById = async (
    id: string,
    plan: Partial<CreatorPlanDoc>
  ) => {
    if (!plansColRef) throw Error('Collection ref does not exist.');
    const ref = doc(plansColRef, id);
    await updateDoc(ref, plan);
  };

  return { addPlan, updatePlan, updatePlanDocById };
};
