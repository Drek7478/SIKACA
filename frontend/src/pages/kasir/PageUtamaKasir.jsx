// frontend/src/pages/kasir/PageUtamaKasir.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SidebarKasir from '../../components/kasir/SidebarKasir';
import NavbarKasir from '../../components/kasir/NavbarKasir';
import MenuCard from '../../components/kasir/MenuCard';
import CartItem from '../../components/kasir/CartItem';
import PopupPesananBerhasil from '../../components/kasir/PopupPesananBerhasil';
import KalkulatorTunai from '../../components/kasir/KalkulatorTunai';
import PopupKembalian from '../../components/kasir/PopupKembalian';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faCreditCard,
  faMoneyBill,
  faQrcode,
  faUser,
  faChair,
  faBagShopping,
  faReceipt,
  faTrash,
  faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import { getMenuKasir, createPesanan } from '../../api/kasir';
import { KATEGORI_MENU, TIPE_ORDER, METODE_BAYAR } from '../../utils/constants';
import { formatRupiah } from '../../utils/formatRupiah';

// Helper untuk generate cartItemKey unik
const generateCartItemKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function PageUtamaKasir() {
  const [menuList, setMenuList] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [errorMenu, setErrorMenu] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');

  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    nama_pembeli: '',
    tipe_order: 'dine_in',
    metode_bayar: 'qris',
  });

  const [saving, setSaving] = useState(false);
  const [errorBayar, setErrorBayar] = useState('');

  const [popupData, setPopupData] = useState(null);

  // State untuk Kalkulator Tunai
  const [showKalkulatorTunai, setShowKalkulatorTunai] = useState(false);
  const [showPopupKembalian, setShowPopupKembalian] = useState(false);
  const [uangDiterima, setUangDiterima] = useState(0);
  const [kembalian, setKembalian] = useState(0);

  const fetchMenu = useCallback(async () => {
    setLoadingMenu(true);
    setErrorMenu('');
    try {
      const res = await getMenuKasir(searchTerm, kategoriFilter);
      if (res.status === 'success') {
        setMenuList(res.data);
      } else {
        setErrorMenu(res.message || 'Gagal memuat menu.');
      }
    } catch (err) {
      setErrorMenu('Terjadi kesalahan saat memuat menu.');
    } finally {
      setLoadingMenu(false);
    }
  }, [searchTerm, kategoriFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMenu]);

  const addToCart = (menu) => {
    setCart((prevCart) => {
      const isMinuman = ['Minuman', 'Coffee'].includes(menu.kategori);
      const defaultSuhu = isMinuman ? '' : null;
      const defaultGula = isMinuman ? 'regular' : null;

      const existingIndex = prevCart.findIndex((item) => {
        if (isMinuman) {
          return (
            item.id === menu.id &&
            item.suhu === defaultSuhu &&
            item.gula === defaultGula &&
            item.catatan === ''
          );
        } else {
          return (
            item.id === menu.id &&
            item.catatan === '' &&
            item.suhu === null &&
            item.gula === null
          );
        }
      });

      if (existingIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          jumlah: updatedCart[existingIndex].jumlah + 1,
        };
        return updatedCart;
      }

      const newItem = {
        cartItemKey: generateCartItemKey(),
        id: menu.id,
        nama: menu.nama,
        harga: menu.harga,
        kategori: menu.kategori,
        jumlah: 1,
        catatan: '',
        suhu: defaultSuhu,
        gula: defaultGula,
      };

      return [...prevCart, newItem];
    });
  };

  const updateCartItem = (updatedItem) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.cartItemKey === updatedItem.cartItemKey ? updatedItem : item
      )
    );
  };

  const removeCartItem = (cartItemKey) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartItemKey !== cartItemKey));
  };

  const totalHarga = cart.reduce((sum, item) => sum + item.harga * item.jumlah, 0);

  const resetTransaksi = () => {
    setFormData({
      nama_pembeli: '',
      tipe_order: 'dine_in',
      metode_bayar: 'qris',
    });
    setCart([]);
    setErrorBayar('');
    // Reset state kalkulator tunai
    setShowKalkulatorTunai(false);
    setShowPopupKembalian(false);
    setUangDiterima(0);
    setKembalian(0);
  };

  const handleNewOrder = () => {
    resetTransaksi();
    setPopupData(null);
  };

  // Proses simpan pesanan (dipanggil dari handleBayar QRIS atau dari PopupKembalian)
  const prosesPesanan = async () => {
    setSaving(true);
    setErrorBayar('');

    const payload = {
      nama_pembeli: formData.nama_pembeli,
      tipe_order: formData.tipe_order,
      metode_bayar: formData.metode_bayar,
      items: cart.map((item) => ({
        menu_id: item.id,
        jumlah: item.jumlah,
        catatan: item.catatan || null,
        suhu: item.suhu || null,
        gula: item.gula || null,
      })),
    };

    try {
      const res = await createPesanan(payload);
      if (res.status === 'success') {
        // Tutup popup kalkulator/kembalian
        setShowKalkulatorTunai(false);
        setShowPopupKembalian(false);
        setUangDiterima(0);
        setKembalian(0);

        // Tampilkan popup sukses
        setPopupData({
          id_pesanan: res.data.id_pesanan,
          nama_pembeli: formData.nama_pembeli,
          total: res.data.total,
        });
      } else {
        setErrorBayar(res.message || 'Gagal membuat pesanan.');
      }
    } catch (err) {
      setErrorBayar(err.message || 'Terjadi kesalahan saat membuat pesanan.');
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk tombol "Bayar Sekarang"
  const handleBayar = async () => {
    if (!formData.nama_pembeli.trim()) {
      setErrorBayar('Nama pembeli wajib diisi.');
      return;
    }
    if (cart.length === 0) {
      setErrorBayar('Keranjang masih kosong.');
      return;
    }

    setErrorBayar('');

    // Jika metode Tunai, tampilkan kalkulator terlebih dahulu
    if (formData.metode_bayar === 'tunai') {
      setShowKalkulatorTunai(true);
      return;
    }

    // QRIS langsung proses
    await prosesPesanan();
  };

  // Handler dari KalkulatorTunai saat uang cukup
  const handleHitungTunai = (uang) => {
    setUangDiterima(uang);
    setKembalian(uang - totalHarga);
    setShowKalkulatorTunai(false);
    setShowPopupKembalian(true);
  };

  // Handler dari PopupKembalian untuk kembali ke kalkulator
  const handleKembaliKeKalkulator = () => {
    setShowPopupKembalian(false);
    setShowKalkulatorTunai(true);
  };

  // Handler batal dari kalkulator
  const handleBatalKalkulator = () => {
    setShowKalkulatorTunai(false);
    setUangDiterima(0);
    setKembalian(0);
  };

  const kategoriFilterOptions = [
    { value: '', label: 'Semua Kategori' },
    ...KATEGORI_MENU.map((k) => ({ value: k, label: k })),
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <SidebarKasir />
      <div className="flex-1 flex flex-col">
        <NavbarKasir title="Page Utama" />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* PANEL KIRI - DAFTAR MENU */}
            <div className="lg:col-span-3">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Cari menu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
                  />
                </div>
                <div className="relative sm:w-48">
                  <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <select
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm appearance-none"
                  >
                    {kategoriFilterOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingMenu ? (
                <div className="flex justify-center py-12">
                  <Spinner size="large" />
                </div>
              ) : errorMenu ? (
                <Alert type="error" message={errorMenu} />
              ) : menuList.length === 0 ? (
                <EmptyState message="Tidak ada menu tersedia" icon={faShoppingCart} />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {menuList.map((menu) => (
                    <MenuCard key={menu.id} menu={menu} onAdd={addToCart} />
                  ))}
                </div>
              )}
            </div>

            {/* PANEL KANAN - TRANSAKSI */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-5 lg:sticky lg:top-20">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faReceipt} className="text-primary-600" />
                  Transaksi Pesanan
                </h2>

                {errorBayar && <Alert type="error" message={errorBayar} onClose={() => setErrorBayar('')} />}

                {/* Input Nama Pembeli */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pembeli</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Masukkan nama"
                      value={formData.nama_pembeli}
                      onChange={(e) => setFormData({ ...formData, nama_pembeli: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Dropdown Tipe Order */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Order</label>
                  <div className="relative">
                    <select
                      value={formData.tipe_order}
                      onChange={(e) => setFormData({ ...formData, tipe_order: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                    >
                      {TIPE_ORDER.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Daftar Item Pesanan */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                    <span>Item Pesanan</span>
                    {cart.length > 0 && (
                      <button
                        onClick={() => setCart([])}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Kosongkan
                      </button>
                    )}
                  </h3>
                  <div className="max-h-72 overflow-y-auto pr-1 space-y-2">
                    {cart.length === 0 ? (
                      <EmptyState message="Belum ada item" icon={faShoppingCart} />
                    ) : (
                      cart.map((item) => (
                        <CartItem
                          key={item.cartItemKey}
                          item={item}
                          onUpdate={updateCartItem}
                          onRemove={removeCartItem}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Total Harga */}
                <div className="border-t border-dashed border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-2xl font-bold text-primary-700">{formatRupiah(totalHarga)}</span>
                  </div>
                </div>

                {/* Metode Pembayaran */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-2">
                    {METODE_BAYAR.map((metode) => (
                      <button
                        key={metode.value}
                        onClick={() => setFormData({ ...formData, metode_bayar: metode.value })}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-all duration-200 ${
                          formData.metode_bayar === metode.value
                            ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300'
                        }`}
                      >
                        <FontAwesomeIcon icon={metode.value === 'qris' ? faQrcode : faMoneyBill} />
                        {metode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tombol Bayar */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  icon={faCreditCard}
                  loading={saving}
                  onClick={handleBayar}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Popup Kalkulator Tunai */}
      {showKalkulatorTunai && (
        <KalkulatorTunai
          cart={cart}
          totalHarga={totalHarga}
          onHitung={handleHitungTunai}
          onBatal={handleBatalKalkulator}
        />
      )}

      {/* Popup Kembalian */}
      {showPopupKembalian && (
        <PopupKembalian
          kembalian={kembalian}
          totalHarga={totalHarga}
          uangDiterima={uangDiterima}
          onKonfirmasi={prosesPesanan}
          onKembali={handleKembaliKeKalkulator}
        />
      )}

      {/* Popup Pesanan Berhasil */}
      <PopupPesananBerhasil
        data={popupData}
        onNewOrder={handleNewOrder}
        onPrint={(data) => {
          console.log('Cetak struk untuk', data);
          window.print();
        }}
      />
    </div>
  );
}