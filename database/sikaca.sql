-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 07, 2026 at 05:49 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.24

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sikaca`
--

-- --------------------------------------------------------

--
-- Table structure for table `detail_pesanan`
--

CREATE TABLE `detail_pesanan` (
  `id` int NOT NULL,
  `pesanan_id` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menu_id` int NOT NULL,
  `jumlah` int NOT NULL,
  `catatan` text COLLATE utf8mb4_unicode_ci,
  `suhu` enum('panas','dingin') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gula` enum('regular','less','non') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ;

--
-- Dumping data for table `detail_pesanan`
--

INSERT INTO `detail_pesanan` (`id`, `pesanan_id`, `menu_id`, `jumlah`, `catatan`, `suhu`, `gula`, `subtotal`, `created_at`) VALUES
(3, 'MA-001', 19, 1, NULL, NULL, NULL, '23000.00', '2026-09-05 10:13:57'),
(4, 'MA-001', 14, 1, NULL, NULL, NULL, '28000.00', '2026-09-05 10:13:57'),
(5, 'MA-001', 15, 1, NULL, NULL, NULL, '25000.00', '2026-09-05 10:13:57'),
(6, 'MA-001', 40, 1, NULL, NULL, 'non', '6000.00', '2026-09-05 10:13:57'),
(7, 'MA-001', 24, 1, NULL, 'dingin', 'regular', '12000.00', '2026-09-05 10:13:57'),
(8, 'MA-001', 32, 1, NULL, 'dingin', 'regular', '18000.00', '2026-09-05 10:13:57'),
(9, 'MA-001', 43, 1, NULL, 'panas', 'non', '15000.00', '2026-09-05 10:13:57');

-- --------------------------------------------------------

--
-- Table structure for table `kategori_menu`
--

CREATE TABLE `kategori_menu` (
  `id` int NOT NULL,
  `nama` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kategori_menu`
--

INSERT INTO `kategori_menu` (`id`, `nama`, `created_at`) VALUES
(1, 'Makanan', '2026-09-05 05:59:45'),
(2, 'Minuman', '2026-09-05 05:59:45'),
(3, 'Coffee', '2026-09-05 05:59:45');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int NOT NULL,
  `kategori_id` int NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `harga` decimal(10,2) NOT NULL,
  `gambar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('tersedia','tidak_tersedia') COLLATE utf8mb4_unicode_ci DEFAULT 'tersedia',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu`
--

INSERT INTO `menu` (`id`, `kategori_id`, `nama`, `harga`, `gambar`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nasi Goreng Spesial', '18000.00', 'menu_1788599994_6a9bdebad195a.jpg', 'tersedia', '2026-09-05 08:01:48', '2026-09-05 09:19:54'),
(2, 1, 'Nasi Goreng Ayam', '16000.00', 'menu_1788600176_6a9bdf70c7fda.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:22:56'),
(3, 1, 'Nasi Goreng Seafood', '22000.00', 'menu_1788600501_6a9be0b5e2988.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:28:21'),
(4, 1, 'Nasi Ayam Geprek', '18000.00', 'menu_1788602019_6a9be6a3bde61.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:53:39'),
(5, 1, 'Nasi Ayam Crispy', '17000.00', 'menu_1788601973_6a9be67550f53.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:52:53'),
(6, 1, 'Nasi Ayam Sambal', '20000.00', 'menu_1788601761_6a9be5a1321be.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:49:21'),
(7, 1, 'Miso Ramen', '17000.00', 'menu_1788601702_6a9be5665ab16.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:48:22'),
(8, 1, 'Yakisoba', '21000.00', 'menu_1788601528_6a9be4b801273.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:45:28'),
(9, 1, 'Ramen Pedas', '16000.00', 'menu_1788601478_6a9be48690168.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:44:38'),
(10, 1, 'Kwetiau Goreng', '18000.00', 'menu_1788601296_6a9be3d0c35a6.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:41:36'),
(11, 1, 'Kwetiau Seafood', '22000.00', 'menu_1788601242_6a9be39a14ee5.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:40:42'),
(12, 1, 'Indomie Goreng Telur', '14000.00', 'menu_1788601170_6a9be35212d10.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:39:30'),
(13, 1, 'Indomie Kuah Telur', '14000.00', 'menu_1788601132_6a9be32c4c0fb.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:38:52'),
(14, 1, 'Chicken Steak', '28000.00', 'menu_1788601099_6a9be30ba645a.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:38:19'),
(15, 1, 'Chicken Katsu', '25000.00', 'menu_1788601042_6a9be2d2a6f39.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:37:22'),
(16, 1, 'Spaghetti Bolognese', '25000.00', 'menu_1788600999_6a9be2a74a264.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:36:39'),
(17, 1, 'Spaghetti Carbonara', '27000.00', 'menu_1788600961_6a9be281417c9.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:36:01'),
(18, 1, 'French Fries', '15000.00', 'menu_1788600923_6a9be25b1f1e6.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:35:23'),
(19, 1, 'Chicken Wings', '23000.00', 'menu_1788600874_6a9be22a3bd86.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:34:34'),
(20, 1, 'Pisang Goreng', '14000.00', 'menu_1788600841_6a9be2097ab6f.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:34:01'),
(24, 2, 'Lemon Tea', '12000.00', 'menu_1788603068_6a9beabcf149b.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:11:08'),
(31, 2, 'Matcha Latte', '18000.00', 'menu_1788603013_6a9bea854fbb3.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:10:13'),
(32, 2, 'Taro Latte', '18000.00', 'menu_1788602987_6a9bea6b10582.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:09:47'),
(33, 2, 'Red Velvet Latte', '19000.00', 'menu_1788602957_6a9bea4d3317a.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:09:17'),
(34, 2, 'Thai Tea', '15000.00', 'menu_1788602908_6a9bea1ce20e6.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:08:28'),
(35, 2, 'Milk Tea', '15000.00', 'menu_1788602883_6a9bea03cc02d.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:08:03'),
(36, 2, 'Lychee Tea', '16000.00', 'menu_1788602854_6a9be9e61e93b.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:07:34'),
(37, 2, 'Lemon Squash', '17000.00', 'menu_1788602822_6a9be9c625c90.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:07:02'),
(38, 2, 'Orange Squash', '17000.00', 'menu_1788602775_6a9be9973c3e8.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:06:15'),
(39, 2, 'Strawberry Milk', '18000.00', 'menu_1788602734_6a9be96e9d808.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:05:34'),
(40, 2, 'Air Mineral', '6000.00', 'menu_1788602694_6a9be94649ec9.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:04:54'),
(41, 3, 'Espresso', '12000.00', 'menu_1788602652_6a9be91ca8494.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:04:12'),
(42, 3, 'Double Espresso', '16000.00', 'menu_1788602557_6a9be8bd60cd3.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:02:37'),
(43, 3, 'Americano', '15000.00', 'menu_1788602503_6a9be887f0c66.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:01:43'),
(45, 3, 'Cappuccino', '18000.00', 'menu_1788602467_6a9be8631452a.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:01:07'),
(47, 3, 'Cafe Latte', '18000.00', 'menu_1788602421_6a9be83519386.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 10:00:21'),
(49, 3, 'Vanilla Latte', '20000.00', 'menu_1788602382_6a9be80e34604.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:59:42'),
(51, 3, 'Caramel Latte', '20000.00', 'menu_1788602343_6a9be7e7d9819.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:59:03'),
(53, 3, 'Hazelnut Latte', '20000.00', 'menu_1788602273_6a9be7a16a4fe.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:57:53'),
(55, 3, 'Mocha Latte', '21000.00', 'menu_1788602236_6a9be77c0d0b2.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:57:16'),
(57, 3, 'Kopi Susu Gula Aren', '18000.00', 'menu_1788602201_6a9be759aa6bd.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:56:41'),
(59, 3, 'Affogato', '22000.00', 'menu_1788602133_6a9be7158288c.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:55:33'),
(60, 3, 'Caramel Macchiato', '23000.00', 'menu_1788602103_6a9be6f75b7d0.jpg', 'tersedia', '2026-09-05 09:20:26', '2026-09-05 09:55:03');

-- --------------------------------------------------------

--
-- Table structure for table `pesanan`
--

CREATE TABLE `pesanan` (
  `id_pesanan` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tanggal` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `nama_pembeli` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipe_order` enum('dine_in','take_away') COLLATE utf8mb4_unicode_ci NOT NULL,
  `metode_bayar` enum('qris','tunai') COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `kasir_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pesanan`
--

INSERT INTO `pesanan` (`id_pesanan`, `tanggal`, `nama_pembeli`, `tipe_order`, `metode_bayar`, `total`, `kasir_id`, `created_at`) VALUES
('MA-001', '2026-09-05 17:13:57', 'Habibi', 'dine_in', 'tunai', '127000.00', 2, '2026-09-05 10:13:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','kasir') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'kasir',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `username`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Administrator', 'admin', '$2y$10$.0JoC2ciFpFSFpJZgyhq5O9I6BR/vAmCzsgD59IeoU8U7EGCUW5Ia', 'admin', '2026-09-05 05:59:46', '2026-09-05 07:18:56'),
(2, 'YUSUF', 'kasir1', '$2y$10$VGeeWqV7DfHZ8Vr2zF6GLeoc8u9vyeXHiiGYHGckG6.zd3pYQ/bSC', 'kasir', '2026-09-05 07:50:32', '2026-09-05 10:18:44');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_penjualan_bulanan`
-- (See below for the actual view)
--
CREATE TABLE `v_penjualan_bulanan` (
`periode` varchar(7)
,`jumlah_transaksi` bigint
,`total_produk_terjual` decimal(32,0)
,`rata_rata_per_transaksi` decimal(11,2)
,`total_penjualan` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_penjualan_harian`
-- (See below for the actual view)
--
CREATE TABLE `v_penjualan_harian` (
`tanggal` date
,`jumlah_transaksi` bigint
,`total_produk_terjual` decimal(32,0)
,`rata_rata_per_transaksi` decimal(11,2)
,`total_penjualan` decimal(32,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_penjualan_bulanan`
--
DROP TABLE IF EXISTS `v_penjualan_bulanan`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_penjualan_bulanan`  AS SELECT date_format(`p`.`tanggal`,'%Y-%m') AS `periode`, count(distinct `p`.`id_pesanan`) AS `jumlah_transaksi`, sum(`dp`.`jumlah`) AS `total_produk_terjual`, round(avg(`p`.`total`),2) AS `rata_rata_per_transaksi`, sum(`p`.`total`) AS `total_penjualan` FROM (`pesanan` `p` join `detail_pesanan` `dp` on((`p`.`id_pesanan` = `dp`.`pesanan_id`))) GROUP BY date_format(`p`.`tanggal`,'%Y-%m')  ;

-- --------------------------------------------------------

--
-- Structure for view `v_penjualan_harian`
--
DROP TABLE IF EXISTS `v_penjualan_harian`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_penjualan_harian`  AS SELECT cast(`p`.`tanggal` as date) AS `tanggal`, count(distinct `p`.`id_pesanan`) AS `jumlah_transaksi`, sum(`dp`.`jumlah`) AS `total_produk_terjual`, round(avg(`p`.`total`),2) AS `rata_rata_per_transaksi`, sum(`p`.`total`) AS `total_penjualan` FROM (`pesanan` `p` join `detail_pesanan` `dp` on((`p`.`id_pesanan` = `dp`.`pesanan_id`))) GROUP BY cast(`p`.`tanggal` as date)  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_detail_pesanan` (`pesanan_id`),
  ADD KEY `idx_detail_menu` (`menu_id`);

--
-- Indexes for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nama` (`nama`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_kategori` (`kategori_id`),
  ADD KEY `idx_menu_status` (`status`);

--
-- Indexes for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD PRIMARY KEY (`id_pesanan`),
  ADD KEY `idx_pesanan_tanggal` (`tanggal`),
  ADD KEY `idx_pesanan_kasir` (`kasir_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `kategori_menu`
--
ALTER TABLE `kategori_menu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detail_pesanan`
--
ALTER TABLE `detail_pesanan`
  ADD CONSTRAINT `detail_pesanan_ibfk_1` FOREIGN KEY (`pesanan_id`) REFERENCES `pesanan` (`id_pesanan`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `detail_pesanan_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_menu` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pesanan`
--
ALTER TABLE `pesanan`
  ADD CONSTRAINT `pesanan_ibfk_1` FOREIGN KEY (`kasir_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
