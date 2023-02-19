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
      | 'contents'
      | 'thumbnailUrl'
    > & {
      borderLockAddress?: string;
      contents?: { url: string; description?: string }[];
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
      contents: data.contents || [],
      createdAt: serverTimestamp(),
      id: postId,
      thumbnailUrl: data.thumbnailUrl || '',
      updatedAt: serverTimestamp(),
    });

    return postId;
  };

  const postContents = async <
    T extends CreatorPostDocDataContentsType | 'embedVideo'
  >(
    data: Omit<
      CreatorPostDocData,
      | 'updatedAt'
      | 'createdAt'
      | 'borderLockAddress'
      | 'contentsType'
      | 'thumbnailUrl'
      | 'contents'
    > & {
      borderLockAddress?: string;
      customUrl?: string;
      contentsType: T;
    } & (T extends 'images'
        ? { descriptions?: string[] }
        : { description?: string }),
    contents: T extends 'images'
      ? UseImageData[]
      : T extends 'thumbnail' | 'iconImage' | 'headerImage'
      ? UseImageData
      : T extends 'embedVideo' | 'text'
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
          isPublic: true,
          postId,
        })
      );
    }

    promises.push(
      upload({
        contents: contents as any,
        contentsType: data.contentsType,
        isPublic: !data.borderLockAddress,
        postId,
      })
    );

    const responses = await Promise.all(promises);

    const existThumbnail = responses.length > 1;

    const thumbnailUrl = existThumbnail ? responses[0][0].downloadUrl : '';
    const contentsData = (responses[existThumbnail ? 1 : 0] || []).map(
      ({ downloadUrl, key }, i) => ({
        description:
          data.contentsType === 'images'
            ? (data as { descriptions: string[] })?.descriptions?.[i] || ''
            : (data as { description: string })?.description || '',
        key,
        url: downloadUrl,
      })
    );

    if (
      data.contentsType === 'images' &&
      (data as { descriptions: string[] })?.descriptions
    ) {
      (data as { descriptions: string[] | undefined }).descriptions = undefined;
    }

    await postOnlyDocument({
      borderLockAddress: data.borderLockAddress,
      contents: contentsData,
      contentsType: data.contentsType,
      thumbnailUrl,
      title: data.title,
    });

    return postId;
  };

  return { postContents, postOnlyDocument };
};
