<?php
// backend/api/admin/menu/store.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

// Data dari form-data (karena ada upload file)
$input = $_POST;

$errors = Helper::validate($input, [
    'kategori_id' => 'required|numeric',
    'nama'        => 'required',
    'harga'       => 'required|numeric',
    'status'      => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

// Validasi kategori
$stmt = $pdo->prepare("SELECT id FROM kategori_menu WHERE id = ?");
$stmt->execute([$input['kategori_id']]);
if (!$stmt->fetch()) {
    Response::error('Kategori tidak valid.', 422);
}

// Upload gambar jika ada
$gambar = null;
if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] !== UPLOAD_ERR_NO_FILE) {
    try {
        $gambar = Helper::uploadGambar($_FILES['gambar']);
    } catch (Exception $e) {
        Response::error($e->getMessage(), 400);
    }
}

try {
    $stmt = $pdo->prepare("INSERT INTO menu (kategori_id, nama, harga, gambar, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        $input['kategori_id'],
        trim($input['nama']),
        (float)$input['harga'],
        $gambar,
        $input['status'] === 'tersedia' ? 'tersedia' : 'tidak_tersedia'
    ]);

    Response::success('Menu berhasil ditambahkan.', ['id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    // Jika gagal insert, hapus gambar yang sudah diupload
    if ($gambar) Helper::deleteGambar($gambar);
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}