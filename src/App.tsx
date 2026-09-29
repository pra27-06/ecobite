import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CampusProvider } from './context/CampusContext';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { CampusAccessPage } from './pages/CampusAccessPage';
import { ScanFoodPage } from './pages/ScanFoodPage';
import { SearchFoodPage } from './pages/SearchFoodPage';
import { FoodAnalysisPage } from './pages/FoodAnalysisPage';
import { SmartSwapPage } from './pages/SmartSwapPage';
import { WeeklyImpactPage } from './pages/WeeklyImpactPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CanteenOwnerDashboardPage } from './pages/CanteenOwnerDashboardPage';
import { ContextPage } from './pages/ContextPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CampusProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<HomePage />} />
              <Route path="campus" element={<CampusAccessPage />} />
              <Route path="scan" element={<ScanFoodPage />} />
              <Route path="search" element={<SearchFoodPage />} />
              <Route path="analysis" element={<FoodAnalysisPage />} />
              <Route path="analysis/:foodId" element={<FoodAnalysisPage />} />
              <Route path="swap" element={<SmartSwapPage />} />
              <Route path="swap/:foodId" element={<SmartSwapPage />} />
              <Route path="impact" element={<WeeklyImpactPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/mait" element={<AdminDashboardPage />} />
              <Route path="owner" element={<CanteenOwnerDashboardPage />} />
              <Route path="canteen-owner" element={<CanteenOwnerDashboardPage />} />
              <Route path="context" element={<ContextPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CampusProvider>
    </AuthProvider>
  );
};

export default App;
