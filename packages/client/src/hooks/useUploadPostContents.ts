import { httpsCallable } from 'firebase/functions';

import { useCurrentUser } from './useCurrentUser';
import { UseImageData } from './useImage';

import { functions } from '@/firebase';

const imageContentsTypes = [
  'thumbnail',
  'profileImage',
  'headerImage',
  'profileImage',
  'images',
];

export const useUploadPostContents = () => {
  const { currentUser } = useCurrentUser();

  const upload = async <T extends ContentsType>({
    contents,
    contentsType,
    isPublic = false,
    postId,
  }: {
    contentsType: T;
    contents: T extends 'images'
      ? UseImageData[]
      : T extends 'thumbnail' | 'profileImage' | 'headerImage'
      ? UseImageData
      : Blob;
    postId?: string;
    isPublic?: boolean;
  }) => {
    if (!currentUser) {
      throw Error('Need user');
    }

    const isPost =
      contentsType !== 'headerImage' && contentsType !== 'profileImage';

    const getUploadBlobs = async () => {
      if (!imageContentsTypes.includes(contentsType)) {
        return [contents as Blob];
      }
      if (Array.isArray(contents)) {
        const blobs = await Promise.all(
          contents.map(async ({ compress }) => await compress())
        );
        return blobs;
      }

      return [await (contents as UseImageData).compress()];
    };
    const compressedBlobs = await getUploadBlobs();

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
