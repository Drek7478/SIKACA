// frontend/src/components/kasir/KalkulatorTunai.jsx
import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDeleteLeft, faTrash, faCalculator, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { formatRupiah } from '../../utils/formatRupiah';

/**
 * Kalkulator Pembayaran Tunai
 * @param {array} cart - array item keranjang
 * @param {number} totalHarga - total transaksi
 * @param {function} onHitung - callback(uangDiterima) saat tombol Hitung diklik dan uang cukup
 * @param {function} onBatal - callback saat tombol Batal diklik (opsional)
 */
export default function KalkulatorTunai({ cart, totalHarga, onHitung, onBatal }) {
  const [uangInput, setUangInput] = useState('');
  const [error, setError] = useState('');

  // Reset error saat input berubah
  useEffect(() => {
    if (error) setError('');
  }, [uangInput]);

  // Fungsi untuk menambah digit dari keypad
  const handleKeypad = (digit) => {
    // Cegah input melebihi 9 digit (misal)
    if (uangInput.length < 9) {
      setUangInput((prev) => prev + digit);
    }
  };

  // Hapus satu digit terakhir
  const handleBackspace = () => {
    setUangInput((prev) => prev.slice(0, -1));
  };

  // Clear semua input
  const handleClear = () => {
    setUangInput('');
    setError('');
  };

  // Validasi dan hitung
  const handleHitung = () => {
    const uang = parseInt(uangInput, 10);
    if (isNaN(uang) || uang <= 0) {
      setError('Masukkan jumlah uang yang diterima.');
      return;
    }
    if (uang < totalHarga) {
      const kurang = totalHarga - uang;
      setError(`Uang tidak mencukupi, kurang ${formatRupiah(kurang)}`);
      return;
    }
    // Uang cukup → panggil callback
    onHitung(uang);
  };

  // Keypad angka
  const keypad = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Card popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl shadow-lg shadow-primary-200 mb-3">
              <FontAwesomeIcon icon={faCalculator} className="text-2xl text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Kalkulator Pembayaran Tunai</h3>
          </div>

          {/* Ringkasan item */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Ringkasan Pesanan</h4>
            <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-1">
              {cart.map((item) => (
                <div key={item.cartItemKey} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.nama} <span className="text-gray-400">x{item.jumlah}</span>
                  </span>
                  <span className="text-gray-700 font-medium">{formatRupiah(item.harga * item.jumlah)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center mb-4 bg-primary-50 rounded-lg px-4 py-3">
            <span className="font-semibold text-gray-800">Total Transaksi</span>
            <span className="text-xl font-bold text-primary-700">{formatRupiah(totalHarga)}</span>
          </div>

          {/* Input uang diterima */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Uang Diterima</label>
            <div className="relative">
              <FontAwesomeIcon icon={faMoneyBill} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                inputMode="numeric"
                value={uangInput}
                onChange={(e) => setUangInput(e.target.value.replace(/\D/g, ''))}
                placeholder="0"
                className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Error */}
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {keypad.slice(0, 9).map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeypad(digit)}
                className="py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-semibold text-gray-700 transition-colors"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="py-3 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium text-red-600 transition-colors flex items-center justify-center gap-1"
            >
              <FontAwesomeIcon icon={faTrash} /> Clear
            </button>
            <button
              onClick={() => handleKeypad('0')}
              className="py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-lg font-semibold text-gray-700 transition-colors"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-600 transition-colors flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faDeleteLeft} />
            </button>
          </div>

          {/* Tombol aksi */}
          <div className="flex gap-3">
            {onBatal && (
              <Button variant="secondary" className="flex-1" onClick={onBatal}>
                Batal
              </Button>
            )}
            <Button variant="primary" className="flex-1" onClick={handleHitung}>
              Hitung
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}