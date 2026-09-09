// frontend/src/pages/Setup2FAFirstLogin.jsx
import React, { useState } from 'react';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import OtpInput from '../components/common/OtpInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faKey, faArrowLeft, faCopy, faCheckCircle, faQrcode } from '@fortawesome/free-solid-svg-icons';

export default function Setup2FAFirstLogin() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [copied, setCopied] = useState(false);

  const query = new URLSearchParams(window.location.search);
  const pending_token = query.get('token');

  const stored = sessionStorage.getItem('pending_2fa_data');
  const { qr_code, secret } = stored ? JSON.parse(stored) : {};

  if (!pending_token) {
    window.location.href = '/login';
    return null;
  }

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/setup-2fa-confirm.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pending_token, otp_code: otp }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        sessionStorage.setItem('sikaca_user', JSON.stringify(res.data));
        sessionStorage.removeItem('pending_2fa_data');
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
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-4">
            <FontAwesomeIcon icon={faShieldHalved} className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Setup Google Authenticator</h1>
          <p className="text-gray-500 mt-2">Scan QR Code untuk mengaktifkan 2FA</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          <div className="text-center mb-6">
            {qr_code ? (
              <img src={qr_code} alt="QR Code 2FA" className="mx-auto w-56 h-56 border border-gray-200 rounded-xl" />
            ) : (
              <div className="mx-auto w-56 h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                QR tidak tersedia
              </div>
            )}
          </div>

          {/* Instruksi */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <p className="text-sm text-gray-600">Buka aplikasi Google Authenticator di HP Anda</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <p className="text-sm text-gray-600">
                Tap tombol <FontAwesomeIcon icon={faQrcode} className="mx-1" /> lalu pilih <strong>Scan QR Code</strong>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <p className="text-sm text-gray-600">Arahkan kamera ke QR Code di layar ini</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <p className="text-sm text-gray-600">Masukkan 6 digit kode yang muncul di aplikasi</p>
            </div>
          </div>

          {/* Manual entry */}
          <div className="mb-6">
            {showManual && secret && (
              <div className="mt-2 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <code className="text-sm text-gray-700 flex-1 break-all">{secret}</code>
                <button onClick={handleCopySecret} className="text-primary-600 hover:text-primary-700" title="Salin">
                  {copied ? <FontAwesomeIcon icon={faCheckCircle} /> : <FontAwesomeIcon icon={faCopy} />}
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Kode OTP</label>
            <OtpInput onChange={setOtp} error={!!error} />
          </div>

          <Button variant="primary" size="lg" className="w-full" icon={faKey} loading={loading} onClick={handleSubmit}>
            Verifikasi & Aktifkan
          </Button>
        </div>
      </div>
    </div>
  );
}