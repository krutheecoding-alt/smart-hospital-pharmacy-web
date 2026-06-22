import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DrugsPage } from './pages/DrugsPage';
import { PurchasePage } from './pages/PurchasePage';
import { ReceivePage } from './pages/ReceivePage';
import { IssuePage } from './pages/IssuePage';
import { ReturnPage } from './pages/ReturnPage';
import { DestroyPage } from './pages/DestroyPage';
import { ReportPage } from './pages/ReportPage';

export default function App() {
  return (
    <ThemeProvider>
      <BrandingProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="drug" element={<DrugsPage />} />
                  <Route path="purchase" element={<PurchasePage />} />
                  <Route path="receive" element={<ReceivePage />} />
                  <Route path="issue" element={<IssuePage />} />
                  <Route path="return" element={<ReturnPage />} />
                  <Route path="destroy" element={<DestroyPage />} />
                  <Route path="report" element={<ReportPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </BrandingProvider>
    </ThemeProvider>
  );
}
