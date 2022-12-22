import { deleteUser, updateEmail, updateProfile, User } from 'firebase/auth';
import { getDoc, updateDoc } from 'firebase/firestore';
import useSWR from 'swr';

import { useAuth } from './useAuth';
import { useCurrentUser } from './useCurrentUser';
import { useWallet } from './useWallet';

import type { UserDocData } from '#types/firestore/user';
import { getUserDocRef } from '@/converters/userConverter';

const CURRENT_USER_DOES_NOT_EXIST_ERROR = Error('currentUser does not exist');

export const useUser = () => {
  const { currentUser } = useCurrentUser();

  const { authentication, getConnector } = useAuth();

  const { activate } = useWallet();

  const handler = async (user: User) => {
    if (!user.uid) return null;

    const userRef = getUserDocRef(user.uid);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();

    const returnData = { ...userData, ...currentUser };
    return returnData;
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

  const updateUserEmail = async (email: string) => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }

    const connector = getConnector();
    if (!connector) {
      throw Error('Invalid connector');
    }

    await activate(connector, undefined, true);

    const { user } = await authentication();
    if (!user) {
      throw Error('No authenticated');
    }
    await updateEmail(user, email);
  };

  const removeUser = async () => {
    if (!currentUser) {
      throw CURRENT_USER_DOES_NOT_EXIST_ERROR;
    }
    await deleteUser(currentUser);
  };

  const swr = useSWR(currentUser, handler, { revalidateOnFocus: false });

  return {
    removeUser,
    updateUserEmail,
    updateUserProfile,
    updateUserSettings,
    ...swr,
  };
};
