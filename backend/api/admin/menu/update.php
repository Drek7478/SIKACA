<?php
// backend/api/admin/menu/update.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();
Middleware::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Gunakan POST karena form-data, bisa juga PUT dengan method override
    Response::error('Method tidak diizinkan.', 405);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    Response::error('ID menu tidak ditemukan.', 400);
}

$input = $_POST; // Karena form-data

try {
    // Cek menu ada
    $stmt = $pdo->prepare("SELECT * FROM menu WHERE id = ?");
    $stmt->execute([$id]);
    $menu = $stmt->fetch();
    if (!$menu) {
        Response::error('Menu tidak ditemukan.', 404);
    }

    // Validasi minimal (karena update bisa sebagian)
    $errors = [];
    if (isset($input['nama']) && trim($input['nama']) === '') {
        $errors['nama'] = 'Nama wajib diisi.';
    }
    if (isset($input['harga']) && !is_numeric($input['harga'])) {
        $errors['harga'] = 'Harga harus angka.';
    }
    if (!empty($errors)) {
        Response::error('Validasi gagal.', 422, $errors);
    }

    // Siapkan data update
    $fields = [];
    $values = [];

    if (isset($input['kategori_id'])) {
        // Validasi kategori
        $stmt = $pdo->prepare("SELECT id FROM kategori_menu WHERE id = ?");
        $stmt->execute([$input['kategori_id']]);
        if (!$stmt->fetch()) {
            Response::error('Kategori tidak valid.', 422);
        }
        $fields[] = 'kategori_id = ?';
        $values[] = $input['kategori_id'];
    }
    if (isset($input['nama'])) {
        $fields[] = 'nama = ?';
        $values[] = trim($input['nama']);
    }
    if (isset($input['harga'])) {
        $fields[] = 'harga = ?';
        $values[] = (float)$input['harga'];
    }
    if (isset($input['status'])) {
        $fields[] = 'status = ?';
        $values[] = $input['status'] === 'tersedia' ? 'tersedia' : 'tidak_tersedia';
    }

    // Upload gambar baru jika ada
    if (isset($_FILES['gambar']) && $_FILES['gambar']['error'] !== UPLOAD_ERR_NO_FILE) {
        try {
            $newGambar = Helper::uploadGambar($_FILES['gambar']);
            // Hapus gambar lama jika ada
            if ($menu['gambar']) {
                Helper::deleteGambar($menu['gambar']);
            }
            $fields[] = 'gambar = ?';
            $values[] = $newGambar;
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    if (empty($fields)) {
        Response::error('Tidak ada data yang diubah.', 400);
    }

    $values[] = $id;
    $sql = "UPDATE menu SET " . implode(', ', $fields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    Response::success('Menu berhasil diperbarui.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}