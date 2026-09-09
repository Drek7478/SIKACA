<?php
// backend/api/auth/disable-2fa.php
require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

if (!Auth::check()) {
    Response::error('Silakan login terlebih dahulu.', 401);
}

$input = json_decode(file_get_contents('php://input'), true);

$errors = Helper::validate($input ?? [], [
    'password' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

$password = $input['password'];
$userId = Auth::user()['id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (!$user) {
        Response::error('User tidak ditemukan.', 404);
    }

    if (!password_verify($password, $user['password'])) {
        Response::error('Password salah.', 401);
    }

    // Nonaktifkan 2FA
    $stmt = $pdo->prepare("UPDATE users SET is_2fa_enabled = 0, two_factor_secret = NULL WHERE id = ?");
    $stmt->execute([$userId]);

    Response::success('2FA berhasil dinonaktifkan.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}