import { setDoc, updateDoc } from 'firebase/firestore';
import { useMemo } from 'react';

import { UseImageData } from './useImage';
import { setIsCreatorFlag } from './useIsCreator';
import { useUploadContents } from './useUploadContents';
import { useWallet } from './useWallet';

import { getCreatorDocRef } from '@/converters/creatorConverter';

const refErr = Error('Creator document reference does not exist.');

export type CreatorImageData = { icon?: UseImageData; header?: UseImageData };

export const useCreatorForWrite = () => {
  const { account } = useWallet();

  const docRef = useMemo(() => {
    if (!account) return null;
    return getCreatorDocRef(account);
  }, [account]);

  const addCreator = async (
    creatorName: string,
    description: string,
    images?: CreatorImageData
  ) => {
    if (!docRef || !account) throw refErr;

    await setDoc(docRef, {
      createdAt: new Date(),
      creatorAddress: account,
      creatorName,
      description,
      id: '',
      pinningPostId: '',
      planIds: [],
      settings: {
        isNSFW: false,
        isPublish: true,
      },
      updatedAt: new Date(),
    });

    setIsCreatorFlag(account, true);

    if (images) {
      await uploadImages(images);
    }
  };

  const updateCreator = async (
    {
      creatorName,
      description,
      pinningPostId,
      settings,
    }: Partial<
      Omit<CreatorDocData, 'id' | 'creatorAddress' | 'updatedAt' | 'createdAt'>
    >,
    images?: CreatorImageData
  ) => {
    if (!docRef || !account) throw refErr;

    await updateDoc(docRef, {
      creatorName,
      description,
      pinningPostId,
      settings,
    });

    if (images) {
      await uploadImages(images);
    }
  };

  const { upload } = useUploadContents();

  const uploadImages = async ({ header, icon }: CreatorImageData) => {
    const images = [
      {
        contents: header,
        contentsType: 'headerImage' as const,
      },
      {
        contents: icon,
        contentsType: 'iconImage' as const,
      },
    ];

    const promises = [];

    for (const { contents, contentsType } of images) {
      if (!contents) return;
      promises.push(
        upload({
          contents,
          contentsType,
        })
      );
    }

    await Promise.all(promises);
  };

  return { addCreator, docRef, updateCreator, uploadImages };
};
