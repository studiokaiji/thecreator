import Stack from '@mui/material/Stack';
import { memo } from 'react';

import { PostCard } from './PostCard';

import { useCreator } from '@/hooks/useCreator';
import { useCreatorPosts } from '@/hooks/useCreatorPosts';

type PostsProps = { id: string };

const BeforeMemonizedPosts = ({ id }: PostsProps) => {
  const { data: creatorData } = useCreator({ id });

  const { data, error } = useCreatorPosts(id);

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
      </Stack>
    );
  }

  return <></>;
};

export const Posts = memo(BeforeMemonizedPosts);
