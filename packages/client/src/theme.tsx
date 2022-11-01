import { createTheme, ThemeProvider } from '@mui/material';
import { FC, ReactNode } from 'react';

const h = (fontSize: string) => ({
  fontSize,
  fontWeight: 600,
});

const theme = createTheme({
  typography: {
    h1: h('4rem'),
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
