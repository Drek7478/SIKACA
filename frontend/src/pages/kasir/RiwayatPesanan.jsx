// frontend/src/pages/kasir/RiwayatPesanan.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SidebarKasir from '../../components/kasir/SidebarKasir';
import NavbarKasir from '../../components/kasir/NavbarKasir';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { getRiwayat, getDetailPesanan } from '../../api/kasir';
import { formatRupiah } from '../../utils/formatRupiah';
import { formatTanggalWaktu } from '../../utils/dateFormat';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTemperatureHalf, faDroplet } from '@fortawesome/free-solid-svg-icons';

export default function RiwayatPesanan() {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch daftar riwayat
  const fetchRiwayat = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRiwayat();
      if (res.status === 'success') {
        setRiwayat(res.data);
      } else {
        setError(res.message || 'Gagal memuat riwayat.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat riwayat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // Fetch detail saat ID dipilih
  const handleSelect = async (idPesanan) => {
    setSelectedId(idPesanan);
    setLoadingDetail(true);
    setDetail(null);
    setError('');
    try {
      const res = await getDetailPesanan(idPesanan);
      if (res.status === 'success') {
        setDetail(res.data);
      } else {
        setError(res.message || 'Gagal memuat detail pesanan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat detail.');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Helper untuk label suhu
  const getSuhuLabel = (suhu) => {
    if (suhu === 'panas') return 'Panas';
    if (suhu === 'dingin') return 'Dingin';
    return suhu;
  };

  // Helper untuk label gula
  const getGulaLabel = (gula) => {
    if (gula === 'regular') return 'Regular Sugar';
    if (gula === 'less') return 'Less Sugar';
    if (gula === 'non') return 'Non Sugar';
    return gula;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <SidebarKasir />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarKasir />
      <div className="flex-1 flex flex-col">
        <NavbarKasir title="Riwayat Pesanan" />
        <main className="flex-1 p-6 flex gap-6 overflow-hidden">
          {/* PANEL KIRI: Daftar ID Pesanan */}
          <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-800 mb-3">ID Pesanan</h3>
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {riwayat.length === 0 ? (
              <p className="text-gray-400 text-sm">Belum ada pesanan.</p>
            ) : (
              <ul className="space-y-2">
                {riwayat.map((item) => (
                  <li key={item.id_pesanan}>
                    <button
                      onClick={() => handleSelect(item.id_pesanan)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        selectedId === item.id_pesanan
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-50 hover:bg-primary-50 text-gray-700'
                      }`}
                    >
                      <p className="font-semibold">{item.id_pesanan}</p>
                      <p className={`text-xs ${selectedId === item.id_pesanan ? 'text-primary-100' : 'text-gray-500'}`}>
                        {formatTanggalWaktu(item.tanggal)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* PANEL KANAN: Detail Pesanan */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto">
            {selectedId === null ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <p>Pilih ID pesanan untuk melihat detail.</p>
              </div>
            ) : loadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <Spinner size="large" />
              </div>
            ) : detail ? (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Detail Pesanan: {detail.pesanan.id_pesanan}
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Tanggal</p>
                    <p className="font-medium">{formatTanggalWaktu(detail.pesanan.tanggal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nama Pembeli</p>
                    <p className="font-medium">{detail.pesanan.nama_pembeli}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tipe Order</p>
                    <p className="font-medium capitalize">{detail.pesanan.tipe_order.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Metode Bayar</p>
                    <p className="font-medium uppercase">{detail.pesanan.metode_bayar}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kasir</p>
                    <p className="font-medium">{detail.pesanan.kasir}</p>
                  </div>
                </div>

                {/* Item Pesanan */}
                <h4 className="font-semibold text-gray-800 mb-3">Item Pesanan</h4>
                <div className="space-y-3">
                  {detail.items.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.nama_menu} <span className="text-sm text-gray-500">x{item.jumlah}</span>
                          </p>
                          {/* Info varian dalam satu baris badge */}
                          {(item.suhu || item.gula) && (
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {item.suhu && (
                                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-xs text-gray-700">
                                  {getSuhuLabel(item.suhu)}
                                </span>
                              )}
                              {item.gula && (
                                <span className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-0.5 text-xs text-gray-700">
                                  {getGulaLabel(item.gula)}
                                </span>
                              )}
                            </div>
                          )}
                          {item.catatan && (
                            <p className="text-sm text-gray-500 mt-1">Catatan: {item.catatan}</p>
                          )}
                        </div>
                        <p className="font-semibold text-primary-700">{formatRupiah(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Total Pesanan</span>
                  <span className="text-2xl font-bold text-primary-700">
                    {formatRupiah(detail.pesanan.total)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">Tidak ada data.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}