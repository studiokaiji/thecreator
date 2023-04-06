import Typography, { TypographyProps } from '@mui/material/Typography';

import { useRelativeDateString } from '@/hooks/useRelativeDateString';

export const CreatedAtTypography = (
  props: TypographyProps & { createdAt: Date }
) => {
  const relativeCreatedAt = useRelativeDateString(props.createdAt);
  return (
    <Typography color={'GrayText'} fontSize={12} lineHeight={1.2} {...props}>
      {relativeCreatedAt}
    </Typography>
  );
};
