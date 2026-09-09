// frontend/src/utils/formatRupiah.js
export function formatRupiah(angka) {
  if (angka === null || angka === undefined) return 'Rp 0';
  return 'Rp ' + Number(angka).toLocaleString('id-ID');
}