// frontend/src/components/kasir/CartItem.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faTrash, faNoteSticky, faTemperatureHalf, faDroplet } from '@fortawesome/free-solid-svg-icons';
import { formatRupiah } from '../../utils/formatRupiah';

export default function CartItem({ item, onUpdate, onRemove }) {
  const isMinuman = ['Minuman', 'Coffee'].includes(item.kategori);

  const handleChange = (field, value) => {
    onUpdate({ ...item, [field]: value });
  };

  // Pastikan gula selalu ada nilai default 'regular' jika belum diatur
  const gulaValue = item.gula || 'regular';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">{item.nama}</p>
          <p className="text-xs text-gray-500">{formatRupiah(item.harga)} / item</p>
        </div>
        <button
          onClick={() => onRemove(item.cartItemKey || item.id)}
          className="text-red-400 hover:text-red-600 transition-colors"
          title="Hapus item"
        >
          <FontAwesomeIcon icon={faTrash} className="text-sm" />
        </button>
      </div>

      {/* Kontrol jumlah */}
      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => handleChange('jumlah', Math.max(1, item.jumlah - 1))}
          className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faMinus} className="text-xs" />
        </button>
        <span className="text-sm font-bold w-8 text-center">{item.jumlah}</span>
        <button
          onClick={() => handleChange('jumlah', item.jumlah + 1)}
          className="w-7 h-7 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="text-xs" />
        </button>
        <span className="ml-auto text-sm font-bold text-primary-700">
          {formatRupiah(item.harga * item.jumlah)}
        </span>
      </div>

      {/* Opsi suhu & gula untuk minuman/coffee */}
      {isMinuman && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Dropdown Suhu */}
          <div className="relative">
            <select
              value={item.suhu || ''}
              onChange={(e) => handleChange('suhu', e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Pilih Suhu</option>
              <option value="panas">Panas</option>
              <option value="dingin">Dingin</option>
            </select>
          </div>

          {/* Dropdown Gula - default Regular Sugar */}
          <div className="relative">
            <select
              value={gulaValue}
              onChange={(e) => handleChange('gula', e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="regular">Regular Sugar</option>
              <option value="less">Less Sugar</option>
              <option value="non">Non Sugar</option>
            </select>
          </div>
        </div>
      )}

      {/* Catatan */}
      <div className="mt-3 relative">
        <FontAwesomeIcon icon={faNoteSticky} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
        <input
          type="text"
          value={item.catatan || ''}
          onChange={(e) => handleChange('catatan', e.target.value)}
          placeholder="Catatan (opsional)"
          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
    </div>
  );
}