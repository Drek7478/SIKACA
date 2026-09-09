<?php
// backend/api/admin/kasir/store.php

// ========== TAMBAHKAN HEADER CORS DI SINI ==========
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Tangani preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ==================================================

// Perbaiki path require (dari api/admin/kasir/ naik 3 tingkat = backend/)
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

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'nama'     => 'required',
    'username' => 'required',
    'email'    => 'required|email',
    'password' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$nama = trim($input['nama']);
$username = trim($input['username']);
$email = trim($input['email']);
$password = $input['password'];

try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        Response::error('Username sudah digunakan.', 409);
    }

    // Cek email unik
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        Response::error('Email sudah digunakan.', 409);
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (nama, username, email, password, role) VALUES (?, ?, ?, ?, 'kasir')");
    $stmt->execute([$nama, $username, $email, $hashedPassword]);

    Response::success('Kasir berhasil ditambahkan.', ['id' => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}