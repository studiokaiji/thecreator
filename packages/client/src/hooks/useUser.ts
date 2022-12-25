import { updateProfile } from 'firebase/auth';
import { getDoc, setDoc, updateDoc } from 'firebase/firestore';
import useSWR from 'swr';

import { useCurrentUser } from './useCurrentUser';

import { getUserDocRef } from '@/converters/userConverter';

const CURRENT_USER_DOES_NOT_EXIST_ERROR = Error('currentUser does not exist');

export const useUser = () => {
  const { currentUser, removeUser, updateUserEmail } = useCurrentUser();

  const handler = async () => {
    if (!currentUser || !currentUser.uid) return null;

    const userRef = getUserDocRef(currentUser.uid);

    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      const returnData = { ...userData, ...currentUser };
      return returnData;
    } else {
      const docData = {
        globalNotificationSettings: {
          oneWeekBeforeExpiration: true,
          subscripionExpired: true,
          supportedCreatorNewPost: true,
        },
        id: currentUser.uid,
      };
      await setDoc(userRef, docData);
      return { ...docData, ...currentUser };
    }
  };

  const updateUserProfile = async (
    data: Partial<{
      displayName: string;
      photoUrl: string;
    }>
  ) => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }
    await updateProfile(currentUser, data);
  };

  const updateUserSettings = async (data: Partial<UserDocData>) => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }
    const userRef = getUserDocRef(currentUser.uid);
    await updateDoc(userRef, data);
  };

  const swr = useSWR('/get-user', handler, { revalidateOnFocus: false });

  return {
    removeUser,
    updateUserEmail,
    updateUserProfile,
    updateUserSettings,
    ...swr,
  };
};
