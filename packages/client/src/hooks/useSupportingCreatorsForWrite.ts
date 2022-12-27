import { addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

import {
  getUserSupportingCreatorPlanDocRef,
  getUserSupportingCreatorPlansCollectionRef,
} from '../converters/userSupportingCreatorConverter';

import { useCurrentUser } from './useCurrentUser';

export const useSupportingCreatorsForWrite = () => {
  const { currentUser } = useCurrentUser();

  const addSupportingCreator = async (
    input: Omit<SupportingCreatorPlanDocData, 'supportedAt'>
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const colRef = getUserSupportingCreatorPlansCollectionRef(currentUser.uid);

    const data = { ...input, id: input.creatorId };

    await addDoc(colRef, data);
  };

  const updateNotificationSettings = async (
    creatorId: string,
    notificationSettings: NotificationSettings
  ) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorPlanDocRef(currentUser.uid, creatorId);

    await updateDoc(ref, { notificationSettings });
  };

  const removeSupportingCreator = async (creatorId: string) => {
    if (!currentUser?.uid) {
      throw Error('Need authentication');
    }

    const ref = getUserSupportingCreatorPlanDocRef(currentUser.uid, creatorId);

    await deleteDoc(ref);
  };

  return {
    addSupportingCreator,
    removeSupportingCreator,
    updateNotificationSettings,
  };
};
