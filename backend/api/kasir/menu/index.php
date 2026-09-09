<?php
// backend/api/kasir/menu/index.php

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

$search = isset($_GET['search']) ? trim($_GET['search']) : '';
$kategori = isset($_GET['kategori']) ? trim($_GET['kategori']) : '';

try {
    $sql = "SELECT m.id, m.nama, m.harga, m.gambar, m.status, k.nama AS kategori
            FROM menu m
            JOIN kategori_menu k ON m.kategori_id = k.id
            WHERE m.status = 'tersedia'";
    $params = [];

    if ($search !== '') {
        $sql .= " AND m.nama LIKE ?";
        $params[] = "%$search%";
    }
    if ($kategori !== '') {
        $sql .= " AND k.nama = ?";
        $params[] = $kategori;
    }

    $sql .= " ORDER BY m.nama ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $menu = $stmt->fetchAll();

    // Tambahkan URL gambar
    foreach ($menu as &$item) {
        $item['gambar_url'] = $item['gambar'] ? BASE_URL . '/uploads/menu/' . $item['gambar'] : null;
    }

    Response::success('Data menu berhasil diambil.', $menu);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}