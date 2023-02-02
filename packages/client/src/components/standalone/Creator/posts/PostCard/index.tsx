import { AudioPostCard } from './AudioPostCard';
import { ImagePostCard } from './ImagePostCard';
import { VideoPostCard } from './VideoPostCard';

export type PostCardPropsBase = WithId<CreatorPostDocData> & {
  defaultThumbnailUrl: string;
  to: string;
};

export const PostCard = (props: PostCardPropsBase) => {
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
