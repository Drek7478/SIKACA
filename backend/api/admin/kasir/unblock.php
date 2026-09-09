<?php
// backend/api/admin/kasir/unblock.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';

session_start();
Middleware::requireAdmin();

// Gunakan method POST sesuai permintaan
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

// Ambil ID dari query string, sama seperti update.php
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    Response::error('ID kasir tidak ditemukan.', 400);
}

try {
    // Cek apakah kasir ada
    $stmt = $pdo->prepare("SELECT id, nama, is_blocked FROM users WHERE id = ? AND role = 'kasir'");
    $stmt->execute([$id]);
    $kasir = $stmt->fetch();

    if (!$kasir) {
        Response::error('Kasir tidak ditemukan.', 404);
    }

    // Jika tidak sedang diblokir, beri pesan info
    if ((int)$kasir['is_blocked'] === 0) {
        Response::error('Akun kasir tidak dalam status diblokir.', 400);
    }

    // Buka blokir: set is_blocked=0, reset failed_attempts dan last_failed_attempt_at
    $stmt = $pdo->prepare(
        "UPDATE users SET is_blocked = 0, failed_attempts = 0, last_failed_attempt_at = NULL WHERE id = ?"
    );
    $stmt->execute([$id]);

    Response::success('Akun kasir berhasil dibuka blokirnya.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}