// frontend/src/components/common/Table.jsx
import React from 'react';

/**
 * Komponen Table reusable.
 * @param {array} columns - [{ key: 'nama', label: 'Nama', render: (row) => ... }]
 * @param {array} data - array objek data
 * @param {string} className - kelas tambahan
 * @param {boolean} loading - tampilkan loading
 */
export default function Table({ columns = [], data = [], className = '', loading = false }) {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full"></div>
        <p className="mt-2">Memuat data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Tidak ada data.</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-gray-50 transition-colors">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}