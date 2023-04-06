import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export const MainLoading = () => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      height: '100vh',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }}
  >
    <Box>
      <CircularProgress sx={{ left: '50% ', transform: 'translate(-50%)' }} />
      <Typography fontWeight={500} mt={0.5}>
        Loading
      </Typography>
    </Box>
  </Box>
);
