<?php
// backend/api/admin/menu/delete.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    Response::error('ID menu tidak ditemukan.', 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM menu WHERE id = ?");
    $stmt->execute([$id]);
    $menu = $stmt->fetch();
    if (!$menu) {
        Response::error('Menu tidak ditemukan.', 404);
    }

    // Hapus gambar jika ada
    if ($menu['gambar']) {
        Helper::deleteGambar($menu['gambar']);
    }

    // Hapus menu (foreign key detail_pesanan akan mencegah jika sudah ada transaksi terkait, atau bisa set null)
    $stmt = $pdo->prepare("DELETE FROM menu WHERE id = ?");
    $stmt->execute([$id]);

    Response::success('Menu berhasil dihapus.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}