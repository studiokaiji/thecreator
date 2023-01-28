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

    let downloadUrls: {
      header: string;
      icon: string;
    } = {
      header: '',
      icon: '',
    };
    if (images) {
      downloadUrls = await uploadImages(images);
    }

    await setDoc(docRef, {
      createdAt: new Date(),
      creatorAddress: account,
      creatorName,
      description,
      headerImageSrc: downloadUrls.header,
      iconImageSrc: downloadUrls.icon,
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
  };

  const updateCreator = async (
    {
      creatorName,
      description,
      pinningPostId,
      settings,
    }: Partial<
      Omit<
        CreatorDocData,
        | 'creatorAddress'
        | 'updatedAt'
        | 'createdAt'
        | 'headerImageSrc'
        | 'iconImageSrc'
      >
    >,
    images?: CreatorImageData
  ) => {
    if (!docRef || !account) throw refErr;

    let downloadUrls: {
      header?: string;
      icon?: string;
    } = {};

    if (images) {
      downloadUrls = await uploadImages(images);
    }

    const updateData = {
      creatorName,
      description,
      headerImageSrc: downloadUrls.header,
      iconImageSrc: downloadUrls.icon,
      pinningPostId,
      settings,
    };

    await updateDoc(docRef, updateData);

    return updateData;
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

    const promises = images.map(({ contents, contentsType }) => {
      if (!contents) {
        return null;
      }

      return upload({
        contents,
        contentsType,
      });
    });

    const [headerRes, iconRes] = await Promise.all(promises);

    return {
      header: headerRes?.[0].downloadUrl || '',
      icon: iconRes?.[0].downloadUrl || '',
    };
  };

  return { addCreator, docRef, updateCreator, uploadImages };
};
