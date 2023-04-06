import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export const NotFound = () => {
  return (
    <Box
      sx={{
        left: '50%',
        position: 'absolute',
        textAlign: 'center',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Typography variant="h1">404</Typography>
      <Typography fontWeight={300} lineHeight={1} variant="h4">
        Not Found
      </Typography>
    </Box>
  );
};
