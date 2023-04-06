import { styled } from '@mui/system';
import { memo } from 'react';

const BeforeMemonizedIframe = styled('iframe')({
  border: 0,
});

export const Iframe = memo(BeforeMemonizedIframe);
