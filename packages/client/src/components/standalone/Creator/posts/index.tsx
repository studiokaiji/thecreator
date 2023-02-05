import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

import { PostCard } from './PostCard';

import { useCreator } from '@/hooks/useCreator';
import { useCreatorPosts } from '@/hooks/useCreatorPosts';

type PostsProps = { id: string };

export const Posts = ({ id }: PostsProps) => {
  const { data: creatorData } = useCreator({ id });

  const { data, error, isLast, loadMore } = useCreatorPosts(id, 2);

  const { inView, ref } = useInView({
    rootMargin: '10px',
  });

  useEffect(() => {
    if (inView && !isLast) {
      loadMore();
    }
  }, [inView]);

  if (error) {
    console.log(error);
  }

  if (data && creatorData) {
    return (
      <Stack spacing={3}>
        {data.map((d) => (
          <PostCard
            {...d}
            key={d.id}
            defaultThumbnailUrl={creatorData.iconImageSrc}
            to={`/c/${id}/posts/${d.id}`}
          />
        ))}
        <Box ref={ref} />
        {inView && !isLast && (
          <Box>
            <CircularProgress sx={{ mx: 'auto' }} />
          </Box>
        )}
      </Stack>
    );
  }

  return (
    <Box>
      <CircularProgress sx={{ mx: 'auto' }} />
    </Box>
  );
};
