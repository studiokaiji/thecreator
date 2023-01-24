import { constants } from 'ethers';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { UseImageData } from './useImage';
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
    contents: UseImageData[]
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
      | 'updatedAt'
      | 'createdAt'
      | 'borderLockAddress'
      | 'customUrl'
      | 'contentsCount'
    > & {
      borderLockAddress?: string;
      customUrl?: string;
      contentsCount?: number;
    }
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
      contentsCount: data.contentsCount || 1,
      createdAt: serverTimestamp(),
      customUrl: data.customUrl || '',
      id: postId,
      updatedAt: serverTimestamp(),
    });

    return postId;
  };

  return { postData, uploadContents };
};
