<?php
// backend/includes/Auth.php

class Auth
{
    /**
     * Cek apakah user sudah login
     */
    public static function check()
    {
        return isset($_SESSION['user_id']);
    }

    /**
     * Ambil data user yang sedang login
     */
    public static function user()
    {
        if (self::check()) {
            return [
                'id'       => $_SESSION['user_id'],
                'nama'     => $_SESSION['nama'],
                'username' => $_SESSION['username'],
                'role'     => $_SESSION['role']
            ];
        }
        return null;
    }

    /**
     * Cek role admin
     */
    public static function isAdmin()
    {
        return self::check() && $_SESSION['role'] === 'admin';
    }

    /**
     * Cek role kasir
     */
    public static function isKasir()
    {
        return self::check() && $_SESSION['role'] === 'kasir';
    }

    /**
     * Login user dan set session
     * @param array $user Data user dari database
     */
    public static function login($user)
    {
        $_SESSION['user_id']  = $user['id'];
        $_SESSION['nama']     = $user['nama'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role']     = $user['role'];
        session_regenerate_id(true);
    }

    /**
     * Logout dan hapus session
     */
    public static function logout()
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params["path"], $params["domain"],
                $params["secure"], $params["httponly"]
            );
        }
        session_destroy();
    }
}