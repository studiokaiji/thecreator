import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '@/firebase';

import { RouteAuthGuard } from './components/routing/RouteAuthGuard';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { NotFound } from './pages/404';
import { PayoutPage } from './pages/edit/payout';
import { SettingsPage } from './pages/edit/settings';
import { MyPage } from './pages/mypage';
import { CreatorPage } from './pages/u/[id]';
import { SubscribePage } from './pages/u/[id]/subscribe/[planId]';

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
                  <Route path="/c">
                    <Route index element={<NotFound />} />
                    <Route path=":id">
                      <Route index element={<CreatorPage />} />
                      <Route path="subscribe">
                        <Route index element={<NotFound />} />
                        <Route element={<SubscribePage />} path=":planId" />
                      </Route>
                    </Route>
                  </Route>
                  <Route
                    element={
                      <RouteAuthGuard>
                        <CreatePage />
                      </RouteAuthGuard>
                    }
                    path="/create"
                  />
                  <Route element={<RouteAuthGuard />} path="/edit">
                    <Route
                      index
                      element={<Navigate replace to="profile#posts" />}
                    />
                    <Route
                      element={<EditCreatorProfilePage />}
                      path="profile"
                    />
                    <Route element={<PayoutPage />} path="payout" />
                    <Route element={<SettingsPage />} path="settings" />
                    <Route element={<SupportersPage />} path="supporters" />
                  </Route>
                  <Route path="/mypage">
                    <Route index element={<MyPage />} />
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
