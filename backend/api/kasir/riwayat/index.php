<?php
// backend/api/kasir/riwayat/index.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';

session_start();
Middleware::requireKasir();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method tidak diizinkan.', 405);
}

try {
    $stmt = $pdo->query(
        "SELECT p.id_pesanan, p.tanggal, p.nama_pembeli, p.tipe_order, p.metode_bayar, p.total, u.nama AS kasir
         FROM pesanan p
         JOIN users u ON p.kasir_id = u.id
         ORDER BY p.tanggal DESC"
    );
    $riwayat = $stmt->fetchAll();
    Response::success('Riwayat pesanan berhasil diambil.', $riwayat);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}