import { httpsCallable } from 'firebase/functions';

import { useCurrentUser } from './useCurrentUser';
import { UseImageData } from './useImage';

import { functions } from '@/firebase';

const imageContentsTypes = ['thumbnail', 'iconImage', 'headerImage', 'images'];

export const useUploadContents = () => {
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
      : T extends 'thumbnail' | 'iconImage' | 'headerImage'
      ? UseImageData
      : Blob;
    postId?: string;
    isPublic?: boolean;
  }) => {
    if (!currentUser) {
      throw Error('Need user');
    }

    const isPost =
      contentsType !== 'headerImage' && contentsType !== 'iconImage';

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

    const result = await httpsCallable<unknown, GetUploadSignedUrlResponse>(
      functions,
      'getUploadSignedUrl'
    )(data);

    const promises = result.data.map(async ({ uploadUrl }, i) => {
      await fetch(uploadUrl, {
        body: compressedBlobs[i],
        method: 'PUT',
      });
    });

    await Promise.all(promises);

    return result.data.map(({ downloadUrl, key }) => ({ downloadUrl, key }));
  };

  return { upload };
};