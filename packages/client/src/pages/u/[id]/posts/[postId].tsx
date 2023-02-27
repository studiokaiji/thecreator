import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import '@/styles/textpost.css';

import { PostCard } from '@/components/standalone/Creator/posts/PostCard';
import { useCreator } from '@/hooks/useCreator';
import { useCreatorPost } from '@/hooks/useCreatorPost';

export const PostPage = () => {
  const { id, postId } = useParams();
  const { data: creator, error: creatorErr } = useCreator({ id });
  const { data: post, error: postErr } = useCreatorPost(id, postId);

  if (postErr || creatorErr) {
    return <pre>{postErr || creatorErr}</pre>;
  }

  return (
    <Box maxWidth={740} mt={14} mx="auto">
      {post && creator ? (
        <Stack spacing={7}>
          {post.contentsType === 'text' || post.contentsType === 'images' ? (
            <>
              {post.thumbnailUrl && (
                <Box
                  component="img"
                  src={post.thumbnailUrl}
                  sx={{ width: '100%' }}
                />
              )}
              <h1>{post?.title}</h1>
              {post.contentsType === 'text' ? <div></div> : <div></div>}
            </>
          ) : (
            <PostCard
              {...post}
              defaultThumbnailUrl={creator?.iconImageSrc}
              to=""
            />
          )}
        </Stack>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};
