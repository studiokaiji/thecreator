import { AudioPostCard } from './AudioPostCard';
import { ImagePostCard } from './ImagePostCard';
import { VideoPostCard } from './VideoPostCard';

type PostCardProps = {
  to: string;
} & PostCardPropsBase;

export type PostCardPropsBase = WithId<CreatorPostDocData> & {
  defaultThumbnailUrl: string;
};

export const PostCard = (props: PostCardProps) => {
  const { contentsType } = props;
  return (
    <>
      {contentsType === 'audio' ? (
        <AudioPostCard {...props} />
      ) : contentsType === 'video' ? (
        <VideoPostCard {...props} />
      ) : (
        <ImagePostCard {...props} />
      )}
    </>
  );
};
