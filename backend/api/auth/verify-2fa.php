<?php
// backend/api/auth/verify-2fa.php

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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'pending_token' => 'required',
    'otp_code'      => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$pendingToken = trim($input['pending_token']);
$otpCode = trim($input['otp_code']);

// Validasi pending token
if (!isset($_SESSION['pending_2fa']) || $_SESSION['pending_2fa']['token'] !== $pendingToken) {
    Response::error('Token tidak valid atau sudah kedaluwarsa.', 401);
}

if (time() > $_SESSION['pending_2fa']['expires']) {
    unset($_SESSION['pending_2fa']);
    Response::error('Token sudah kedaluwarsa. Silakan login ulang.', 401);
}

$userId = $_SESSION['pending_2fa']['user_id'];

try {
    // Ambil user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('User tidak ditemukan.', 404);
    }

    // Pastikan user sudah mengaktifkan 2FA
    if (empty($user['two_factor_secret']) || (int)$user['is_2fa_enabled'] !== 1) {
        Response::error('2FA belum diaktifkan untuk user ini.', 400);
    }

    // Verifikasi OTP
    $totp = TOTP::create($user['two_factor_secret'], 30, 'sha1', 6);
    $isValid = $totp->verify($otpCode);

    if (!$isValid) {
        Response::error('Kode OTP tidak valid.', 401);
    }

    // Hapus pending token
    unset($_SESSION['pending_2fa']);

    // Login penuh
    Auth::login($user);

    // Kirim data user (tanpa password)
    unset($user['password']);
    Response::success('Login berhasil.', $user);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}