// frontend/src/utils/dateFormat.js
export function formatTanggal(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatTanggalWaktu(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}