// frontend/src/api/admin.js
import axios from './axios';

// Dashboard
export const getDashboard = async () => {
  const response = await axios.get('/admin/dashboard.php');
  return response.data;
};

// Kelola Kasir
export const getKasir = async () => {
  const response = await axios.get('/admin/kasir/index.php');
  return response.data;
};

export const createKasir = async (data) => {
  const response = await axios.post('/admin/kasir/store.php', data);
  return response.data;
};

export const updateKasir = async (id, data) => {
  const response = await axios.put(`/admin/kasir/update.php?id=${id}`, data);
  return response.data;
};

export const deleteKasir = async (id) => {
  const response = await axios.delete(`/admin/kasir/delete.php?id=${id}`);
  return response.data;
};

// Fungsi baru untuk unblock
export const unblockKasir = async (id) => {
  const response = await axios.post(`/admin/kasir/unblock.php?id=${id}`);
  return response.data;
};

// Kelola Menu
export const getMenu = async () => {
  const response = await axios.get('/admin/menu/index.php');
  return response.data;
};

export const createMenu = async (formData) => {
  const response = await axios.post('/admin/menu/store.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateMenu = async (id, formData) => {
  const response = await axios.post(`/admin/menu/update.php?id=${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await axios.delete(`/admin/menu/delete.php?id=${id}`);
  return response.data;
};

// Laporan
export const getLaporanHarian = async (tanggal) => {
  const response = await axios.get('/admin/laporan/harian.php', {
    params: { tanggal },
  });
  return response.data;
};

export const getLaporanMingguan = async (tahun, bulan, mingguKe) => {
  const response = await axios.get('/admin/laporan/mingguan.php', {
    params: { tahun, bulan, minggu_ke: mingguKe },
  });
  return response.data;
};

export const getLaporanBulanan = async (tahun, bulan) => {
  const response = await axios.get('/admin/laporan/bulanan.php', {
    params: { tahun, bulan },
  });
  return response.data;
};