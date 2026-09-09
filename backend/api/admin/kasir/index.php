<?php
// backend/api/admin/kasir/index.php

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

try {
    $stmt = $pdo->query(
        "SELECT id, nama, username, email, role, is_blocked, failed_attempts, created_at 
         FROM users 
         WHERE role = 'kasir' 
         ORDER BY id DESC"
    );
    $kasir = $stmt->fetchAll();
    Response::success('Data kasir berhasil diambil.', $kasir);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}