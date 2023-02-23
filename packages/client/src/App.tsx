import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import '@/firebase';

import { EditLayout } from './components/layout/EditLayout';
import { TopBarLayout } from './components/layout/TopBarLayout';
import { RouteAuthGuard } from './components/routing/RouteAuthGuard';
import { SnackbarProvider } from './contexts/SnackbarContext';
import { NotFound } from './pages/404';
import { PayoutPage } from './pages/edit/payout';
import { TextPostPage } from './pages/edit/post/text';
import { SettingsPage } from './pages/edit/settings';
import { MyPage } from './pages/mypage';
import { NotificationsPage } from './pages/mypage/notifications';
import { UserSettingsPage } from './pages/mypage/settings';
import { SupportingCreatorsPage } from './pages/mypage/supporting-creators';
import { CreatorPage } from './pages/u/[id]';
import { SubscribePage } from './pages/u/[id]/subscribe/[planId]';

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
              <Routes>
                <Route element={<TopBarLayout />}>
                  <Route path="/">
                    <Route index element={<IndexPage />} />
                  </Route>
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
                  <Route element={<MyPage />} path="/mypage">
                    <Route
                      index
                      element={<Navigate to="/mypage/supporting-creators" />}
                    />
                    <Route element={<UserSettingsPage />} path="settings" />
                    <Route
                      element={<SupportingCreatorsPage />}
                      path="supporting-creators"
                    />
                    <Route
                      element={<NotificationsPage />}
                      path="notifications"
                    />
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
                <Route
                  element={
                    <EditLayout>
                      <RouteAuthGuard />
                    </EditLayout>
                  }
                  path="/edit"
                >
                  <Route index element={<Navigate replace to="profile" />} />
                  <Route element={<EditCreatorProfilePage />} path="profile" />
                  <Route element={<PayoutPage />} path="payout" />
                  <Route element={<SettingsPage />} path="settings" />
                  <Route element={<SupportersPage />} path="supporters" />
                </Route>
                <Route
                  element={
                    <RouteAuthGuard>
                      <TextPostPage />
                    </RouteAuthGuard>
                  }
                  path="/edit/post/text"
                >
                  <Route index />
                  <Route path=":postId" />
                </Route>
                <Route element={<NotFound />} path="/*" />
              </Routes>
            </BrowserRouter>
          </SnackbarProvider>
        </CustomThemeProvider>
      </AuthProvider>
    </Web3ReactProvider>
  );
}

export default App;
