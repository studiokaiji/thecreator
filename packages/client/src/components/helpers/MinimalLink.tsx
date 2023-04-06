import { styled } from '@mui/system';
import { Link } from 'react-router-dom';

export const MinimalLink = styled(Link)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'white' : 'black',
  textDecoration: 'none',
}));
