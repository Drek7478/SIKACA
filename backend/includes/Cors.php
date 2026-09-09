<?php
// backend/includes/Cors.php

class Cors
{
    /**
     * Izinkan origin frontend dan atur header CORS.
     * Sesuaikan dengan origin frontend Anda (default Vite dev server).
     */
    public static function allow()
    {
        // Ganti dengan origin frontend jika berbeda
        $allowedOrigin = 'http://localhost:5173';

        header("Access-Control-Allow-Origin: $allowedOrigin");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        // Tangani preflight request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}