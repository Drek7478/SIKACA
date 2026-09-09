// frontend/src/components/admin/ChartBar.jsx
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrasi komponen Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * Komponen Bar Chart.
 * @param {array} labels - array label sumbu X
 * @param {array} data - array nilai sumbu Y
 * @param {string} labelDataset - label dataset
 * @param {string} warna - warna bar (default forest green)
 * @param {string} title - judul chart
 */
export default function ChartBar({ labels = [], data = [], labelDataset = 'Jumlah', warna = '#2d9e2d', title = 'Bar Chart' }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: labelDataset,
        data,
        backgroundColor: warna,
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#4b5563' },
      },
      title: {
        display: true,
        text: title,
        color: '#1f2937',
        font: { size: 14, weight: 'bold' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280' },
      },
    },
  };

  return (
    <div className="h-72 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}