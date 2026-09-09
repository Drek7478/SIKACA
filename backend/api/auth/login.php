<?php
// backend/api/auth/login.php

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

// Aktifkan error reporting untuk debugging (hapus jika production)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'username' => 'required',
    'password' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$username = trim($input['username']);
$password = $input['password'];

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        // Username tidak ditemukan → tetap jawab generik
        Response::error('Username atau password salah.', 401);
    }

    // 1. Cek status blokir permanen
    if ((int)$user['is_blocked'] === 1) {
        Response::error('Akun diblokir. Silakan hubungi Admin.', 401, [
            'is_blocked' => true,
        ]);
    }

    // 2. Reset harian counter jika perlu (hanya jika tidak diblokir)
    $timezone = new DateTimeZone('Asia/Jakarta');
    $now = new DateTime('now', $timezone);
    $todayStr = $now->format('Y-m-d');

    $lastFailedDate = null;
    if ($user['last_failed_attempt_at']) {
        $last = new DateTime($user['last_failed_attempt_at'], $timezone);
        $lastFailedDate = $last->format('Y-m-d');
    }

    if ((int)$user['failed_attempts'] > 0 && $lastFailedDate !== $todayStr) {
        // Reset counter karena sudah beda hari (jam 00:00 WIB sudah lewat)
        $stmt = $pdo->prepare("UPDATE users SET failed_attempts = 0 WHERE id = ?");
        $stmt->execute([$user['id']]);
        $user['failed_attempts'] = 0;
    }

    // 3. Verifikasi password
    if (!password_verify($password, $user['password'])) {
        // Password salah → tambah counter
        $newFailedAttempts = (int)$user['failed_attempts'] + 1;

        // Update counter dan timestamp
        $stmt = $pdo->prepare(
            "UPDATE users SET failed_attempts = ?, last_failed_attempt_at = NOW() WHERE id = ?"
        );
        $stmt->execute([$newFailedAttempts, $user['id']]);

        // Cek batas
        if ($newFailedAttempts >= 3) {
            // Blokir permanen
            $stmt = $pdo->prepare("UPDATE users SET is_blocked = 1 WHERE id = ?");
            $stmt->execute([$user['id']]);

            Response::error('Akun diblokir karena 3 kali kesalahan. Silakan hubungi Admin.', 401, [
                'is_blocked' => true,
                'failed_attempts' => 3,
            ]);
        } elseif ($newFailedAttempts === 2) {
            // Peringatan: satu kesalahan lagi diblokir
            Response::error('Password salah 2 kali. Satu kali lagi akun akan diblokir.', 401, [
                'warning' => true,
                'failed_attempts' => 2,
            ]);
        } else {
            // Percobaan salah pertama
            Response::error('Username atau password salah.', 401, [
                'failed_attempts' => 1,
            ]);
        }
    }

    // 4. Password benar → reset counter percobaan gagal
    $stmt = $pdo->prepare(
        "UPDATE users SET failed_attempts = 0, last_failed_attempt_at = NULL WHERE id = ?"
    );
    $stmt->execute([$user['id']]);

    // ====== LOGIKA 2FA WAJIB ======
    // Buat pending token unik untuk tahap 2FA
    $pendingToken = bin2hex(random_bytes(16));
    $_SESSION['pending_2fa'] = [
        'user_id' => $user['id'],
        'token'   => $pendingToken,
        'expires' => time() + 600 // 10 menit
    ];

    if ((int)$user['is_2fa_enabled'] === 1) {
        // Kasus B: user sudah setup, minta verifikasi TOTP
        Response::success('Verifikasi 2FA diperlukan.', [
            'need_2fa' => true,
            'pending_token' => $pendingToken
        ]);
    } else {
        // Kasus A: user belum setup, generate secret + QR code
        $secret = TOTP::generate()->getSecret();

        $stmt = $pdo->prepare("UPDATE users SET two_factor_secret = ?, is_2fa_enabled = 0 WHERE id = ?");
        $stmt->execute([$secret, $user['id']]);

        $totp = TOTP::create($secret, 30, 'sha1', 6);
        $totp->setLabel($user['username']);
        $totp->setIssuer('SIKACA');
        $otpauthUri = $totp->getProvisioningUri();

        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($otpauthUri)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(300)
            ->build();

        $qrCodeDataUri = $result->getDataUri();

        Response::success('Setup 2FA diperlukan.', [
            'need_2fa_setup' => true,
            'pending_token' => $pendingToken,
            'qr_code' => $qrCodeDataUri,
            'secret' => $secret
        ]);
    }
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}