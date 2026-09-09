<?php
// backend/api/kasir/riwayat/detail.php

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

$idPesanan = isset($_GET['id']) ? trim($_GET['id']) : null;
if (!$idPesanan) {
    Response::error('ID pesanan tidak ditemukan.', 400);
}

try {
    // Ambil data pesanan utama
    $stmt = $pdo->prepare(
        "SELECT p.*, u.nama AS kasir
         FROM pesanan p
         JOIN users u ON p.kasir_id = u.id
         WHERE p.id_pesanan = ?"
    );
    $stmt->execute([$idPesanan]);
    $pesanan = $stmt->fetch();
    if (!$pesanan) {
        Response::error('Pesanan tidak ditemukan.', 404);
    }

    // Ambil detail item
    $stmt = $pdo->prepare(
        "SELECT dp.*, m.nama AS nama_menu, m.harga, k.nama AS kategori
         FROM detail_pesanan dp
         JOIN menu m ON dp.menu_id = m.id
         JOIN kategori_menu k ON m.kategori_id = k.id
         WHERE dp.pesanan_id = ?
         ORDER BY dp.id"
    );
    $stmt->execute([$idPesanan]);
    $items = $stmt->fetchAll();

    Response::success('Detail pesanan berhasil diambil.', [
        'pesanan' => $pesanan,
        'items'   => $items
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}