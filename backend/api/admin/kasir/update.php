<?php
// backend/api/admin/kasir/update.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

// Ambil ID dari query string atau path (contoh: update.php?id=1)
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    Response::error('ID kasir tidak ditemukan.', 400);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    Response::error('Data tidak valid.', 400);
}

try {
    // Cek apakah kasir ada
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND role = 'kasir'");
    $stmt->execute([$id]);
    $kasir = $stmt->fetch();
    if (!$kasir) {
        Response::error('Kasir tidak ditemukan.', 404);
    }

    // Validasi input yang ada
    $errors = [];
    if (isset($input['nama']) && trim($input['nama']) === '') {
        $errors['nama'] = 'Nama wajib diisi.';
    }
    if (isset($input['username']) && trim($input['username']) === '') {
        $errors['username'] = 'Username wajib diisi.';
    }
    if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Email tidak valid.';
    }
    if (!empty($errors)) {
        Response::error('Validasi gagal.', 422, $errors);
    }

    // Cek username unik jika diubah
    if (isset($input['username'])) {
        $username = trim($input['username']);
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->execute([$username, $id]);
        if ($stmt->fetch()) {
            Response::error('Username sudah digunakan.', 409);
        }
    }

    // Cek email unik jika diubah
    if (isset($input['email'])) {
        $email = trim($input['email']);
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $id]);
        if ($stmt->fetch()) {
            Response::error('Email sudah digunakan.', 409);
        }
    }

    // Build query update dinamis
    $fields = [];
    $values = [];
    if (isset($input['nama'])) {
        $fields[] = 'nama = ?';
        $values[] = trim($input['nama']);
    }
    if (isset($input['username'])) {
        $fields[] = 'username = ?';
        $values[] = trim($input['username']);
    }
    if (isset($input['email'])) {
        $fields[] = 'email = ?';
        $values[] = trim($input['email']);
    }
    if (isset($input['password']) && !empty($input['password'])) {
        $fields[] = 'password = ?';
        $values[] = password_hash($input['password'], PASSWORD_DEFAULT);
    }

    if (empty($fields)) {
        Response::error('Tidak ada data yang diubah.', 400);
    }

    $values[] = $id;
    $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ? AND role = 'kasir'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    Response::success('Kasir berhasil diperbarui.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}