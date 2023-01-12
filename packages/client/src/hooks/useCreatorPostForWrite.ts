import { addDoc } from 'firebase/firestore';

import { useWallet } from './useWallet';

import { getCreatorPostsCollectionRef } from '@/converters/creatorPostConverter';

export const useCreatorPostForWrite = () => {
  const { account } = useWallet();

  const post = async (
    data: Omit<CreatorPostDocData, 'updatedAt' | 'createdAt'>,
    _content: unknown
  ) => {
    if (!account) {
      throw Error('User wallet does not exist.');
    }
    const postsRef = getCreatorPostsCollectionRef(account);
    const { id } = await addDoc(postsRef, data);
    return id;
  };

  return { post };
};
