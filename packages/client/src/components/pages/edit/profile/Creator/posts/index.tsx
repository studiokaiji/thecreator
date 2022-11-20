import Stack from '@mui/material/Stack';

import { AudioPostCard } from './AudioPostCard';
import { PostCard } from './PostCard';

export const Posts = () => {
  return (
    <Stack spacing={3}>
      <AudioPostCard
        audioSrc="https://amachamusic.chagasi.com/mp3/yume.mp3"
        contentTitle="Audio"
        coverImage={{ src: '' }}
        to="/"
      />
      <PostCard
        content={{ text: 'text', title: 'Image' }}
        media={{
          src: 'https://i2.wp.com/getwallpapers.com/wallpaper/full/d/8/9/67046.jpg',
          type: 'img',
        }}
        to=""
      />
      <PostCard
        content={{ text: 'text', title: 'Video' }}
        media={{
          src: 'https://i.imgur.com/z5RXCHA.mp4',
          type: 'video',
        }}
        to=""
      />
    </Stack>
  );
};
