<?php
// backend/includes/Mailer.php
require_once BASE_PATH . '/vendor/autoload.php'; // PHPMailer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    /**
     * Kirim email sederhana.
     * @param string $to Email tujuan
     * @param string $subject Judul email
     * @param string $body Isi email (bisa HTML)
     * @return bool true jika berhasil, false jika gagal
     */
    public static function send($to, $subject, $body)
    {
        $mail = new PHPMailer(true);
        try {
            // Server settings
            $mail->isSMTP();
            $mail->Host       = SMTP_HOST;
            $mail->SMTPAuth   = true;
            $mail->Username   = SMTP_USERNAME;
            $mail->Password   = SMTP_PASSWORD;
            $mail->SMTPSecure = SMTP_SECURE;
            $mail->Port       = SMTP_PORT;

            // Recipient
            $mail->setFrom(MAIL_FROM_EMAIL, MAIL_FROM_NAME);
            $mail->addAddress($to);

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            // Log error jika perlu
            // error_log($mail->ErrorInfo);
            return false;
        }
    }
}