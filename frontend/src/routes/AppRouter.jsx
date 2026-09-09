// frontend/src/routes/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import KasirRoute from './KasirRoute';

// Halaman yang sudah ada
import Login from '../pages/Login';
import DashboardAdmin from '../pages/admin/DashboardAdmin';
import KelolaKasir from '../pages/admin/KelolaKasir';
import KelolaMenu from '../pages/admin/KelolaMenu';
import LaporanPenjualan from '../pages/admin/LaporanPenjualan';
import PageUtamaKasir from '../pages/kasir/PageUtamaKasir';
import RiwayatPesanan from '../pages/kasir/RiwayatPesanan';
import NotFound from '../pages/NotFound';

// Halaman untuk 2FA saat login pertama
import Setup2FAFirstLogin from '../pages/Setup2FAFirstLogin';
import Verify2FAFirstLogin from '../pages/Verify2FAFirstLogin';

// Halaman untuk manajemen 2FA (diakses setelah login)
import Setup2FA from '../pages/Setup2FA';

// Halaman untuk lupa password
import ForgotPassword from '../pages/ForgotPassword';
import VerifyResetOTP from '../pages/VerifyResetOTP';
import ResetPassword from '../pages/ResetPassword';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES (tidak butuh login) ========== */}
          <Route path="/login" element={<Login />} />

          {/* Alur 2FA saat login pertama */}
          <Route path="/setup-2fa-first" element={<Setup2FAFirstLogin />} />
          <Route path="/verify-2fa-first" element={<Verify2FAFirstLogin />} />

          {/* Alur lupa password */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Redirect root ke login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* ========== ADMIN ROUTES (dilindungi AdminRoute) ========== */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <DashboardAdmin />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/kasir"
            element={
              <AdminRoute>
                <KelolaKasir />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/menu"
            element={
              <AdminRoute>
                <KelolaMenu />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/laporan"
            element={
              <AdminRoute>
                <LaporanPenjualan />
              </AdminRoute>
            }
          />

          {/* ========== KASIR ROUTES (dilindungi KasirRoute) ========== */}
          <Route
            path="/kasir"
            element={
              <KasirRoute>
                <PageUtamaKasir />
              </KasirRoute>
            }
          />
          <Route
            path="/kasir/riwayat"
            element={
              <KasirRoute>
                <RiwayatPesanan />
              </KasirRoute>
            }
          />

          {/* ========== ROUTE PENGATURAN KEAMANAN (2FA) ========== */}
          {/* Halaman manajemen 2FA, dapat diakses oleh admin maupun kasir yang sudah login */}
          <Route
            path="/profile/security"
            element={
              <ProtectedRoute>
                <Setup2FA />
              </ProtectedRoute>
            }
          />

          {/* ========== 404 ========== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}