import { AlertColor } from '@mui/material';
import { useContext } from 'react';

import { SnackbarContext } from '@/contexts/SnackbarContext';

export const useSnackbar = () => {
  const { setIsOpen, setMessage, setSeverity } = useContext(SnackbarContext);

  const open = (message: string, severityColor?: AlertColor) => {
    setMessage(message);
    setSeverity(severityColor);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { close, open };
};
