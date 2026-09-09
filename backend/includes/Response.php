<?php
// backend/includes/Response.php

class Response
{
    /**
     * Kirim response JSON
     * @param string $status  'success' atau 'error'
     * @param string $message Pesan untuk client
     * @param mixed  $data    Data yang dikirim (array, object, atau null)
     * @param int    $code    HTTP status code (default 200)
     */
    public static function send($status, $message, $data = null, $code = 200)
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'status'  => $status,
            'message' => $message,
            'data'    => $data
        ]);
        exit;
    }

    // Shortcut untuk success
    public static function success($message = 'Berhasil', $data = null)
    {
        self::send('success', $message, $data);
    }

    // Shortcut untuk error
    public static function error($message = 'Terjadi kesalahan', $code = 400, $data = null)
    {
        self::send('error', $message, $data, $code);
    }
}