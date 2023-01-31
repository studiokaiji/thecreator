import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { CreatedAtTypography } from './common/CreateAtTypography';
import { TitleTypography } from './common/TitleTypography';

import type { PostCardPropsBase } from '.';

import { Iframe } from '@/components/helpers/Iframe';
import { useVideoIframeParam } from '@/hooks/useVideoIframeParam';

export const VideoPostCard = ({
  createdAt,
  customUrl,
  title,
}: PostCardPropsBase) => {
  const iframeParam = useVideoIframeParam({
    height: 'auto',
    src: customUrl,
    style: {
      aspectRatio: 16 / 9,
      height: 'auto',
      width: '100%',
    },
    width: '100%',
  });

  return (
    <Card>
      <Iframe {...iframeParam} />
      <CardContent sx={{ textAlign: 'left' }}>
        <TitleTypography title={title} />
        <CreatedAtTypography createdAt={createdAt} />
      </CardContent>
    </Card>
  );
};
