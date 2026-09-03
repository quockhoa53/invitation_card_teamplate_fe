import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { CardEditorPage } from './pages/CardEditorPage';
import { PublicCardPage } from './pages/PublicCardPage';
import { PaymentPage } from './pages/PaymentPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminStatsPage } from './pages/admin/AdminStatsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTemplatesPage } from './pages/admin/AdminTemplatesPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminWithdrawalsPage } from './pages/admin/AdminWithdrawalsPage';
import { AdminPromotionsPage } from './pages/admin/AdminPromotionsPage';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#080b11] text-slate-100' : 'bg-[#fbfbfb] text-slate-800'
    }`}>
      <Routes>
        {/* Public Landing & Catalog */}
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Home />
              <Footer />
            </>
          }
        />

        {/* Public Templates Catalog */}
        <Route
          path="/templates"
          element={
            <>
              <Navbar />
              <TemplatesPage />
              <Footer />
            </>
          }
        />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navbar />
              <Dashboard />
              <Footer />
            </ProtectedRoute>
          }
        />

        {/* Standalone Editor */}
        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <CardEditorPage />
            </ProtectedRoute>
          }
        />

        {/* Payment Checkout */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Navbar />
              <PaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Public Card Interactive Viewer */}
        <Route path="/c/:slug" element={<PublicCardPage />} />

        {/* Admin Portal (Protected + 2FA) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminStatsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="templates" element={<AdminTemplatesPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="withdrawals" element={<AdminWithdrawalsPage />} />
          <Route path="promotions" element={<AdminPromotionsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
