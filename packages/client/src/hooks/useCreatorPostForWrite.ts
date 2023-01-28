import { constants } from 'ethers';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { UseImageData } from './useImage';
import { UploadContentsResponse, useUploadContents } from './useUploadContents';
import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

export const useCreatorPostForWrite = () => {
  const { account } = useWallet();

  const { upload } = useUploadContents();

  const postOnlyDocument = async (
    data: Omit<
      CreatorPostDocData,
      | 'updatedAt'
      | 'createdAt'
      | 'borderLockAddress'
      | 'customUrl'
      | 'contents'
      | 'thumbnailUrl'
    > & {
      borderLockAddress?: string;
      customUrl?: string;
      contentUrls?: string[];
      thumbnailUrl?: string;
      id?: string;
    }
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const postsRef = getCreatorPostsCollectionRef(account);
    const postDocRef = data.id ? doc(postsRef, data.id) : doc(postsRef);
    const postId = postDocRef.id;

    await setDoc(postDocRef, {
      ...data,
      borderLockAddress: data.borderLockAddress || constants.AddressZero,
      contentUrls: data.contentUrls || [],
      createdAt: serverTimestamp(),
      customUrl: data.customUrl || '',
      id: postId,
      thumbnailUrl: data.thumbnailUrl || '',
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

    const postDocRef = doc(getCreatorPostsCollectionRef(account));
    const postId = postDocRef.id;

    const promises: Promise<UploadContentsResponse>[] = [];

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

    const responses = await Promise.all(promises);

    const existThumbnail = responses.length > 1;

    const thumbnailUrl = existThumbnail ? responses[0][0].downloadUrl : '';
    const contentUrls = responses[existThumbnail ? 1 : 0].map(
      ({ downloadUrl }) => downloadUrl
    );

    await postOnlyDocument({ ...data, contentUrls, thumbnailUrl });

    return postId;
  };

  return { postContents, postOnlyDocument };
};
