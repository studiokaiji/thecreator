import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

type LoaderWithMessageProps = {
  message: string;
};

export const LoaderWithMessage = ({
  message,
}: LoaderWithMessageProps) => {
  return (
    <Stack alignItems="center" spacing={2} textAlign="center">
      <CircularProgress sx={{ mx: 'auto' }} />
      <Typography>{message}</Typography>
    </Stack>
  );
};
