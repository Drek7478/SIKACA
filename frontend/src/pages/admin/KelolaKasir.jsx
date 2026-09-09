// frontend/src/pages/admin/KelolaKasir.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SidebarAdmin from '../../components/admin/SidebarAdmin';
import NavbarAdmin from '../../components/admin/NavbarAdmin';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import {
  getKasir,
  createKasir,
  updateKasir,
  deleteKasir,
  unblockKasir,
} from '../../api/admin';

export default function KelolaKasir() {
  const [kasirList, setKasirList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKasir, setEditingKasir] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    username: '',
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchKasir = useCallback(async () => {
    try {
      const res = await getKasir();
      if (res.status === 'success') {
        setKasirList(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Gagal memuat data kasir.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKasir();
  }, [fetchKasir]);

  const openTambah = () => {
    setEditingKasir(null);
    setFormData({ nama: '', username: '', email: '', password: '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (kasir) => {
    setEditingKasir(kasir);
    setFormData({
      nama: kasir.nama,
      username: kasir.username,
      email: kasir.email || '',
      password: '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingKasir) {
        const res = await updateKasir(editingKasir.id, formData);
        if (res.status === 'success') {
          setModalOpen(false);
          fetchKasir();
          setSuccessMessage('Data kasir berhasil diperbarui.');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setFormError(res.message || 'Gagal memperbarui kasir.');
        }
      } else {
        const res = await createKasir(formData);
        if (res.status === 'success') {
          setModalOpen(false);
          fetchKasir();
          setSuccessMessage('Kasir baru berhasil ditambahkan.');
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setFormError(res.message || 'Gagal menambah kasir.');
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus kasir ini?')) return;
    try {
      const res = await deleteKasir(id);
      if (res.status === 'success') {
        fetchKasir();
        setSuccessMessage('Kasir berhasil dihapus.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(res.message || 'Gagal menghapus kasir.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghapus.');
    }
  };

  // Fungsi untuk unblock akun
  const handleUnblock = async (id) => {
    if (!confirm('Yakin ingin membuka blokir akun kasir ini?')) return;
    try {
      const res = await unblockKasir(id);
      if (res.status === 'success') {
        fetchKasir();
        setSuccessMessage(res.message || 'Akun kasir berhasil dibuka blokirnya.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(res.message || 'Gagal membuka blokir akun.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuka blokir.');
    }
  };

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.is_blocked === 1 ? (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Diblokir</span>
        ) : (
          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Aktif</span>
        ),
    },
    { key: 'created_at', label: 'Dibuat', render: (row) => new Date(row.created_at).toLocaleDateString('id-ID') },
    {
      key: 'aksi',
      label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.id)}>
            Hapus
          </Button>
          {row.is_blocked === 1 && (
            <Button variant="ghost" size="sm" onClick={() => handleUnblock(row.id)}>
              Unblock Akun
            </Button>
          )}
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
        <NavbarAdmin title="Kelola Kasir" />
        <main className="flex-1 p-6">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}
          {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

          <div className="flex justify-end mb-4">
            <Button onClick={openTambah}>+ Tambah Kasir</Button>
          </div>

          <Card>
            <Table columns={columns} data={kasirList} />
          </Card>
        </main>
      </div>

      {/* Modal Tambah/Edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingKasir ? 'Edit Kasir' : 'Tambah Kasir'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" form="form-kasir" loading={saving}>
              Simpan
            </Button>
          </>
        }
      >
        <form id="form-kasir" onSubmit={handleSubmit}>
          {formError && <Alert type="error" message={formError} />}
          <Input
            label="Nama"
            value={formData.nama}
            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
            required
          />
          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="nama@email.com"
            required
          />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={editingKasir ? 'Kosongkan jika tidak mengubah password' : ''}
            required={!editingKasir}
          />
        </form>
      </Modal>
    </div>
  );
}