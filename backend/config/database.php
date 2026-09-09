<?php
// backend/config/database.php

// Konfigurasi database
$host = 'localhost';
$dbname = 'sikaca';
$username = 'root';     
$password = '';         

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    // Jika gagal koneksi, kirim response JSON error
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status'  => 'error',
        'message' => 'Koneksi database gagal: ' . $e->getMessage(),
        'data'    => null
    ]);
    exit;
}