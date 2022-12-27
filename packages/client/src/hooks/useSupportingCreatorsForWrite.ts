import {
  deleteDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { getUserSupportingCreatorDocRef } from '../converters/userSupportingCreatorConverter';

import { useCurrentUser } from './useCurrentUser';

export const useSupportingCreatorsForWrite = () => {
  const { currentUser } = useCurrentUser();

  const addSupportingCreator = async (
    creatorId: string,
    input: Omit<SupportingCreatorDocData, 'supportingAt'>
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorDocRef(currentUser.uid, creatorId);

    const supportedAt = serverTimestamp();
    const data = { ...input, id: creatorId, supportedAt };

    await setDoc(ref, data);
  };

  const updateNotificationSettings = async (
    creatorId: string,
    notificationSettings: NotificationSettings
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorDocRef(currentUser.uid, creatorId);

    await updateDoc(ref, { notificationSettings });
  };

  const removeSupportingCreator = async (creatorId: string) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorDocRef(currentUser.uid, creatorId);

    await deleteDoc(ref);
  };

  return {
    addSupportingCreator,
    removeSupportingCreator,
    updateNotificationSettings,
  };
};
