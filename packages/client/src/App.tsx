import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './firebase';

import { NavLayout } from './components/layout/NavLayout';
import { AuthProvider } from './contexts/AuthContext';
import { IndexPage } from './pages';
import { CreatePage } from './pages/create';
import { EditCreatorProfilePage } from './pages/edit/profile';
import { CustomThemeProvider } from './theme';

const getLibrary = (provider: any) => {
  return new providers.Web3Provider(provider);
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <CustomThemeProvider>
          <CssBaseline />
          <BrowserRouter>
            <NavLayout>
              <Routes>
                <Route element={<IndexPage />} path="/" />
                <Route element={<CreatePage />} path="/create" />
                <Route
                  element={<EditCreatorProfilePage />}
                  path="/edit/profile"
                />
              </Routes>
            </NavLayout>
          </BrowserRouter>
        </CustomThemeProvider>
      </AuthProvider>
    </Web3ReactProvider>
  );
}

export default App;
