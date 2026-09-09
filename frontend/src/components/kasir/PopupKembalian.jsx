// frontend/src/components/kasir/PopupKembalian.jsx
import React from 'react';
import Button from '../common/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandHoldingDollar, faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { formatRupiah } from '../../utils/formatRupiah';

/**
 * Popup Jumlah Kembalian
 * @param {number} kembalian - jumlah kembalian
 * @param {number} totalHarga - total transaksi
 * @param {number} uangDiterima - uang yang diberikan customer
 * @param {function} onKonfirmasi - callback saat tombol "Konfirmasi & Simpan Pesanan" diklik
 * @param {function} onKembali - callback untuk kembali ke kalkulator
 */
export default function PopupKembalian({ kembalian, totalHarga, uangDiterima, onKonfirmasi, onKembali }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay gelap */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Card popup */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon icon={faHandHoldingDollar} className="text-4xl text-primary-600" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Jumlah Kembalian</h3>
        <p className="text-gray-500 text-sm mb-6">Berikut rincian pembayaran tunai</p>

        <div className="bg-primary-50 rounded-xl p-4 mb-6 space-y-2 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Transaksi</span>
            <span className="font-medium text-gray-800">{formatRupiah(totalHarga)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Uang Diterima</span>
            <span className="font-medium text-gray-800">{formatRupiah(uangDiterima)}</span>
          </div>
          <div className="border-t border-dashed border-primary-200 pt-2 flex justify-between items-center">
            <span className="font-semibold text-gray-800">Kembalian</span>
            <span className="text-2xl font-bold text-primary-700">{formatRupiah(kembalian)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" icon={faArrowLeft} onClick={onKembali}>
            Kembali
          </Button>
          <Button variant="primary" className="flex-1" icon={faCheckCircle} onClick={onKonfirmasi}>
            Konfirmasi & Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}