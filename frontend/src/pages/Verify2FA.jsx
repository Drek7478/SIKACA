// frontend/src/pages/Verify2FA.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import OtpInput from '../components/common/OtpInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faArrowLeft, faKey } from '@fortawesome/free-solid-svg-icons';

export default function Verify2FA() {
  const { login } = useAuth(); // kita perlu fungsi login? sebenarnya verify2fa akan set session via endpoint, tidak perlu login hook
  const navigate = useNavigate();
  const location = useLocation();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil pending_token dari state navigasi (dikirim dari Login)
  const pendingToken = location.state?.pending_token || '';

  const handleVerify = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setLoading(true);
    try {
      // Panggil endpoint verify-2fa, kirim otp_code dan pending_token (jika ada)
      const response = await fetch('/api/auth/verify-2fa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: otp, pending_token: pendingToken }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        // Redirect sesuai role
        if (res.data.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/kasir', { replace: true });
        }
      } else {
        setError(res.message || 'Verifikasi gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-white to-primary-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <FontAwesomeIcon icon={faShieldHalved} className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi 2FA</h1>
          <p className="text-gray-500 mt-2">Masukkan kode 6 digit dari aplikasi Google Authenticator</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <div className="mb-6">
            <OtpInput onChange={setOtp} error={!!error} />
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={faKey}
            loading={loading}
            onClick={handleVerify}
          >
            Verifikasi
          </Button>

          <button
            onClick={() => navigate('/login', { replace: true })}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}