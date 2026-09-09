// frontend/src/components/common/Dropdown.jsx
import React from 'react';

/**
 * Komponen Dropdown/Select reusable.
 * @param {array} options - [{ value: '...', label: '...' }]
 * @param {string} value - nilai saat ini
 * @param {function} onChange - handler perubahan
 * @param {string} placeholder - teks placeholder opsional
 * @param {string} className - kelas tambahan
 */
export default function Dropdown({ options = [], value, onChange, placeholder = 'Pilih...', className = '', ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}