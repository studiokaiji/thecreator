import { httpsCallable } from 'firebase/functions';

import { useCurrentUser } from './useCurrentUser';

import { functions } from '@/firebase';

export const useUploadPostContents = () => {
  const { currentUser } = useCurrentUser();

  const upload = async <
    T extends
      | 'images'
      | 'audio'
      | 'attachedImage'
      | 'text'
      | 'profileImage'
      | 'headerImage'
  >({
    contents,
    contentsType,
    isPublic,
    postId,
  }: {
    contentsType: T;
    contents: Blob[];
    postId?: string;
    isPublic?: boolean;
  }) => {
    if (!currentUser) {
      throw Error('Need user');
    }

    if (
      (contents.length > 1 && contentsType !== 'images') ||
      (contents.length > 30 && contents.length < 1)
    ) {
      throw Error('Invalid contents length');
    }

    const isPost =
      contentsType !== 'headerImage' && contentsType !== 'profileImage';

    const baseData = {
      contentInfoList: contents.map((blob) => ({
        contentLength: blob.size,
        contentType: blob.type,
      })),
      contentsType,
      creatorId: currentUser?.uid,
    };

    const data = isPost ? { ...baseData, isPublic, postId } : baseData;

    const result = await httpsCallable<unknown, { urls: string[] }>(
      functions,
      'getUploadSignedUrl'
    )(data);

    const promises = result.data.urls.map(async (url, i) => {
      const blob = contents[i];
      await fetch(url, {
        body: blob,
        method: 'PUT',
      });
    });

    await Promise.allSettled(promises);
  };

  return { upload };
};
