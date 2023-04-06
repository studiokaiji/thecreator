import { constants } from 'ethers';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { UseImageData } from './useImage';
import { UploadContentsResponse, useUploadContents } from './useUploadContents';
import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

type Data = Omit<
  CreatorPostDocData,
  'updatedAt' | 'createdAt' | 'borderLockAddress' | 'contents' | 'thumbnailUrl'
> & {
  borderLockAddress?: string;
  contents?: { url: string; description?: string }[];
  thumbnailUrl?: string;
  id?: string;
};
type ContentsType = CreatorPostDocDataContentsType | 'embedVideo';

type DataWithContents<T extends ContentsType> = Omit<Data, 'contentsType'> & {
  contentsType: T;
} & (T extends 'images'
    ? { descriptions?: string[] }
    : { description?: string });

type Contents<T extends ContentsType> = T extends 'images'
  ? UseImageData[]
  : T extends 'thumbnail' | 'iconImage' | 'headerImage'
  ? UseImageData
  : T extends 'embedVideo' | 'text'
  ? string
  : Blob;

export const useCreatorPostForWrite = () => {
  const { account } = useWallet();

  const { upload } = useUploadContents();

  const postOnlyDocument = async (data: Data) => {
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

  const updateOnlyDocument = async (data: WithId<Partial<Data>>) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const postsRef = getCreatorPostsCollectionRef(account);
    const postDocRef = doc(postsRef, data.id);

    await updateDoc(postDocRef, {
      ...data,
      thumbnailUrl: data.thumbnailUrl,
      updatedAt: serverTimestamp(),
    });

    return data.id;
  };

  const addContents = async <T extends ContentsType>(
    data: WithId<DataWithContents<T>>,
    contents: Contents<T>,
    thumbnail?: UseImageData
  ) => {
    const promises: Promise<UploadContentsResponse>[] = [];

    if (data.contentsType === 'audio' && thumbnail) {
      promises.push(
        upload({
          contents: thumbnail,
          contentsType: 'thumbnail',
          isPublic: true,
          postId: data.id,
        })
      );
    }

    promises.push(
      upload({
        contents: contents as any,
        contentsType: data.contentsType,
        isPublic: !data.borderLockAddress,
        postId: data.id,
      })
    );

    const responses = await Promise.all(promises);

    const existThumbnail = responses.length > 1;

    const thumbnailUrl = existThumbnail
      ? responses[0][0].downloadUrl
      : undefined;
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

    return { contentsData, thumbnailUrl };
  };

  const postContents = async <T extends ContentsType>(
    data: DataWithContents<T>,
    contents: Contents<T>,
    thumbnail?: UseImageData
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const postDocRef = doc(getCreatorPostsCollectionRef(account));
    const postId = postDocRef.id;

    const { contentsData, thumbnailUrl } = await addContents(
      { ...data, id: postId },
      contents,
      thumbnail
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
      isPublic: data.isPublic,
      thumbnailUrl: thumbnailUrl || '',
      title: data.title,
    });

    return postId;
  };

  const updateContents = async <T extends ContentsType>(
    data: WithId<DataWithContents<T>>,
    contents: Contents<T>,
    thumbnail?: UseImageData
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }

    const { contentsData, thumbnailUrl } = await addContents(
      data,
      contents,
      thumbnail
    );

    if (
      data.contentsType === 'images' &&
      (data as { descriptions: string[] })?.descriptions
    ) {
      (data as { descriptions: string[] | undefined }).descriptions = undefined;
    }

    await updateOnlyDocument({
      ...data,
      contents: contentsData,
      thumbnailUrl,
    });

    return data.id;
  };

  return {
    postContents,
    postOnlyDocument,
    updateContents,
    updateOnlyDocument,
  };
};
