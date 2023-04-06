import type { SvgIconComponent } from '@mui/icons-material';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type IconWithMessageProps = {
  icon: SvgIconComponent;
  message: string;
};

export const IconWithMessage = ({ icon, message }: IconWithMessageProps) => {
  const Icon = icon;
  return (
    <Stack
      alignItems="center"
      color="GrayText"
      justifyContent="center"
      pb={3}
      spacing={0.5}
      textAlign="center"
    >
      <Icon sx={{ fontSize: 60 }} />
      <Typography fontSize="1.35rem" fontWeight={500}>
        {message}
      </Typography>
    </Stack>
  );
};
