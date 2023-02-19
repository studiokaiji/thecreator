import useSWR from 'swr';

import { useCreatorPost } from './useCreatorPost';

export const useCreatorTextPost = (creatorId?: string, postId?: string) => {
  const { data: post, error: creatorPostErr } = useCreatorPost(
    creatorId,
    postId
  );

  const handler = async () => {
    if (creatorPostErr) {
      throw creatorPostErr;
    }

    if (!creatorId || !postId || !post) {
      return null;
    }

    const url = post?.contents?.[0].url;
    if (!url) {
      return null;
    }

    const res = await fetch(url);

    const text = await res.text();
    return text;
  };

  const swr = useSWR(
    [`/c/${creatorId}/posts/${postId}/contents`, post],
    handler,
    {
      revalidateOnFocus: false,
    }
  );

  const data = post ? { ...post, textHtml: swr.data } : null;

  return { ...swr, data };
};
