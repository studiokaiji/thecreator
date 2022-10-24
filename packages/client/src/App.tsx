import { Web3ReactProvider } from '@web3-react/core';
import { providers } from 'ethers';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './firebase';

import './App.css';
import { IndexPage } from './pages';

const getLibrary = (provider: any) => {
  return new providers.Web3Provider(provider);
};

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <BrowserRouter>
        <Routes>
          <Route element={<IndexPage />} path={'/'} />
        </Routes>
      </BrowserRouter>
    </Web3ReactProvider>
  );
}

export default App;
