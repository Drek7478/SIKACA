// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-primary-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <p className="text-xl text-gray-600 mt-2">Halaman tidak ditemukan</p>
        <Link to="/login" className="inline-block mt-4">
          <Button>Kembali ke Login</Button>
        </Link>
      </div>
    </div>
  );
}