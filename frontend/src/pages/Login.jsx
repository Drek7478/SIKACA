// frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faLock,
  faSignInAlt,
  faMugHot,
  faEye,
  faEyeSlash,
  faTriangleExclamation,
  faBan,
} from '@fortawesome/free-solid-svg-icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // State untuk modal peringatan dan blokir
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // untuk disable form

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(username, password);
      if (res.status === 'success') {
        // ===== PENANGANAN 2FA WAJIB =====
        if (res.data?.need_2fa_setup) {
          sessionStorage.setItem('pending_2fa_data', JSON.stringify({
            qr_code: res.data.qr_code,
            secret: res.data.secret,
          }));
          window.location.href = `/setup-2fa-first?token=${res.data.pending_token}`;
          return;
        } else if (res.data?.need_2fa) {
          window.location.href = `/verify-2fa-first?token=${res.data.pending_token}`;
          return;
        } else {
          window.location.href = res.data.role === 'admin' ? '/admin/dashboard' : '/kasir';
          return;
        }
      }
    } catch (err) {
      const responseData = err.response?.data;

      // Tangani blokir permanen
      if (responseData?.data?.is_blocked) {
        setIsBlocked(true);
        setShowBlockedModal(true);
        setError('');
      }
      // Tangani peringatan 2 kali salah
      else if (responseData?.data?.warning) {
        setShowWarningModal(true);
        setError('');
      }
      // Error lainnya
      else {
        setError(responseData?.message || 'Terjadi kesalahan saat login. Coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-primary-50 p-4 relative overflow-hidden">
      {/* Elemen dekoratif blur */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary-200/40 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <FontAwesomeIcon icon={faMugHot} className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">SIKACA</h1>
          <p className="text-gray-500 mt-1">Sistem Informasi Kasir Cafe</p>
        </div>

        {/* Card Login dengan glassmorphism */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            Masuk ke Akun
          </h2>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            {/* Input Username dengan ikon */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isBlocked}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Input Password dengan ikon dan toggle show/hide */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isBlocked}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                  disabled={isBlocked}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={isBlocked}
            >
              Login
            </Button>
          </form>

          {/* Link Lupa Password */}
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
            >
              Lupa Password?
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 SIKACA. All rights reserved.
        </p>
      </div>

      {/* Modal Peringatan 2 kali salah */}
      <Modal
        open={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Peringatan"
        footer={
          <Button variant="primary" onClick={() => setShowWarningModal(false)}>
            Mengerti
          </Button>
        }
      >
        <div className="text-center">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-4xl text-yellow-500 mb-3" />
          <p className="text-gray-700">
            Password salah 2 kali. Satu kali lagi kesalahan, akun Anda akan diblokir.
          </p>
        </div>
      </Modal>

      {/* Modal Akun Diblokir */}
      <Modal
        open={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        title="Akun Diblokir"
        footer={
          <Button variant="danger" onClick={() => setShowBlockedModal(false)}>
            Tutup
          </Button>
        }
      >
        <div className="text-center">
          <FontAwesomeIcon icon={faBan} className="text-4xl text-red-500 mb-3" />
          <p className="text-gray-700">
            Akun Anda telah diblokir karena 3 kali kesalahan memasukkan password.
            Silakan hubungi Admin untuk membuka blokir.
          </p>
        </div>
      </Modal>
    </div>
  );
}