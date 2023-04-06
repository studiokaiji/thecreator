import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

export type PostTypeButtonLinkProps = {
  icon: ReactNode;
  text: string;
  onClick?: () => void;
};

export const PostTypeButtonLink = ({
  icon,
  onClick,
  text,
}: PostTypeButtonLinkProps) => {
  return (
    <ButtonBase
      onClick={onClick}
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
