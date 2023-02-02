import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { CreatedAtTypography } from './common/CreateAtTypography';
import { ReadMore } from './common/ReadMore';
import { TitleTypography } from './common/TitleTypography';

import type { PostCardPropsBase } from '.';

import { Iframe } from '@/components/helpers/Iframe';
import { MinimalLink } from '@/components/helpers/MinimalLink';
import { useVideoIframeParam } from '@/hooks/useVideoIframeParam';

export const VideoPostCard = ({
  contents,
  createdAt,
  title,
  to,
}: PostCardPropsBase) => {
  const content = contents[0];

  const [iframeUrl, setIframeUrl] = useState('');
  
  useEffect(() => {
    if (!content.url) {
      return;
    }
    fetch(content.url).then(async (res) => {
      const url = await res.text();
      setIframeUrl(url);
    });
  }, [content.url]);

  const iframeParam = useVideoIframeParam({
    height: 'auto',
    src: iframeUrl,
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
          {content.description && (
            <Typography mt={2} sx={{ wordWrap: 'break-word' }}>
              {content.description}
            </Typography>
          )}
        </ReadMore>
      </CardContent>
    </Card>
  );
};
