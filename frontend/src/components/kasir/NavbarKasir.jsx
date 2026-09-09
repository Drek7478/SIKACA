// frontend/src/components/kasir/NavbarKasir.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUser, faBars } from '@fortawesome/free-solid-svg-icons';

export default function NavbarKasir({ title = 'Page Utama', onToggleSidebar }) {
  const { user } = useAuth();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-gray-100 shadow-sm h-16 flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden text-gray-600 hover:text-primary-600 transition-colors"
        >
          <FontAwesomeIcon icon={faBars} className="text-xl" />
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative text-gray-500 hover:text-primary-600 transition-colors">
          <FontAwesomeIcon icon={faBell} className="text-xl" />
        </button>

        <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 leading-tight">{user?.nama}</p>
            <p className="text-xs text-primary-600 capitalize">Kasir</p>
          </div>
        </div>
      </div>
    </header>
  );
}