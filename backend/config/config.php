<?php
// backend/config/config.php

// Atur timezone default PHP agar sinkron dengan MySQL
date_default_timezone_set('Asia/Jakarta');

// Konfigurasi global aplikasi
define('BASE_PATH', dirname(__DIR__));
define('UPLOAD_PATH', BASE_PATH . '/uploads/menu/');
define('BASE_URL', 'http://localhost/sikaca/backend'); // Ganti jika perlu
define('ID_PESANAN_PREFIX', 'MA');

// Pastikan folder upload ada
if (!file_exists(UPLOAD_PATH)) {
    mkdir(UPLOAD_PATH, 0777, true);
}

// Atur parameter cookie session sebelum session_start (dipanggil di endpoint)
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',  
    'domain'   => '',
    'secure'   => false,   // set true jika HTTPS
    'httponly' => true,
    'samesite' => 'Lax'    // Bisa 'None' jika perlu, tapi harus Secure=true
]);

// Include CORS
require_once BASE_PATH . '/includes/Cors.php';
Cors::allow();

// ================= KONFIGURASI SMTP (untuk kirim email OTP) =================
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', 'nur23aisyah11@gmail.com'); // Ganti dengan email Gmail Anda
define('SMTP_PASSWORD', 'clyi cvrq aqdg kfth');     // App Password Gmail Anda
define('SMTP_SECURE', 'tls');                       // 'tls' atau 'ssl'
define('MAIL_FROM_EMAIL', 'nur23aisyah11@gmail.com'); // HARUS sama dengan SMTP_USERNAME
define('MAIL_FROM_NAME', 'SIKACA Cafe');