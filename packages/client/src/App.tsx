import CssBaseline from '@mui/material/CssBaseline';
import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './firebase';

import { NavBar } from './components/standalone/NavBar';
import { AuthProvider } from './contexts/AuthContext';
import { IndexPage } from './pages';
import { CreatePage } from './pages/create';

const getLibrary = (provider: any) => {
  return new providers.Web3Provider(provider);
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AuthProvider>
        <CssBaseline />
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<CreatePage />} path="/create" />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </Web3ReactProvider>
  );
}

export default App;
