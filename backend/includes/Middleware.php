<?php
// backend/includes/Middleware.php

class Middleware
{
    /**
     * Wajib login (admin atau kasir)
     */
    public static function requireLogin()
    {
        if (!Auth::check()) {
            Response::error('Silakan login terlebih dahulu.', 401);
        }
    }

    /**
     * Wajib role admin
     */
    public static function requireAdmin()
    {
        self::requireLogin();
        if (!Auth::isAdmin()) {
            Response::error('Anda tidak memiliki akses ke halaman ini.', 403);
        }
    }

    /**
     * Wajib role kasir
     */
    public static function requireKasir()
    {
        self::requireLogin();
        if (!Auth::isKasir()) {
            Response::error('Anda tidak memiliki akses ke halaman ini.', 403);
        }
    }
}