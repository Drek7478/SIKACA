// frontend/src/pages/Setup2FA.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import SidebarAdmin from '../components/admin/SidebarAdmin'; // atau SidebarKasir, sesuai role
import NavbarAdmin from '../components/admin/NavbarAdmin';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import OtpInput from '../components/common/OtpInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faQrcode, faKey, faLock, faUnlock, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function Setup2FA() {
  const { user } = useAuth();
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [password, setPassword] = useState('');

  // Cek status 2FA saat mount
  useEffect(() => {
    // Panggil endpoint me untuk cek is_2fa_enabled? Kita bisa gunakan user dari context, tapi belum ada field tsb.
    // Untuk sementara, kita asumsikan user object memiliki is_2fa_enabled (nanti bisa diambil via /auth/me.php)
    if (user?.is_2fa_enabled) {
      setIsEnabled(true);
    }
  }, [user]);

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/setup-2fa.php', {
        method: 'POST',
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        setSecret(res.data.secret);
        setQrCode(res.data.qr_code);
        setSuccess('QR Code berhasil dibuat. Scan dengan Google Authenticator.');
      } else {
        setError(res.message || 'Gagal generate.');
      }
    } catch (err) {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError('');
    setSuccess('');
    if (otp.length !== 6) {
      setError('Masukkan 6 digit kode OTP.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/confirm-2fa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp_code: otp }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        setSuccess('2FA berhasil diaktifkan!');
        setIsEnabled(true);
      } else {
        setError(res.message || 'Konfirmasi gagal.');
      }
    } catch (err) {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setSuccess('');
    if (!password) {
      setError('Masukkan password untuk konfirmasi.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/auth/disable-2fa.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });
      const res = await response.json();
      if (res.status === 'success') {
        setSuccess('2FA berhasil dinonaktifkan.');
        setIsEnabled(false);
        setShowDisable(false);
        setPassword('');
      } else {
        setError(res.message || 'Gagal menonaktifkan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const Layout = user?.role === 'admin' ? SidebarAdmin : SidebarAdmin; // sementara, bisa sesuaikan
  const Navbar = user?.role === 'admin' ? NavbarAdmin : NavbarAdmin;

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Layout />
      <div className="flex-1 flex flex-col">
        <Navbar title="Keamanan Akun" />
        <main className="flex-1 p-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

          <Card className="max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldHalved} className="text-primary-600" />
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Aktifkan 2FA untuk keamanan ekstra. Gunakan Google Authenticator.
            </p>

            {!isEnabled ? (
              <>
                {!qrCode ? (
                  <Button onClick={handleGenerate} icon={faQrcode} loading={loading}>
                    Aktifkan 2FA (Generate QR)
                  </Button>
                ) : (
                  <div>
                    <div className="mb-4 text-center">
                      <img src={qrCode} alt="QR Code 2FA" className="mx-auto w-48 h-48" />
                      <p className="text-xs text-gray-500 mt-2">Scan dengan Google Authenticator</p>
                      {secret && (
                        <p className="text-xs text-gray-400 mt-1">
                          Manual: <code className="bg-gray-100 px-1 rounded">{secret}</code>
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Kode OTP</label>
                      <OtpInput onChange={setOtp} />
                    </div>
                    <Button onClick={handleConfirm} icon={faKey} loading={loading}>
                      Verifikasi & Aktifkan
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div>
                <p className="text-green-600 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faLock} /> 2FA aktif
                </p>
                {!showDisable ? (
                  <Button variant="danger" icon={faUnlock} onClick={() => setShowDisable(true)}>
                    Nonaktifkan 2FA
                  </Button>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Konfirmasi</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3"
                      placeholder="Masukkan password"
                    />
                    <div className="flex gap-3">
                      <Button variant="danger" icon={faTrash} onClick={handleDisable} loading={loading}>
                        Nonaktifkan
                      </Button>
                      <Button variant="secondary" onClick={() => setShowDisable(false)}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}