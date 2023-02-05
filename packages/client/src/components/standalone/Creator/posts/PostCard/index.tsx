import { memo } from 'react';

import { AudioPostCard } from './AudioPostCard';
import { ImagePostCard } from './ImagePostCard';
import { VideoPostCard } from './VideoPostCard';

export type PostCardPropsBase = WithId<CreatorPostDocData> & {
  defaultThumbnailUrl: string;
  to: string;
};

const BeforeMemonizedPostCard = (props: PostCardPropsBase) => {
  const { contentsType } = props;
  return (
    <>
      {contentsType === 'audio' ? (
        <AudioPostCard {...props} />
      ) : contentsType === 'embedVideo' ? (
        <VideoPostCard {...props} />
      ) : (
        <ImagePostCard {...props} />
      )}
    </>
  );
};

export const PostCard = memo(BeforeMemonizedPostCard);
