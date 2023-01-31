import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Stack from '@mui/material/Stack';

import type { PostCardPropsBase } from '..';
import { CreatedAtTypography } from '../common/CreateAtTypography';
import { TitleTypography } from '../common/TitleTypography';

import { AudioPlayer } from './AudioPlayer';

const height = 165;

export const AudioPostCard = ({
  contents,
  createdAt,
  defaultThumbnailUrl,
  thumbnailUrl,
  title,
}: PostCardPropsBase) => {
  return (
    <Card sx={{ display: 'flex', height }}>
      <CardMedia
        component="img"
        image={thumbnailUrl || defaultThumbnailUrl}
        sx={{ height, objectFit: 'cover', width: height }}
      />
      <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto', textAlign: 'left' }}>
          <Stack spacing={1}>
            <Box>
              <TitleTypography title={title} />
              <CreatedAtTypography createdAt={createdAt} />
            </Box>
            <Stack spacing={1}>
              <AudioPlayer url={contents[0].url} />
            </Stack>
          </Stack>
        </CardContent>
      </Box>
    </Card>
  );
};
