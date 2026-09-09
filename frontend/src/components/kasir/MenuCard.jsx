// frontend/src/components/kasir/MenuCard.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUtensils, faGlassWater, faMugHot, faCheckCircle, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { formatRupiah } from '../../utils/formatRupiah';

/**
 * Kartu menu modern untuk panel kiri kasir.
 * Menampilkan gambar dengan overlay gradient, nama, kategori, harga.
 */
export default function MenuCard({ menu, onAdd }) {
  // Pilih icon kategori
  const getCategoryIcon = (kategori) => {
    switch (kategori) {
      case 'Makanan': return faUtensils;
      case 'Minuman': return faGlassWater;
      case 'Coffee': return faMugHot;
      default: return faUtensils;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transform hover:-translate-y-1 transition-all duration-300 group">
      {/* Gambar dengan overlay */}
      <div className="relative h-36 overflow-hidden">
        {menu.gambar_url ? (
          <img
            src={menu.gambar_url}
            alt={menu.nama}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            <FontAwesomeIcon icon={getCategoryIcon(menu.kategori)} className="text-4xl" />
          </div>
        )}
        {/* Overlay gradient hijau di bagian bawah gambar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent h-12 flex items-end px-3 pb-2">
          <span className="text-white text-xs font-medium flex items-center gap-1">
            <FontAwesomeIcon icon={getCategoryIcon(menu.kategori)} className="text-xs" />
            {menu.kategori}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-800 truncate">{menu.nama}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-bold text-primary-700">{formatRupiah(menu.harga)}</span>
          <button
            onClick={() => onAdd(menu)}
            className="w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
            title="Tambah ke pesanan"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        {/* Status */}
        <div className="mt-2">
          {menu.status === 'tersedia' ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600">
              <FontAwesomeIcon icon={faCheckCircle} /> Tersedia
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-red-500">
              <FontAwesomeIcon icon={faCircleXmark} /> Tidak Tersedia
            </span>
          )}
        </div>
      </div>
    </div>
  );
}