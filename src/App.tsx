import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/Home';
import CollectPage from './pages/Collect';
import RiskPage from './pages/Risk';
import ComparePage from './pages/Compare';
import ReportPage from './pages/Report';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="collect" element={<CollectPage />} />
          <Route path="risks" element={<RiskPage />} />
          <Route path="compare" element={<ComparePage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
