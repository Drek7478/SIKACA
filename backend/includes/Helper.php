<?php
// backend/includes/Helper.php

class Helper
{
    /**
     * Generate ID pesanan berikutnya (format: PREFIX-XXX)
     * Contoh: MA-001, MA-002, dst.
     * @param PDO $pdo
     * @return string
     */
    public static function generateIdPesanan($pdo)
    {
        $prefix = ID_PESANAN_PREFIX;
        // Ambil nomor terakhir
        $stmt = $pdo->prepare("SELECT id_pesanan FROM pesanan WHERE id_pesanan LIKE ? ORDER BY id_pesanan DESC LIMIT 1");
        $stmt->execute([$prefix . '-%']);
        $lastId = $stmt->fetchColumn();

        if ($lastId) {
            // Ambil angka setelah prefix dan dash
            $number = (int) substr($lastId, strlen($prefix) + 1);
            $nextNumber = $number + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . '-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Upload gambar menu
     * @param array $file $_FILES['gambar']
     * @return string|null Nama file yang disimpan (basename), atau null jika tidak ada
     * @throws Exception jika upload gagal
     */
    public static function uploadGambar($file)
    {
        if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
            return null;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Upload gambar gagal, kode error: ' . $file['error']);
        }

        // Validasi tipe file
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $fileType = mime_content_type($file['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception('Tipe file tidak diizinkan. Gunakan JPG, PNG, atau WebP.');
        }

        // Validasi ukuran maksimal 2MB
        if ($file['size'] > 2 * 1024 * 1024) {
            throw new Exception('Ukuran file maksimal 2MB.');
        }

        // Generate nama file unik
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $newName = 'menu_' . time() . '_' . uniqid() . '.' . $extension;
        $destination = UPLOAD_PATH . $newName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception('Gagal menyimpan file gambar.');
        }

        return $newName;
    }

    /**
     * Hapus file gambar dari server
     * @param string $fileName
     */
    public static function deleteGambar($fileName)
    {
        if ($fileName && file_exists(UPLOAD_PATH . $fileName)) {
            unlink(UPLOAD_PATH . $fileName);
        }
    }

    /**
     * Format angka menjadi Rupiah (untuk response, frontend juga bisa format sendiri)
     * Tidak digunakan di backend, hanya untuk referensi.
     */
    public static function formatRupiah($angka)
    {
        return 'Rp ' . number_format($angka, 0, ',', '.');
    }

    /**
     * Validasi input sederhana
     * @param array $data
     * @param array $rules contoh: ['nama' => 'required', 'harga' => 'required|numeric']
     * @return array Error messages (kosong jika valid)
     */
    public static function validate($data, $rules)
    {
        $errors = [];
        foreach ($rules as $field => $rule) {
            $value = isset($data[$field]) ? $data[$field] : null;
            $ruleList = explode('|', $rule);
            foreach ($ruleList as $r) {
                if ($r === 'required' && (is_null($value) || $value === '')) {
                    $errors[$field] = ucfirst($field) . ' wajib diisi.';
                } elseif ($r === 'numeric' && !is_numeric($value) && $value !== '') {
                    $errors[$field] = ucfirst($field) . ' harus berupa angka.';
                } elseif ($r === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL) && $value !== '') {
                    $errors[$field] = ucfirst($field) . ' harus berupa email valid.';
                }
            }
        }
        return $errors;
    }
}