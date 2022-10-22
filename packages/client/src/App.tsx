import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './App.css';
import { IndexPage } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<IndexPage />} path={'/'} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
