// frontend/src/pages/Verify2FAFirstLogin.jsx
import React, { useState } from 'react';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import OtpInput from '../components/common/OtpInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faKey, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Verify2FAFirstLogin() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil token dari query string
  const query = new URLSearchParams(window.location.search);
  const pending_token = query.get('token');

  if (!pending_token) {
    window.location.href = '/login';
    return null;
  }

  const handleVerify = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-2fa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pending_token, otp_code: otp }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        // Simpan user untuk fallback AuthContext
        sessionStorage.setItem('sikaca_user', JSON.stringify(res.data));
        window.location.replace(res.data.role === 'admin' ? '/admin/dashboard' : '/kasir');
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
          <p className="text-gray-500 mt-2">Masukkan kode dari Google Authenticator</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <div className="mb-6">
            <OtpInput onChange={setOtp} error={!!error} />
          </div>
          <Button variant="primary" size="lg" className="w-full" icon={faKey} loading={loading} onClick={handleVerify}>
            Verifikasi
          </Button>
          <button onClick={() => window.location.href = '/login'} className="mt-4 w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faArrowLeft} /> Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}