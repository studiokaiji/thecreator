import Alert, { AlertColor } from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Snackbar, { SnackbarProps } from '@mui/material/Snackbar';
import { createContext, useState } from 'react';

type SnackbarContextProps = {
  isOpen: boolean;
  message: string;
  severity?: AlertColor;
  setSeverity: (serverity?: AlertColor) => void;
  setIsOpen: (isOpen: boolean) => void;
  setMessage: (message: string) => void;
};

export const SnackbarContext = createContext<SnackbarContextProps>({
  isOpen: false,
  message: '',
  setIsOpen: () => null,
  setMessage: () => null,
  setSeverity: () => null,
});

export const SnackbarProvider = (props: SnackbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>();

  return (
    <SnackbarContext.Provider
      value={{ isOpen, message, setIsOpen, setMessage, setSeverity, severity }}
    >
      <Box>
        {props.children}
        <Snackbar
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          autoHideDuration={3000}
          {...props}
          onClose={() => setIsOpen(false)}
          open={isOpen}
        >
          <Alert severity={severity}>{message}</Alert>
        </Snackbar>
      </Box>
    </SnackbarContext.Provider>
  );
};
