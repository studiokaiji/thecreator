import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';

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
    loading: 'lazy',
    src: iframeUrl,
    style: {
      aspectRatio: 16 / 9,
      height: 'auto',
      width: '100%',
    },
    width: '100%',
  });

  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!iframeRef.current) {
      return;
    }
    const loadListener = () => {
      setIsLoadingIframe(false);
      console.log('loaded');
    };
    iframeRef.current.removeEventListener('load', loadListener);
    iframeRef.current.addEventListener('load', loadListener);
  }, [iframeRef.current]);

  return (
    <Card>
      <Box
        style={{ aspectRatio: 16 / 9 }}
        sx={{ position: 'relative', width: '100%' }}
      >
        <Iframe
          ref={iframeRef}
          {...iframeParam}
          sx={{ left: 0, position: 'absolute', zIndex: 2 }}
        />
        {isLoadingIframe && (
          <Stack
            alignItems="center"
            height="100%"
            justifyContent="center"
            sx={{
              backgroundColor: 'lightgray',
              zIndex: 1,
            }}
            width="100%"
          >
            <CircularProgress sx={{ color: 'gray' }} />
          </Stack>
        )}
      </Box>
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
