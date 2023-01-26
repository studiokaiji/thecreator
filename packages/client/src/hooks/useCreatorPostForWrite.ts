import { constants } from 'ethers';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { UseImageData } from './useImage';
import { useUploadContents } from './useUploadContents';
import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

export const useCreatorPostForWrite = () => {
  const { account } = useWallet();

  const { upload } = useUploadContents();

  const postDocument = async (
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

  const postContents = async <T extends CreatorPostDocDataContentsType>(
    data: Omit<
      CreatorPostDocData,
      | 'updatedAt'
      | 'createdAt'
      | 'borderLockAddress'
      | 'customUrl'
      | 'contentsCount'
      | 'contentsType'
    > & {
      borderLockAddress?: string;
      customUrl?: string;
      contentsCount?: number;
      contentsType: T;
    },
    contents: T extends 'images'
      ? UseImageData[]
      : T extends 'thumbnail' | 'iconImage' | 'headerImage'
      ? UseImageData
      : T extends 'video'
      ? string
      : Blob,
    thumbnail?: UseImageData
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const postId = await postDocument(data);

    const promises = [];

    if (data.contentsType === 'audio' && thumbnail) {
      promises.push(
        upload({
          contents: thumbnail,
          contentsType: 'thumbnail',
        })
      );
    }

    if (data.contentsType !== 'video') {
      promises.push(
        upload({
          contents: contents as any,
          contentsType: data.contentsType,
          isPublic: !!data.borderLockAddress,
          postId,
        })
      );
    }

    await Promise.all(promises);

    return postId;
  };

  return { postContents, postDocument };
};
