<?php
// backend/api/admin/kasir/delete.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    Response::error('ID kasir tidak ditemukan.', 400);
}

try {
    // Cek apakah kasir ada
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'kasir'");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        Response::error('Kasir tidak ditemukan.', 404);
    }

    // Hapus kasir (pastikan tidak ada pesanan terkait? untuk keamanan bisa dicek)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'kasir'");
    $stmt->execute([$id]);

    Response::success('Kasir berhasil dihapus.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}