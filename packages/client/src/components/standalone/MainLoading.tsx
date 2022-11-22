import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export const MainLoading = () => (
  <Box
    sx={{
      left: '50%',
      position: 'absolute',
      textAlign: 'center',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }}
  >
    <CircularProgress sx={{ left: '50% ', transform: 'translate(-50%)' }} />
    <Typography fontWeight={500} mt={0.5}>
      Loading
    </Typography>
  </Box>
);
