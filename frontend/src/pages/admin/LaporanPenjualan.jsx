// frontend/src/pages/admin/LaporanPenjualan.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import NavbarAdmin from '../../components/admin/NavbarAdmin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import ChartBar from '../../components/admin/ChartBar';
import { getLaporanHarian, getLaporanMingguan, getLaporanBulanan } from '../../api/admin';
import { formatRupiah } from '../../utils/formatRupiah';
import { formatTanggal } from '../../utils/dateFormat';

export default function LaporanPenjualan() {
  const [activeTab, setActiveTab] = useState('harian'); // 'harian' | 'mingguan' | 'bulanan'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);

  // State untuk parameter harian
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  // State untuk parameter mingguan
  const [tahunMingguan, setTahunMingguan] = useState(new Date().getFullYear());
  const [bulanMingguan, setBulanMingguan] = useState(new Date().getMonth() + 1);
  const [mingguKe, setMingguKe] = useState(1);
  // State untuk parameter bulanan
  const [tahunBulanan, setTahunBulanan] = useState(new Date().getFullYear());
  const [bulanBulanan, setBulanBulanan] = useState(new Date().getMonth() + 1);

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (activeTab === 'harian') {
        res = await getLaporanHarian(tanggal);
      } else if (activeTab === 'mingguan') {
        res = await getLaporanMingguan(tahunMingguan, bulanMingguan, mingguKe);
      } else {
        res = await getLaporanBulanan(tahunBulanan, bulanBulanan);
      }

      if (res.status === 'success') {
        setReportData(res.data);
      } else {
        setError(res.message || 'Gagal memuat laporan.');
        setReportData(null);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat laporan.');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [activeTab, tanggal, tahunMingguan, bulanMingguan, mingguKe, tahunBulanan, bulanBulanan]);

  useEffect(() => {
    fetchLaporan();
  }, [fetchLaporan]);

  const tabStyle = (tab) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? 'bg-primary-600 text-white shadow-sm'
        : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-700'
    }`;

  const renderRingkasan = () => {
    if (!reportData?.ringkasan) return null;
    const r = reportData.ringkasan;
    const rows = [
      { label: 'Jumlah Transaksi', value: r.jumlah_transaksi || 0 },
      { label: 'Total Produk Terjual', value: r.total_produk_terjual || 0 },
      { label: 'Rata-rata per Transaksi', value: formatRupiah(r.rata_rata_per_transaksi || 0) },
      { label: 'Total Penjualan', value: formatRupiah(r.total_penjualan || 0) },
    ];
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {rows.map((row, idx) => (
          <Card key={idx} className="text-center">
            <p className="text-sm text-gray-500 mb-1">{row.label}</p>
            <p className="text-xl font-bold text-gray-800">{row.value}</p>
          </Card>
        ))}
      </div>
    );
  };

  const renderCharts = () => {
    if (!reportData) return null;
    const terlarisLabels = reportData.menu_terlaris?.map((m) => m.nama) || [];
    const terlarisValues = reportData.menu_terlaris?.map((m) => Number(m.total_terjual)) || [];
    const kurangLabels = reportData.menu_kurang?.map((m) => m.nama) || [];
    const kurangValues = reportData.menu_kurang?.map((m) => Number(m.total_terjual)) || [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <ChartBar
            labels={terlarisLabels}
            data={terlarisValues}
            labelDataset="Jumlah Terjual"
            title="10 Menu Terlaris"
          />
        </Card>
        <Card>
          <ChartBar
            labels={kurangLabels}
            data={kurangValues}
            labelDataset="Jumlah Terjual"
            title="10 Menu Kurang Diminati"
            warna="#94a3b8"
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <NavbarAdmin title="Laporan Penjualan" />
        <main className="flex-1 p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit">
            <button className={tabStyle('harian')} onClick={() => setActiveTab('harian')}>
              Harian
            </button>
            <button className={tabStyle('mingguan')} onClick={() => setActiveTab('mingguan')}>
              Mingguan
            </button>
            <button className={tabStyle('bulanan')} onClick={() => setActiveTab('bulanan')}>
              Bulanan
            </button>
          </div>

          {/* Filter sesuai tab */}
          <div className="flex flex-wrap gap-4 items-end mb-6">
            {activeTab === 'harian' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  />
                </div>
              </>
            )}
            {activeTab === 'mingguan' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={tahunMingguan}
                    onChange={(e) => setTahunMingguan(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white w-24"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bulan</label>
                  <select
                    value={bulanMingguan}
                    onChange={(e) => setBulanMingguan(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Minggu ke</label>
                  <select
                    value={mingguKe}
                    onChange={(e) => setMingguKe(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {[1, 2, 3, 4, 5].map((m) => (
                      <option key={m} value={m}>
                        Minggu {m}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {activeTab === 'bulanan' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Tahun</label>
                  <input
                    type="number"
                    value={tahunBulanan}
                    onChange={(e) => setTahunBulanan(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white w-24"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Bulan</label>
                  <select
                    value={bulanBulanan}
                    onChange={(e) => setBulanBulanan(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(2026, i, 1).toLocaleString('id-ID', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <Button onClick={fetchLaporan} loading={loading}>
              Tampilkan
            </Button>
          </div>

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="large" />
            </div>
          ) : (
            <>
              {renderRingkasan()}
              {renderCharts()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}