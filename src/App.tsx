import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import DashboardFreePage from './pages/DashboardFreePage';
import DashboardUnlockedPage from './pages/DashboardUnlockedPage';
import PremiumDashboardPage from './pages/PremiumDashboardPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<Navigate to="/landing" replace />} />
          <Route path="/landing" element={<HomePage />} />
          
          {/* Analysis flow */}
          <Route path="/analysis" element={<AnalysisPage />} />
          
          {/* Results - Locked (free preview) */}
          <Route path="/dashboardfree" element={<DashboardFreePage />} />
          
          {/* Results - Unlocked (after account creation) */}
          <Route path="/dashboard" element={<DashboardUnlockedPage />} />
          
          {/* Premium dashboard (for subscription users) */}
          <Route path="/premium" element={<PremiumDashboardPage />} />
          
          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/landing" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
