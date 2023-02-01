import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { CreatedAtTypography } from './common/CreateAtTypography';
import { ReadMore } from './common/ReadMore';
import { TitleTypography } from './common/TitleTypography';

import type { PostCardPropsBase } from '.';

import { Iframe } from '@/components/helpers/Iframe';
import { MinimalLink } from '@/components/helpers/MinimalLink';
import { useVideoIframeParam } from '@/hooks/useVideoIframeParam';

export const VideoPostCard = ({
  createdAt,
  customUrl,
  description,
  title,
  to,
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
        <ReadMore href={to}>
          <MinimalLink to={to}>
            <TitleTypography title={title} />
            <CreatedAtTypography createdAt={createdAt} />
          </MinimalLink>
          {description && (
            <Typography mt={2} sx={{ wordWrap: 'break-word' }}>
              {description}
            </Typography>
          )}
        </ReadMore>
      </CardContent>
    </Card>
  );
};
