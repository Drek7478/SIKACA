<?php
// backend/api/auth/forgot-password.php

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
require_once BASE_PATH . '/includes/Helper.php';

// Pastikan vendor autoload ada
$autoloadPath = BASE_PATH . '/vendor/autoload.php';
if (!file_exists($autoloadPath)) {
    Response::error('Dependency Composer belum terinstall. Jalankan composer install.', 500);
}
require_once $autoloadPath;
require_once BASE_PATH . '/includes/Mailer.php';

session_start();

// Pastikan timezone konsisten
date_default_timezone_set('Asia/Jakarta');
if (isset($pdo)) {
    $pdo->exec("SET time_zone = '+07:00'");
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'email' => 'required|email'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$email = trim($input['email']);

try {
    // Cari user berdasarkan email
    $stmt = $pdo->prepare("SELECT id, nama FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Jika email tidak terdaftar, kirim respons sukses generik untuk mencegah enumerasi
    if (!$user) {
        Response::success('Jika email terdaftar, kode OTP telah dikirim.');
        return; // Response::success sudah exit
    }

    // Cek apakah ada OTP yang belum expired dan belum dipakai
    $stmt = $pdo->prepare(
        "SELECT id, created_at FROM password_reset_otp 
         WHERE user_id = ? AND is_used = 0 AND expired_at > NOW()
         ORDER BY created_at DESC LIMIT 1"
    );
    $stmt->execute([$user['id']]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Cek jeda 60 detik
        $lastTime = strtotime($existing['created_at']);
        if (time() - $lastTime < 60) {
            Response::error('Mohon tunggu 60 detik sebelum meminta OTP baru.', 429);
        }
        // Hapus OTP lama yang belum dipakai
        $stmt = $pdo->prepare("DELETE FROM password_reset_otp WHERE id = ?");
        $stmt->execute([$existing['id']]);
    }

    // Generate OTP 6 digit
    $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

    // Simpan ke database, expired_at dihitung oleh MySQL (5 menit dari NOW())
    $stmt = $pdo->prepare(
        "INSERT INTO password_reset_otp (user_id, otp_code, expired_at, is_used) 
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 0)"
    );
    $stmt->execute([$user['id'], $otp]);

    // Kirim email
    $subject = 'Kode OTP Reset Password - SIKACA';
    $body = "
        <h3>Halo {$user['nama']},</h3>
        <p>Anda meminta reset password. Gunakan kode OTP berikut:</p>
        <h2 style='color:#228b22;font-size:28px;'>{$otp}</h2>
        <p>Kode berlaku 5 menit. Jangan berikan ke orang lain.</p>
        <br><p>Terima kasih,<br>Tim SIKACA</p>
    ";

    try {
        $sent = Mailer::send($email, $subject, $body);
        if (!$sent) {
            // Hapus OTP jika email gagal
            $stmt = $pdo->prepare("DELETE FROM password_reset_otp WHERE user_id = ? AND otp_code = ?");
            $stmt->execute([$user['id'], $otp]);
            Response::error('Gagal mengirim email. Coba lagi nanti.', 500);
        }
    } catch (Exception $e) {
        error_log('Mailer error: ' . $e->getMessage());
        // Hapus OTP jika email gagal
        $stmt = $pdo->prepare("DELETE FROM password_reset_otp WHERE user_id = ? AND otp_code = ?");
        $stmt->execute([$user['id'], $otp]);
        Response::error('Gagal mengirim email: ' . $e->getMessage(), 500);
    }

    Response::success('Kode OTP telah dikirim ke email Anda.');
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
} catch (Exception $e) {
    error_log('General error: ' . $e->getMessage());
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}