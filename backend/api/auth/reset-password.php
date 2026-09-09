<?php
// backend/api/auth/reset-password.php
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
    'password'              => 'required',
    'password_confirmation' => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

if ($input['password'] !== $input['password_confirmation']) {
    Response::error('Konfirmasi password tidak cocok.', 422);
}

if (strlen($input['password']) < 6) {
    Response::error('Password minimal 6 karakter.', 422);
}

// Pastikan ada session reset_user_id
if (!isset($_SESSION['reset_user_id']) || !isset($_SESSION['reset_expires'])) {
    Response::error('Sesi reset password tidak ditemukan.', 401);
}

if (time() > $_SESSION['reset_expires']) {
    unset($_SESSION['reset_user_id'], $_SESSION['reset_expires']);
    Response::error('Sesi reset password sudah kedaluwarsa.', 401);
}

$userId = $_SESSION['reset_user_id'];

try {
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->execute([$hashedPassword, $userId]);

    // Hapus session reset
    unset($_SESSION['reset_user_id'], $_SESSION['reset_expires']);

    Response::success('Password berhasil direset. Silakan login dengan password baru.');
} catch (PDOException $e) {
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}