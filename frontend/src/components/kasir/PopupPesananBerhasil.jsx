// frontend/src/components/kasir/PopupPesananBerhasil.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheckCircle, 
  faPrint, 
  faPlus, 
  faReceipt 
} from '@fortawesome/free-solid-svg-icons';
import Button from '../common/Button';
import { formatRupiah } from '../../utils/formatRupiah';

/**
 * Popup konfirmasi setelah pesanan berhasil dibuat.
 * Tidak bisa ditutup dengan klik luar, hanya lewat tombol di dalam.
 * @param {object} data - { id_pesanan, nama_pembeli, total }
 * @param {function} onNewOrder - reset form transaksi dan tutup popup
 * @param {function} onPrint - cetak struk (opsional)
 */
export default function PopupPesananBerhasil({ data, onNewOrder, onPrint }) {
  if (!data) return null;

  const handlePrint = () => {
    if (onPrint) {
      onPrint(data);
    } else {
      // Default: tampilkan dialog print browser
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay gelap semi-transparan */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* Card modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in p-8 text-center">
        {/* Icon besar check-circle dengan animasi bounce ringan */}
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center animate-bounce">
            <FontAwesomeIcon icon={faCheckCircle} className="text-5xl text-primary-600" />
          </div>
        </div>

        {/* Judul */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil Dibuat!</h3>
        <p className="text-gray-500 text-sm mb-6">Transaksi telah tersimpan dengan detail berikut:</p>

        {/* Ringkasan */}
        <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faReceipt} className="text-primary-500" />
              ID Pesanan
            </span>
            <span className="font-bold text-gray-800">{data.id_pesanan}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Nama Pembeli</span>
            <span className="font-medium text-gray-800">{data.nama_pembeli}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Total Pembayaran</span>
            <span className="font-bold text-primary-700">{formatRupiah(data.total)}</span>
          </div>
        </div>

        {/* Tombol aksi */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            icon={faPrint}
            onClick={handlePrint}
          >
            Cetak Struk
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            icon={faPlus}
            onClick={onNewOrder}
          >
            Pesanan Baru
          </Button>
        </div>
      </div>
    </div>
  );
}