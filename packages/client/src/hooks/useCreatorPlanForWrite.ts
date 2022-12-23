import { BigNumber, Contract, providers } from 'ethers';
import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import { usePublicLock } from './usePublicLock';
import { CreateLockOpts, useUnlock } from './useUnlock';
import { useWallet } from './useWallet';

import { getCreatorPlansCollectionRef } from '@/converters/creatorPlanConverter';
import type { Plan } from '@/utils/get-plans-from-chain';

type PlanUpdateInput = Omit<Plan, 'ok' | 'currency' | 'txHash'> & {
  tokenAddress: string;
};

type PlanCreateInput = Omit<PlanUpdateInput, 'id'>;

type TxType = 'keyPricing' | 'maxNumberOfKeys';

export const useCreatorPlanForWrite = (publicLockAddress?: string) => {
  const { account } = useWallet();

  const { createLock } = useUnlock();

  const colRef = useMemo(() => {
    if (!account) return null;
    return getCreatorPlansCollectionRef(account);
  }, [account]);

  const addPlan = async (
    plan: PlanCreateInput,
    opts: Omit<CreateLockOpts, 'request'> = {}
  ): Promise<{ contract: Contract; data: WithId<CreatorPlanDoc> }> => {
    if (!colRef) throw Error('Collection ref does not exist.');

    const lockName = `${plan.name} plan`;

    const data = {
      id: '',
      txHash: '',
      ...plan,
    };

    const contract = await createLock({
      onCreateLockEnded: opts.onCreateLockEnded,
      onCreateLockTxSend: async (res) => {
        const result = await addDoc(colRef, {
          ...data,
          txHash: res.hash,
        });
        data.id = result.id;
        opts.onCreateLockTxSend && opts.onCreateLockTxSend(res);
      },
      onFailedToTxSend: opts.onFailedToTxSend,
      onUserRejected: opts.onUserRejected,
      request: {
        keyPrice: plan.keyPrice,
        lockName,
        tokenAddress: plan.tokenAddress,
      },
    });

    await updatePlanDocById(data.id, {
      lockAddress: contract.address,
      txHash: '',
    });

    return { contract, data };
  };

  const { updateKeyPricing, updateMaxNumberOfKeys } =
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
      const onChainKeys = ['currency', 'keyPrice', 'maxNumberOfKeys'];
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

      await Promise.all(promises);
    }

    const updateData = {
      description: changedPlans.description,
      features: changedPlans.features,
      lockAddress: changedPlans.lockAddress,
      name: changedPlans.name,
    };

    const isUpdatableOnDatabase = Object.values(updateData).some(
      (data) => typeof data !== 'undefined'
    );

    console.log(isUpdatableOnDatabase);

    if (isUpdatableOnDatabase) {
      await updatePlanDocById(plan.id, {
        description: changedPlans.description,
        features: changedPlans.features,
        lockAddress: changedPlans.lockAddress,
        name: changedPlans.name,
      });
    }
  };

  const updatePlanDocById = async (
    id: string,
    plan: Partial<CreatorPlanDoc>
  ) => {
    if (!colRef) throw Error('Collection ref does not exist.');
    const ref = doc(colRef, id);
    await updateDoc(ref, plan);
  };

  return { addPlan, updatePlan, updatePlanDocById };
};
