// frontend/src/pages/admin/DashboardAdmin.jsx
import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import NavbarAdmin from '../../components/admin/NavbarAdmin';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';
import Alert from '../../components/common/Alert';
import { getDashboard } from '../../api/admin';
import { formatRupiah } from '../../utils/formatRupiah';
import { Line } from 'react-chartjs-2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserTie, 
  faMoneyBillWave, 
  faUsers, 
  faChartLine 
} from '@fortawesome/free-solid-svg-icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboard();
        if (res.status === 'success') {
          setData(res.data);
        } else {
          setError(res.message || 'Gagal memuat dashboard.');
        }
      } catch (err) {
        setError('Terjadi kesalahan saat memuat dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Siapkan data untuk Line Chart
  const chartLabels = data?.pendapatan_bulanan?.map((item) => item.periode) || [];
  const chartValues = data?.pendapatan_bulanan?.map((item) => Number(item.pendapatan)) || [];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Pendapatan (Rp)',
        data: chartValues,
        borderColor: '#2d9e2d',
        backgroundColor: 'rgba(45, 158, 45, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2d9e2d',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Pendapatan Bulanan (12 Bulan Terakhir)', color: '#1f2937' },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280' } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280' } },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <NavbarAdmin title="Dashboard" />
        <main className="flex-1 p-6">
          {error && <Alert type="error" message={error} />}

          {/* Cards statistik */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Card Jumlah Kasir */}
            <Card hover className="bg-gradient-to-br from-white to-primary-50 border-primary-100">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                  <FontAwesomeIcon icon={faUserTie} className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Jumlah Kasir</p>
                  <p className="text-2xl font-bold text-gray-800">{data?.jumlah_kasir || 0}</p>
                </div>
              </div>
            </Card>

            {/* Card Pendapatan Harian */}
            <Card hover className="bg-gradient-to-br from-white to-primary-50 border-primary-100">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                  <FontAwesomeIcon icon={faMoneyBillWave} className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pendapatan Harian</p>
                  <p className="text-2xl font-bold text-gray-800">{formatRupiah(data?.pendapatan_harian)}</p>
                </div>
              </div>
            </Card>

            {/* Card Customer Harian */}
            <Card hover className="bg-gradient-to-br from-white to-primary-50 border-primary-100">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                  <FontAwesomeIcon icon={faUsers} className="text-xl" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Customer Harian</p>
                  <p className="text-2xl font-bold text-gray-800">{data?.customer_harian || 0}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Line Chart */}
          <Card hover className="bg-white">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faChartLine} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Pendapatan Bulanan</h3>
            </div>
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}