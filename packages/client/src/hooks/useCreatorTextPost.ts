import useSWR from 'swr';

import { useCreatorPost } from './useCreatorPost';

export const useCreatorTextPost = (creatorId?: string, postId?: string) => {
  const {
    data: post,
    error: creatorPostErr,
    mutate: mutatePostDocument,
  } = useCreatorPost(creatorId, postId);

  const handler = async (url?: string) => {
    if (creatorPostErr) {
      throw creatorPostErr;
    }

    if (!url) {
      return null;
    }

    const res = await fetch(url);

    const text = await res.text();
    return text;
  };

  const swr = useSWR(post?.contents[0].url, handler, {
    revalidateOnFocus: false,
  });

  // If content exists, return null until data after content fetch is assigned.
  const data =
    post && post?.contents[0].url && swr.data
      ? { ...post, bodyHtml: swr.data }
      : post && !post?.contents[0].url
      ? { ...post, bodyHtml: '' }
      : null;

  return { ...swr, data, mutatePostDocument };
};
