// frontend/src/pages/ForgotPassword.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        setSuccess(res.message);
        // Arahkan ke halaman verifikasi OTP setelah beberapa saat? bisa langsung navigate dengan state
        // Untuk kejelasan, kita arahkan setelah 2 detik
        setTimeout(() => {
          navigate('/verify-reset-otp', { state: { email } });
        }, 1500);
      } else {
        setError(res.message || 'Gagal mengirim OTP.');
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
            <FontAwesomeIcon icon={faEnvelope} className="text-3xl text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Lupa Password</h1>
          <p className="text-gray-500 mt-2">Masukkan email terdaftar, kami kirim kode OTP</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 p-8">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <FontAwesomeIcon icon={faEnvelope} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              icon={faPaperPlane}
              loading={loading}
            >
              Kirim OTP
            </Button>
          </form>

          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full text-center text-sm text-gray-500 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowLeft} /> Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  );
}