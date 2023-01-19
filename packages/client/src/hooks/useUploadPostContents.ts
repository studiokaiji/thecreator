import { httpsCallable } from 'firebase/functions';

import { useCurrentUser } from './useCurrentUser';
import { UseImageData } from './useImage';

import { functions } from '@/firebase';

export const useUploadPostContents = () => {
  const { currentUser } = useCurrentUser();

  const upload = async <T extends ContentsType>({
    contents,
    contentsType,
    isPublic,
    postId,
  }: {
    contentsType: T;
    contents: UseImageData[];
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

    const compressedBlobs = await Promise.all(
      contents.map(async ({ compress }) => await compress())
    );

    const baseData = {
      contentInfoList: compressedBlobs.map(({ size, type }) => ({
        contentLength: size,
        contentType: type,
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
      await fetch(url, {
        body: compressedBlobs[i],
        method: 'PUT',
      });
    });

    await Promise.allSettled(promises);
  };

  return { upload };
};
