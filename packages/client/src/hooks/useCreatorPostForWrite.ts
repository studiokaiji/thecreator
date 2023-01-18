import { constants } from 'ethers';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { useUploadPostContents } from './useUploadPostContents';
import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

export const useCreatorPostForWrite = () => {
  const { account } = useWallet();

  const { upload } = useUploadPostContents();

  const uploadContents = async (
    data: {
      contentsType: CreatorPostDocDataContentsType;
      borderLockAddress?: string;
      id: string;
    },
    contents: Blob[]
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }
    await upload({
      contents,
      contentsType: data.contentsType,
      isPublic: !!data.borderLockAddress,
      postId: data.id,
    });
  };

  const postData = async (
    data: Omit<
      CreatorPostDocData,
      'updatedAt' | 'createdAt' | 'borderLockAddress'
    > & { borderLockAddress?: string; }
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const postsRef = getCreatorPostsCollectionRef(account);

    const postDocRef = doc(postsRef);
    const postId = postDocRef.id;

    await setDoc(postDocRef, {
      ...data,
      borderLockAddress: data.borderLockAddress || constants.AddressZero,
      createdAt: serverTimestamp(),
      id: postId,
      updatedAt: serverTimestamp(),
    });

    return postId;
  };

  return { postData, uploadContents };
};
