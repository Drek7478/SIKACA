// frontend/src/pages/VerifyResetOTP.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import OtpInput from '../components/common/OtpInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faKey, faArrowLeft, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons';

export default function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/verify-reset-otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code: otp }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        // Simpan email di state untuk reset password
        navigate('/reset-password', { state: { email } });
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
            <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Verifikasi OTP</h1>
          <p className="text-gray-500 mt-2">Masukkan kode OTP yang dikirim ke email Anda</p>
          {email && <p className="text-sm text-primary-600 mt-1">{email}</p>}
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
            onClick={() => navigate('/forgot-password')}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}