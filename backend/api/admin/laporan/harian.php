<?php
// backend/api/admin/laporan/harian.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method tidak diizinkan.', 405);
}

// Tanggal default hari ini
$tanggal = isset($_GET['tanggal']) ? $_GET['tanggal'] : date('Y-m-d');
// Validasi format tanggal sederhana
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $tanggal)) {
    Response::error('Format tanggal tidak valid. Gunakan YYYY-MM-DD.', 400);
}

try {
    // ========== RINGKASAN HARIAN (diperbaiki - tanpa duplikasi) ==========
    // Menggunakan subquery terpisah untuk setiap metrik agar tidak terjadi duplikasi
    $stmt = $pdo->prepare(
        "SELECT
            (SELECT COUNT(*) FROM pesanan WHERE DATE(tanggal) = ?) AS jumlah_transaksi,
            (SELECT COALESCE(SUM(total), 0) FROM pesanan WHERE DATE(tanggal) = ?) AS total_penjualan,
            (SELECT COALESCE(ROUND(AVG(total), 2), 0) FROM pesanan WHERE DATE(tanggal) = ?) AS rata_rata_per_transaksi,
            (SELECT COALESCE(SUM(dp.jumlah), 0)
             FROM detail_pesanan dp
             JOIN pesanan p ON dp.pesanan_id = p.id_pesanan
             WHERE DATE(p.tanggal) = ?) AS total_produk_terjual"
    );
    $stmt->execute([$tanggal, $tanggal, $tanggal, $tanggal]);
    $ringkasan = $stmt->fetch();

    // Jika tidak ada transaksi, berikan nilai default
    if (!$ringkasan || $ringkasan['jumlah_transaksi'] == 0) {
        $ringkasan = [
            'tanggal' => $tanggal,
            'jumlah_transaksi' => 0,
            'total_produk_terjual' => 0,
            'rata_rata_per_transaksi' => 0,
            'total_penjualan' => 0
        ];
    }

    // ========== 10 MENU TERLARIS (tetap seperti sebelumnya) ==========
    $stmt = $pdo->prepare(
        "SELECT m.nama, SUM(dp.jumlah) AS total_terjual, SUM(dp.subtotal) AS total_pendapatan
         FROM detail_pesanan dp
         JOIN menu m ON dp.menu_id = m.id
         JOIN pesanan p ON dp.pesanan_id = p.id_pesanan
         WHERE DATE(p.tanggal) = ?
         GROUP BY m.id
         ORDER BY total_terjual DESC
         LIMIT 10"
    );
    $stmt->execute([$tanggal]);
    $terlaris = $stmt->fetchAll();

    // ========== 10 MENU KURANG DIMINATI (diperbaiki - include 0 terjual) ==========
    $stmt = $pdo->prepare(
        "SELECT m.nama, COALESCE(SUM(dp.jumlah), 0) AS total_terjual
         FROM menu m
         LEFT JOIN detail_pesanan dp ON dp.menu_id = m.id
         LEFT JOIN pesanan p ON dp.pesanan_id = p.id_pesanan AND DATE(p.tanggal) = ?
         WHERE m.status = 'tersedia'
         GROUP BY m.id, m.nama
         ORDER BY total_terjual ASC
         LIMIT 10"
    );
    $stmt->execute([$tanggal]);
    $kurangDiminati = $stmt->fetchAll();

    Response::success('Laporan harian berhasil diambil.', [
        'ringkasan'         => $ringkasan,
        'menu_terlaris'     => $terlaris,
        'menu_kurang'       => $kurangDiminati
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}