import { addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

import {
  getUserSupportingCreatorPlanDocRef,
  getUserSupportingCreatorPlansCollectionRef,
} from '../converters/userSupportingCreatorConverter';

import { useCurrentUser } from './useCurrentUser';
import { useUserPublicLockKeysForWrite } from './useUserPublicLockKeysForWrite';

import { ExtendPeriodOpts } from '@/hooks/usePublicLock';

export const useSupportingCreatorPlanForWrite = (planId?: string) => {
  const { currentUser } = useCurrentUser();

  const addSupportingCreatorPlan = async (
    input: Omit<SupportingCreatorPlanDocData, 'supportedAt'>
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const colRef = getUserSupportingCreatorPlansCollectionRef(currentUser.uid);

    const data = { ...input, id: input.lockAddress };

    await addDoc(colRef, data);
  };

  const updateNotificationSettings = async (
    planId: string,
    notificationSettings: NotificationSettings
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorPlanDocRef(currentUser.uid, planId);

    await updateDoc(ref, { notificationSettings });
  };

  const { extendPeriodAndGetNewExpirationTimestamp } =
    useUserPublicLockKeysForWrite(planId);

  const extendPlanPeriod = async (opts: ExtendPeriodOpts) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }
    if (!planId) {
      throw Error('Need planId');
    }
    return extendPeriodAndGetNewExpirationTimestamp(opts);
  };

  const removeSupportingCreator = async () => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }
    if (!planId) {
      throw Error('Need planId');
    }

    const ref = getUserSupportingCreatorPlanDocRef(currentUser.uid, planId);

    await deleteDoc(ref);
  };

  return {
    addSupportingCreatorPlan,
    extendPlanPeriod,
    removeSupportingCreator,
    updateNotificationSettings,
  };
};
