import { deleteDoc, setDoc, updateDoc } from 'firebase/firestore';

import { getUserSupportingCreatorDocRef } from '../converters/userSupportingCreatorConverter';

import { useCurrentUser } from './useCurrentUser';

export const useSupportingCreatorsForWrite = () => {
  const { currentUser } = useCurrentUser();

  const addSupportingCreator = async (
    creatorId: string,
    input: Omit<SupportingCreatorDocData, 'supportedAt'>
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorDocRef(currentUser.uid, creatorId);

    const data = { ...input, id: creatorId };

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
