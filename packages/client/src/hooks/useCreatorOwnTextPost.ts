import useSWR from 'swr';

import { useCreatorPost } from './useCreatorPost';
import { useCreatorPostForWrite } from './useCreatorPostForWrite';
import { useWallet } from './useWallet';

export const useCreatorOwnTextPost = (postId?: string) => {
  const { account } = useWallet();
  const { data: post, error: creatorPostErr } = useCreatorPost(account, postId);
  const { postContents, postOnlyDocument, updateContents, updateOnlyDocument } =
    useCreatorPostForWrite();

  const { data: contentsHtml } = useSWR(
    `/c/${account}/posts/${postId}?contents`,
    async () => {
      const url = post?.contents?.[0].url;
      if (!url) {
        return null;
      }

      const res = await fetch(url);

      const text = await res.text();
      return text;
    }
  );

  const save = (args: {
    title?: string;
    isPublic?: boolean;
    contentsHtml?: string;
  }) => {
    if (!account || creatorPostErr) return;

    const data = {
      contentsType: 'text',
      isPublic:
        args?.isPublic !== undefined
          ? args?.isPublic
          : post?.isPublic !== undefined
          ? post?.isPublic
          : false,
      title: args?.title || post?.title || '',
    } as const;

    if (args?.contentsHtml && args?.contentsHtml !== contentsHtml) {
      if (postId) {
        updateContents({ ...data, id: postId }, args?.contentsHtml);
      } else {
        postContents(data, args?.contentsHtml);
      }
    } else {
      if (postId) {
        updateOnlyDocument({ ...data, id: postId });
      } else {
        postOnlyDocument(data);
      }
    }
  };

  return { save };
};
