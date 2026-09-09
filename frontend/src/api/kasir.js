// frontend/src/api/kasir.js
import axios from './axios';

export const getMenuKasir = async (search = '', kategori = '') => {
  const response = await axios.get('/kasir/menu/index.php', {
    params: { search, kategori },
  });
  return response.data;
};

export const createPesanan = async (data) => {
  const response = await axios.post('/kasir/pesanan/store.php', data);
  return response.data;
};

export const getRiwayat = async () => {
  const response = await axios.get('/kasir/riwayat/index.php');
  return response.data;
};

export const getDetailPesanan = async (idPesanan) => {
  const response = await axios.get('/kasir/riwayat/detail.php', {
    params: { id: idPesanan },
  });
  return response.data;
};