<?php
// backend/api/auth/confirm-2fa.php

// ========== HEADER CORS ==========
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// ==================================

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Helper.php';

// Load Composer autoload
require_once BASE_PATH . '/vendor/autoload.php';

use OTPHP\TOTP;

session_start();

// Untuk debugging (hapus pada production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Pastikan user sudah login
if (!Auth::check()) {
    Response::error('Silakan login terlebih dahulu.', 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'otp_code' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$otpCode = trim($input['otp_code']);
$userId = Auth::user()['id'];

try {
    // Ambil data user dari database
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('User tidak ditemukan.', 404);
    }

    // Pastikan secret sudah dibuat (dari halaman setup)
    if (empty($user['two_factor_secret'])) {
        Response::error('Secret 2FA belum dibuat. Silakan generate QR Code terlebih dahulu.', 400);
    }

    // Verifikasi kode TOTP
    $totp = TOTP::create($user['two_factor_secret'], 30, 'sha1', 6);
    $isValid = $totp->verify($otpCode);

    if (!$isValid) {
        Response::error('Kode OTP tidak valid.', 401);
    }

    // Aktifkan 2FA permanen
    $stmt = $pdo->prepare("UPDATE users SET is_2fa_enabled = 1 WHERE id = ?");
    $stmt->execute([$userId]);

    Response::success('2FA berhasil diaktifkan.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}