<?php
// backend/api/admin/laporan/mingguan.php

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

// Parameter: tahun, bulan, minggu_ke (dalam bulan)
$tahun = isset($_GET['tahun']) ? (int)$_GET['tahun'] : date('Y');
$bulan = isset($_GET['bulan']) ? (int)$_GET['bulan'] : date('n');
$mingguKe = isset($_GET['minggu_ke']) ? (int)$_GET['minggu_ke'] : 1;

// Validasi sederhana
if ($tahun < 2000 || $tahun > 2100 || $bulan < 1 || $bulan > 12 || $mingguKe < 1 || $mingguKe > 5) {
    Response::error('Parameter tidak valid.', 400);
}

// Hitung rentang tanggal untuk minggu tersebut dalam bulan tsb
$startDay = ($mingguKe - 1) * 7 + 1;
$endDay = $mingguKe * 7;
$lastDayOfMonth = (int) date('t', strtotime("$tahun-$bulan-01"));
$endDay = min($endDay, $lastDayOfMonth);

$startDate = sprintf('%04d-%02d-%02d', $tahun, $bulan, $startDay);
$endDate = sprintf('%04d-%02d-%02d', $tahun, $bulan, $endDay);

try {
    // ========== RINGKASAN MINGGUAN (diperbaiki - tanpa duplikasi) ==========
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

    Response::success('Laporan mingguan berhasil diambil.', [
        'periode'           => "Minggu $mingguKe " . date('F Y', strtotime("$tahun-$bulan-01")),
        'ringkasan'         => $ringkasan,
        'menu_terlaris'     => $terlaris,
        'menu_kurang'       => $kurangDiminati
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}