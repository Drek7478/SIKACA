<?php
// backend/api/auth/setup-2fa.php

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
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;

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

$userId = Auth::user()['id'];

try {
    // Ambil data user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('User tidak ditemukan.', 404);
    }

    // Jika 2FA sudah aktif, tolak pembuatan secret baru (harus nonaktifkan dulu)
    if ((int)$user['is_2fa_enabled'] === 1) {
        Response::error('2FA sudah aktif. Nonaktifkan terlebih dahulu jika ingin mengganti secret.', 400);
    }

    // Generate secret baru
    $secret = TOTP::generate()->getSecret();

    // Simpan secret (belum aktif) ke database
    $stmt = $pdo->prepare("UPDATE users SET two_factor_secret = ?, is_2fa_enabled = 0 WHERE id = ?");
    $stmt->execute([$secret, $userId]);

    // Buat instance TOTP untuk mendapatkan provisioning URI
    $totp = TOTP::create($secret, 30, 'sha1', 6);
    $totp->setLabel($user['username']); // label di aplikasi authenticator
    $totp->setIssuer('SIKACA');
    $otpauthUri = $totp->getProvisioningUri();

    // Generate QR code
    $result = Builder::create()
        ->writer(new PngWriter())
        ->data($otpauthUri)
        ->encoding(new Encoding('UTF-8'))
        ->errorCorrectionLevel(ErrorCorrectionLevel::High)
        ->size(300)
        ->build();

    $qrCodeDataUri = $result->getDataUri();

    Response::success('Secret 2FA berhasil dibuat.', [
        'secret' => $secret,
        'qr_code' => $qrCodeDataUri,
        'otpauth_uri' => $otpauthUri
    ]);
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}