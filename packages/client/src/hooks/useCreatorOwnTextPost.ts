import { useMemo } from 'react';
import useSWR from 'swr';

import { useCreatorPost } from './useCreatorPost';
import { useCreatorPostForWrite } from './useCreatorPostForWrite';
import { useWallet } from './useWallet';

import { EditorData } from '@/components/standalone/EditCreatorPageSideBar/CreateNewPostButton/TextPost/Editor';

export const useCreatorOwnTextPost = (postId?: string) => {
  const { account } = useWallet();

  const creatorPostSWR = useCreatorPost(account, postId);

  const { data: post, error: creatorPostErr, mutate } = creatorPostSWR;

  const {
    data: bodyHtml,
    error: bodyHtmlErr,
    mutate: mutateBodyHtml,
  } = useSWR(
    post?.contents[0].url,
    async (url?: string) => {
      if (!url) return null;
      const res = await fetch(url);
      return res.text();
    },
    {
      revalidateOnFocus: false,
    }
  );

  const returnData = useMemo(() => {
    if (!post || (post?.contents[0].url && !bodyHtml)) {
      return null;
    }
    return { ...post, bodyHtml };
  }, [bodyHtml]);

  const returnErr = useMemo(() => {
    return { bodyHtml: bodyHtmlErr, post: creatorPostErr };
  }, [bodyHtmlErr]);

  const { postContents, postOnlyDocument, updateContents, updateOnlyDocument } =
    useCreatorPostForWrite();

  const save = async (
    args: {
      isPublic?: boolean;
    } & Partial<EditorData>
  ) => {
    if (
      !account ||
      (postId && !post && !creatorPostErr) ||
      (post?.contents[0] && !bodyHtml && !bodyHtmlErr) ||
      creatorPostErr ||
      bodyHtmlErr
    ) {
      throw (
        creatorPostErr ||
        Error(
          'An error was returned because the account cannot be retrieved or is in the process of retrieving submissions.'
        )
      );
    }

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

    if (args?.bodyHtml && args?.bodyHtml !== bodyHtml) {
      if (postId) {
        await updateContents({ ...data, id: postId }, args?.bodyHtml);
      } else {
        postId = await postContents(data, args?.bodyHtml);
      }
    } else {
      if (postId) {
        await updateOnlyDocument({ ...data, id: postId });
      } else {
        postId = await postOnlyDocument(data);
      }
    }

    await Promise.allSettled([mutateBodyHtml, mutate]);

    return postId;
  };

  return {
    save,
    ...creatorPostSWR,
    data: returnData,
    error: returnErr,
  };
};
