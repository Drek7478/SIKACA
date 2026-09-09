// frontend/src/pages/admin/KelolaMenu.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import NavbarAdmin from '../../components/admin/NavbarAdmin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Dropdown from '../../components/common/Dropdown';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { getMenu, createMenu, updateMenu, deleteMenu } from '../../api/admin';
import { KATEGORI_MENU, STATUS_MENU } from '../../utils/constants';
import { formatRupiah } from '../../utils/formatRupiah';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFilter } from '@fortawesome/free-solid-svg-icons';

export default function KelolaMenu() {
  const [menuList, setMenuList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [filterKategori, setFilterKategori] = useState('');
  const [formData, setFormData] = useState({
    kategori_id: '',
    nama: '',
    harga: '',
    status: 'tersedia',
    gambar: null,
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Mapping nama kategori ke ID untuk form
  const kategoriMap = { 'Makanan': 1, 'Minuman': 2, 'Coffee': 3 };
  const kategoriOptions = KATEGORI_MENU.map((nama) => ({ value: kategoriMap[nama], label: nama }));
  const statusOptions = STATUS_MENU;

  // Opsi filter kategori
  const filterOptions = [
    { value: '', label: 'Semua Kategori' },
    ...KATEGORI_MENU.map((nama) => ({ value: nama, label: nama })),
  ];

  const fetchMenu = useCallback(async () => {
    try {
      const res = await getMenu();
      if (res.status === 'success') {
        setMenuList(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Gagal memuat data menu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const openTambah = () => {
    setEditingMenu(null);
    setFormData({ kategori_id: '', nama: '', harga: '', status: 'tersedia', gambar: null });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (menu) => {
    setEditingMenu(menu);
    const kategoriId = kategoriMap[menu.kategori] || '';
    setFormData({
      kategori_id: kategoriId,
      nama: menu.nama,
      harga: menu.harga,
      status: menu.status,
      gambar: null, // gambar baru opsional
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    // Buat FormData karena ada file upload
    const fd = new FormData();
    fd.append('kategori_id', formData.kategori_id);
    fd.append('nama', formData.nama);
    fd.append('harga', formData.harga);
    fd.append('status', formData.status);
    if (formData.gambar) {
      fd.append('gambar', formData.gambar);
    }

    try {
      if (editingMenu) {
        const res = await updateMenu(editingMenu.id, fd);
        if (res.status === 'success') {
          setModalOpen(false);
          fetchMenu();
        } else {
          setFormError(res.message || 'Gagal memperbarui menu.');
        }
      } else {
        const res = await createMenu(fd);
        if (res.status === 'success') {
          setModalOpen(false);
          fetchMenu();
        } else {
          setFormError(res.message || 'Gagal menambah menu.');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;
    try {
      const res = await deleteMenu(id);
      if (res.status === 'success') {
        fetchMenu();
      } else {
        setError(res.message || 'Gagal menghapus menu.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat menghapus.');
    }
  };

  // Filter data berdasarkan kategori yang dipilih
  const filteredMenu = filterKategori
    ? menuList.filter((menu) => menu.kategori === filterKategori)
    : menuList;

  const columns = [
    {
      key: 'gambar',
      label: 'Gambar',
      render: (row) =>
        row.gambar_url ? (
          <img src={row.gambar_url} alt={row.nama} className="w-10 h-10 object-cover rounded" />
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    { key: 'nama', label: 'Nama' },
    { key: 'kategori', label: 'Kategori' },
    { key: 'harga', label: 'Harga', render: (row) => formatRupiah(row.harga) },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.status === 'tersedia' ? (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Tersedia</span>
        ) : (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Tidak Tersedia</span>
        ),
    },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <SidebarAdmin />
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarAdmin />
      <div className="flex-1 flex flex-col">
        <NavbarAdmin title="Kelola Menu" />
        <main className="flex-1 p-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Baris filter dan tombol tambah */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="w-full sm:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FontAwesomeIcon icon={faFilter} className="mr-1 text-primary-600" />
                Filter Kategori
              </label>
              <Dropdown
                options={filterOptions}
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
              />
            </div>
            <Button onClick={openTambah} icon={faPlus} className="sm:self-end">
              Tambah Menu
            </Button>
          </div>

          <Card>
            <Table columns={columns} data={filteredMenu} />
          </Card>
        </main>
      </div>

      {/* Modal Tambah/Edit Menu */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMenu ? 'Edit Menu' : 'Tambah Menu'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="form-menu" loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        <form id="form-menu" onSubmit={handleSubmit}>
          {formError && <Alert type="error" message={formError} />}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Menu"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              required
              className="col-span-2"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <Dropdown
                options={kategoriOptions}
                value={formData.kategori_id}
                onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                placeholder="Pilih Kategori"
                required
              />
            </div>
            <Input
              label="Harga (Rp)"
              type="number"
              min="0"
              value={formData.harga}
              onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Dropdown
                options={statusOptions}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFormData({ ...formData, gambar: e.target.files[0] })}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              {editingMenu && editingMenu.gambar_url && !formData.gambar && (
                <div className="mt-2">
                  <img src={editingMenu.gambar_url} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  <p className="text-xs text-gray-400 mt-1">Gambar saat ini</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}