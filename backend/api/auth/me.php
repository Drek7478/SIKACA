<?php
// backend/api/auth/me.php

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method tidak diizinkan.', 405);
}

if (Auth::check()) {
    $user = Auth::user();
    Response::success('Data user ditemukan.', $user);
} else {
    Response::error('Tidak ada sesi aktif.', 401);
}