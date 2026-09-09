<?php
// backend/api/admin/menu/index.php

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
        "SELECT m.id, m.nama, m.harga, m.gambar, m.status, k.nama AS kategori
         FROM menu m
         JOIN kategori_menu k ON m.kategori_id = k.id
         ORDER BY m.id DESC"
    );
    $menu = $stmt->fetchAll();

    // Tambahkan URL lengkap gambar jika ada
    foreach ($menu as &$item) {
        $item['gambar_url'] = $item['gambar'] ? BASE_URL . '/uploads/menu/' . $item['gambar'] : null;
    }

    Response::success('Data menu berhasil diambil.', $menu);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}