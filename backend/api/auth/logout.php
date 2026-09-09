<?php
// backend/api/auth/logout.php

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

Auth::logout();
Response::success('Logout berhasil.');