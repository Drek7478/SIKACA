// frontend/src/components/common/EmptyState.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';

export default function EmptyState({ message = 'Tidak ada data', icon = faBoxOpen }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
      <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        <FontAwesomeIcon icon={icon} className="text-3xl text-primary-500" />
      </div>
      <p className="text-gray-500 font-medium">{message}</p>
    </div>
  );
}