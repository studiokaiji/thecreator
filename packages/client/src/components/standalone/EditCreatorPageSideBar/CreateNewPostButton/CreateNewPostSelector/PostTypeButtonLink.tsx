import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type PostTypeButtonLinkProps = {
  icon: ReactNode;
  text: string;
  to: string;
};

export const PostTypeButtonLink = ({
  icon,
  text,
  to,
}: PostTypeButtonLinkProps) => {
  return (
    <ButtonBase
      href={to}
      sx={(theme) => ({
        ':hover': {
          backgroundColor: theme.palette.grey[200],
        },
        height: 80,
        width: '100%',
      })}
    >
      <Box sx={{ mx: 'auto', textAlign: 'center' }}>
        {icon}
        <Typography fontWeight={500}>{text}</Typography>
      </Box>
    </ButtonBase>
  );
};
