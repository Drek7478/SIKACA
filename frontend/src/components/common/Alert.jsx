// frontend/src/components/common/Alert.jsx
import React from 'react';

/**
 * Komponen Alert.
 * @param {string} type - 'success', 'error', 'warning', 'info'
 * @param {string} message - pesan alert
 * @param {function} onClose - fungsi untuk menutup (opsional)
 */
export default function Alert({ type = 'info', message, onClose }) {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-primary-50 border-primary-200 text-primary-800',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg border ${typeClasses[type]} mb-4`}>
      <div className="flex items-center">
        <span className="mr-2">{iconMap[type]}</span>
        <p className="text-sm">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-600">
          ✕
        </button>
      )}
    </div>
  );
}