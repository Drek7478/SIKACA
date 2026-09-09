<?php
// backend/api/admin/dashboard.php

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';

session_start();

// Hanya admin
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method tidak diizinkan.', 405);
}

try {
    // 1. Jumlah kasir
    $stmt = $pdo->query("SELECT COUNT(*) FROM users WHERE role = 'kasir'");
    $jumlahKasir = (int) $stmt->fetchColumn();

    // 2. Pendapatan harian (hari ini)
    $stmt = $pdo->query("SELECT COALESCE(SUM(total), 0) FROM pesanan WHERE DATE(tanggal) = CURDATE()");
    $pendapatanHarian = (float) $stmt->fetchColumn();

    // 3. Jumlah customer harian (jumlah transaksi hari ini)
    $stmt = $pdo->query("SELECT COUNT(*) FROM pesanan WHERE DATE(tanggal) = CURDATE()");
    $customerHarian = (int) $stmt->fetchColumn();

    // 4. Pendapatan bulanan (12 bulan terakhir) untuk line chart
    $stmt = $pdo->query(
        "SELECT DATE_FORMAT(tanggal, '%Y-%m') AS periode, SUM(total) AS pendapatan
         FROM pesanan
         WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
         ORDER BY periode ASC"
    );
    $pendapatanBulanan = $stmt->fetchAll();

    Response::success('Data dashboard berhasil diambil.', [
        'jumlah_kasir'         => $jumlahKasir,
        'pendapatan_harian'    => $pendapatanHarian,
        'customer_harian'      => $customerHarian,
        'pendapatan_bulanan'   => $pendapatanBulanan
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}