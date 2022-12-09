import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '@/firebase';

import { SnackbarProvider } from './contexts/SnackbarContext';
import { NotFound } from './pages/404';
import { CreatorPage } from './pages/u/[id]';
import { SubscribePage } from './pages/u/[id]/plans/[contractAddress]/subscribe';

import { NavLayout } from '@/components/layout/NavLayout';
import { AuthProvider } from '@/contexts/AuthContext';
import { IndexPage } from '@/pages';
import { CreatePage } from '@/pages/create';
import { EditCreatorProfilePage } from '@/pages/edit/profile';
import { SupportersPage } from '@/pages/edit/supporters';
import { CustomThemeProvider } from '@/theme';

const getLibrary = (provider: any) => {
  return new providers.Web3Provider(provider, 'any');
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <CustomThemeProvider>
          <CssBaseline />
          <SnackbarProvider>
            <BrowserRouter>
              <NavLayout>
                <Routes>
                  <Route element={<IndexPage />} path="/" />
                  <Route element={<CreatePage />} path="/create" />
                  <Route
                    element={<Navigate replace to="/edit/profile#posts" />}
                    path="/edit"
                  />
                  <Route
                    element={<EditCreatorProfilePage />}
                    path="/edit/profile"
                  />
                  <Route element={<SupportersPage />} path="/edit/supporters" />
                  <Route path="c">
                    <Route path=":id">
                      <Route index element={<CreatorPage />} />
                      <Route path="subscribe">
                        <Route
                          element={<SubscribePage />}
                          path=":lockAddress"
                        />
                      </Route>
                    </Route>
                  </Route>
                  <Route element={<NotFound />} path="/*" />
                </Routes>
              </NavLayout>
            </BrowserRouter>
          </SnackbarProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Web3ReactProvider>
  );
}

export default App;
