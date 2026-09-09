// frontend/src/components/kasir/SidebarKasir.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faHistory, faSignOutAlt, faMugHot } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../hooks/useAuth';

export default function SidebarKasir() {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/kasir', label: 'Menu Kasir', icon: faHome },
    { path: '/kasir/riwayat', label: 'Riwayat Pesanan', icon: faHistory },
  ];

  const handleLogout = async () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      await logout();
      window.location.href = '/login';
    }
  };

  return (
    <aside className="w-56 bg-gradient-to-b from-forest-dark via-forest-light to-primary-100 text-white flex flex-col h-screen sticky top-0 shadow-lg">
      <div className="h-16 flex items-center justify-center border-b border-white/20 bg-white/10 backdrop-blur-sm">
        <span className="text-2xl font-bold text-white flex items-center gap-2">
          <FontAwesomeIcon icon={faMugHot} />
          SIKACA
        </span>
      </div>

      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/kasir'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white/20 text-white border-l-4 border-white shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent'
                  }`
                }
              >
                <FontAwesomeIcon icon={item.icon} className="text-lg w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-red-600 hover:text-white-600 transition-all duration-300"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="text-lg w-5" />
          Logout
        </button>
        <p className="text-center text-xs text-black/50 mt-3">SIKACA © 2026</p>
      </div>
    </aside>
  );
}