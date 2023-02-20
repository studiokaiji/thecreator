import { useCreatorPostForWrite } from './useCreatorPostForWrite';
import { useCreatorTextPost } from './useCreatorTextPost';
import { useWallet } from './useWallet';

import { EditorData } from '@/components/standalone/EditCreatorPageSideBar/CreateNewPostButton/TextPost/Editor';

export const useCreatorOwnTextPost = (postId?: string) => {
  const { account } = useWallet();

  const creatorTextPostSWR = useCreatorTextPost(account, postId);

  const {
    data: post,
    error: creatorPostErr,
    mutate,
    mutatePostDocument,
  } = creatorTextPostSWR;

  const { postContents, postOnlyDocument, updateContents, updateOnlyDocument } =
    useCreatorPostForWrite();

  const save = async (
    args: {
      isPublic?: boolean;
    } & Partial<EditorData>
  ) => {
    if (!account || (postId && !post && !creatorPostErr) || creatorPostErr) {
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

    if (args?.bodyHtml && args?.bodyHtml !== post?.bodyHtml) {
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

    await Promise.allSettled([mutatePostDocument, mutate]);

    return postId;
  };

  return { save, ...creatorTextPostSWR };
};
