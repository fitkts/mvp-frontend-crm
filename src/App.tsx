/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import SchedulePage from './pages/SchedulePage';
import PayrollPage from './pages/PayrollPage';
import SettingsPage from './pages/SettingsPage';
import ProductsPage from './pages/ProductsPage';
import StaffPage from './pages/StaffPage';
import LockerPage from './pages/LockerPage';

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/lockers" element={<LockerPage />} />
          <Route path="/payroll" element={<PayrollPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
