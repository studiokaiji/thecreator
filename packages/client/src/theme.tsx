import { createTheme, ThemeProvider } from '@mui/material';
import { blue } from '@mui/material/colors';
import { FC, ReactNode } from 'react';

const h = (fontSize: string) => ({
  fontSize,
  fontWeight: 600,
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#000',
    },
    secondary: {
      main: blue[500],
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: h('3.5rem'),
    h2: h('3rem'),
    h3: h('2.5rem'),
    h4: h('2rem'),
    h5: h('1.75rem'),
    h6: h('1.5rem'),
  },
});

export const CustomThemeProvider: FC<{ children: ReactNode }> = ({
  children,
}) => <ThemeProvider theme={theme}>{children}</ThemeProvider>;
