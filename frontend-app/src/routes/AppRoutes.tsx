import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { MainLayout } from '../components/layout/MainLayout';
import { CustomerLayout } from '../components/layout/CustomerLayout';

// Customer Pages (PWA)
import { LandingPage } from '../pages/customer/landing/page';
import { CustomerAuthPage } from '../pages/customer/auth/page';
import { CustomerHomePage } from '../pages/customer/home/page';
import { CustomerServicePage } from '../pages/customer/service/page';
import { CustomerHistoryPage } from '../pages/customer/history/page';

// Admin POS Pages
import { LoginPage as AdminLoginPage } from '../pages/admin/auth/page';
import { DashboardPage as AdminDashboardPage } from '../pages/admin/dashboard/page';
import { ReceptionPage as AdminReceptionPage } from '../pages/admin/reception/page';
import { WorkshopPage as AdminWorkshopPage } from '../pages/admin/workshop/page';
import { WorkshopDetailPage } from '../pages/admin/workshop/DetailPage';
import { ServiceApprovalPage } from '../pages/admin/workshop/ServiceApprovalPage';
import { PaymentPage } from '../pages/admin/workshop/PaymentPage';
import { InventoryPage as AdminInventoryPage } from '../pages/admin/inventory/page';
import { FinancePage as AdminFinancePage } from '../pages/admin/finance/page';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isCustomerAuthenticated } = useAuth();

  return (
    <Routes>
      {/* 1. PUBLIC LANDING PAGE */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. CUSTOMER PWA ROUTES */}
      <Route
        path="/auth"
        element={!isCustomerAuthenticated ? <CustomerAuthPage /> : <Navigate to="/customer/dashboard" replace />}
      />

      <Route
        path="/customer"
        element={isCustomerAuthenticated ? <CustomerLayout /> : <Navigate to="/auth" replace />}
      >
        <Route path="dashboard" element={<CustomerHomePage />} />
        <Route path="service" element={<CustomerServicePage />} />
        <Route path="history" element={<CustomerHistoryPage />} />
      </Route>

      {/* 3. INTERNAL POS ADMIN ROUTES */}
      <Route
        path="/login-admin"
        element={!isAuthenticated ? <AdminLoginPage /> : <Navigate to="/admin/dashboard" replace />}
      />

      <Route
        path="/admin"
        element={isAuthenticated ? <MainLayout /> : <Navigate to="/login-admin" replace />}
      >
        {/* Rute Default Admin: Dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="reception" element={<AdminReceptionPage />} />

        {/* Modul Workshop & Sub-routes (Urutan spesifik diletakkan lebih atas) */}
        <Route path="workshop" element={<AdminWorkshopPage />} />
        <Route path="workshop/history" element={<AdminWorkshopPage initialStage="history" />} />
        <Route path="workshop/:id/approval" element={<ServiceApprovalPage />} />
        <Route path="workshop/:id/payment" element={<PaymentPage />} />
        <Route path="workshop/:id" element={<WorkshopDetailPage />} />

        <Route path="inventory" element={<AdminInventoryPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};