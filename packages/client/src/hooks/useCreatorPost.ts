import { constants } from 'ethers';
import { getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import useSWR from 'swr';

import { getCreatorPostDocRef } from '@/converters/creatorPostConverter';
import { functions } from '@/firebase';

export const useCreatorPost = (creatorId?: string, postId?: string) => {
  const fetcher = async () => {
    if (!creatorId || !postId) return null;

    const ref = getCreatorPostDocRef(creatorId, postId);

    const docSnapshot = await getDoc(ref);
    if (!docSnapshot.exists()) {
      throw Error('Not found');
    }

    const data = docSnapshot.data();
    const post = { ...data };

    try {
      if (data.borderLockAddress !== constants.AddressZero) {
        const { data: downloadUrlsResponseData } = await httpsCallable<
          unknown,
          GetDownloadSignedUrlResponse
        >(
          functions,
          'getDownloadSignedUrls'
        )({ posts: [{ creatorId, postId }] });

        downloadUrlsResponseData[0].urls.map((url, i) => {
          post.contents[i].url = url;
        });
      }

      return post;
    } catch (e) {
      return post;
    }
  };

  return useSWR(`/c/${creatorId}/posts/${postId}`, fetcher, {
    onErrorRetry: (error) => {
      if (error.message === 'Not found') return;
    },
    revalidateOnFocus: false,
  });
};
