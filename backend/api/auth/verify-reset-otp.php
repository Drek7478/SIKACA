<?php
// backend/api/auth/verify-reset-otp.php
require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'email'    => 'required|email',
    'otp_code' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$email = trim($input['email']);
$otp = trim($input['otp_code']);

try {
    // Cari user
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) {
        Response::error('Email tidak terdaftar.', 404);
    }

    // Cek OTP
    $stmt = $pdo->prepare(
        "SELECT * FROM password_reset_otp 
         WHERE user_id = ? AND otp_code = ? AND is_used = 0 AND expired_at > NOW()
         ORDER BY created_at DESC LIMIT 1"
    );
    $stmt->execute([$user['id'], $otp]);
    $record = $stmt->fetch();

    if (!$record) {
        Response::error('Kode OTP tidak valid atau sudah kedaluwarsa.', 401);
    }

    // Tandai OTP sudah dipakai
    $stmt = $pdo->prepare("UPDATE password_reset_otp SET is_used = 1 WHERE id = ?");
    $stmt->execute([$record['id']]);

    // Simpan user_id di session untuk reset password berikutnya
    $_SESSION['reset_user_id'] = $user['id'];
    $_SESSION['reset_expires'] = time() + 600; // 10 menit

    Response::success('OTP valid. Silakan buat password baru.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}