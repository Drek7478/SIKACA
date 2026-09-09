<?php
// backend/api/admin/laporan/bulanan.php

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

$tahun = isset($_GET['tahun']) ? (int)$_GET['tahun'] : date('Y');
$bulan = isset($_GET['bulan']) ? (int)$_GET['bulan'] : date('n');

if ($tahun < 2000 || $tahun > 2100 || $bulan < 1 || $bulan > 12) {
    Response::error('Parameter tidak valid.', 400);
}

$startDate = sprintf('%04d-%02d-01', $tahun, $bulan);
$endDate = date('Y-m-t', strtotime($startDate)); // akhir bulan

try {
    // ========== RINGKASAN BULANAN (diperbaiki - tanpa duplikasi) ==========
    $stmt = $pdo->prepare(
        "SELECT
            (SELECT COUNT(*) FROM pesanan WHERE DATE(tanggal) BETWEEN ? AND ?) AS jumlah_transaksi,
            (SELECT COALESCE(SUM(total), 0) FROM pesanan WHERE DATE(tanggal) BETWEEN ? AND ?) AS total_penjualan,
            (SELECT COALESCE(ROUND(AVG(total), 2), 0) FROM pesanan WHERE DATE(tanggal) BETWEEN ? AND ?) AS rata_rata_per_transaksi,
            (SELECT COALESCE(SUM(dp.jumlah), 0)
             FROM detail_pesanan dp
             JOIN pesanan p ON dp.pesanan_id = p.id_pesanan
             WHERE DATE(p.tanggal) BETWEEN ? AND ?) AS total_produk_terjual"
    );
    $stmt->execute([$startDate, $endDate, $startDate, $endDate, $startDate, $endDate, $startDate, $endDate]);
    $ringkasan = $stmt->fetch();

    if (!$ringkasan || $ringkasan['jumlah_transaksi'] == 0) {
        $ringkasan = [
            'jumlah_transaksi' => 0,
            'total_produk_terjual' => 0,
            'rata_rata_per_transaksi' => 0,
            'total_penjualan' => 0
        ];
    }

    // ========== 10 MENU TERLARIS ==========
    $stmt = $pdo->prepare(
        "SELECT m.nama, SUM(dp.jumlah) AS total_terjual, SUM(dp.subtotal) AS total_pendapatan
         FROM detail_pesanan dp
         JOIN menu m ON dp.menu_id = m.id
         JOIN pesanan p ON dp.pesanan_id = p.id_pesanan
         WHERE DATE(p.tanggal) BETWEEN ? AND ?
         GROUP BY m.id
         ORDER BY total_terjual DESC
         LIMIT 10"
    );
    $stmt->execute([$startDate, $endDate]);
    $terlaris = $stmt->fetchAll();

    // ========== 10 MENU KURANG DIMINATI (diperbaiki - include 0 terjual) ==========
    $stmt = $pdo->prepare(
        "SELECT m.nama, COALESCE(SUM(dp.jumlah), 0) AS total_terjual
         FROM menu m
         LEFT JOIN detail_pesanan dp ON dp.menu_id = m.id
         LEFT JOIN pesanan p ON dp.pesanan_id = p.id_pesanan AND DATE(p.tanggal) BETWEEN ? AND ?
         WHERE m.status = 'tersedia'
         GROUP BY m.id, m.nama
         ORDER BY total_terjual ASC
         LIMIT 10"
    );
    $stmt->execute([$startDate, $endDate]);
    $kurangDiminati = $stmt->fetchAll();

    Response::success('Laporan bulanan berhasil diambil.', [
        'periode'           => date('F Y', strtotime($startDate)),
        'ringkasan'         => $ringkasan,
        'menu_terlaris'     => $terlaris,
        'menu_kurang'       => $kurangDiminati
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}