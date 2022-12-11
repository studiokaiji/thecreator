import { constants, Contract } from 'ethers';
import { addDoc, doc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import { CreateLockOpts, useUnlock } from './useUnlock';
import { useWallet } from './useWallet';

import { CreatorPlanDoc } from '#types/firestore/creator/plan';
import { currencies } from '@/constants';
import { getCreatorPlansCollectionRef } from '@/converters/creatorPlanConverter';
import type { Plan } from '@/utils/get-plans-from-chain';

export const useCreatorPlanForWrite = () => {
  const { account } = useWallet();

  const { createLock } = useUnlock();

  const colRef = useMemo(() => {
    if (!account) return null;
    return getCreatorPlansCollectionRef(account);
  }, [account]);

  const addPlan = async (
    plan: Omit<Plan, 'ok' | 'currency' | 'txHash'> & {
      currency: typeof currencies[number];
    },
    opts: Omit<CreateLockOpts, 'request'> = {}
  ): Promise<{ contract: Contract; data: CreatorPlanDoc }> => {
    if (!colRef) throw Error('Collection ref does not exist.');

    const baseToken =
      plan.currency === 'USDC'
        ? import.meta.env.VITE_USDC_ADDRESS
        : plan.currency === 'WETH'
        ? import.meta.env.VITE_USDC_ADDRESS
        : constants.AddressZero;

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
        baseToken,
        lockName,
        price: plan.keyPrice,
      },
    });

    await updatePlanDocById(data.id, {
      lockAddress: contract.address,
      txHash: '',
    });

    return { contract, data };
  };

  const updatePlanDocById = async (
    id: string,
    plan: Partial<CreatorPlanDoc>
  ) => {
    if (!colRef) throw Error('Collection ref does not exist.');
    const ref = doc(colRef, id);
    await updateDoc(ref, plan);
  };

  return { addPlan, updatePlanDocById };
};
