<?php
// backend/api/kasir/pesanan/store.php

require_once dirname(__DIR__, 3) . '/config/config.php';
require_once BASE_PATH . '/config/database.php';
require_once BASE_PATH . '/includes/Response.php';
require_once BASE_PATH . '/includes/Auth.php';
require_once BASE_PATH . '/includes/Middleware.php';
require_once BASE_PATH . '/includes/Helper.php';

session_start();
Middleware::requireKasir();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method tidak diizinkan.', 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validasi input dasar
$errors = Helper::validate($input ?? [], [
    'nama_pembeli' => 'required',
    'tipe_order'   => 'required',
    'metode_bayar' => 'required',
    'items'        => 'required'
]);
if (!empty($errors)) {
    Response::error('Validasi gagal.', 422, $errors);
}

// Validasi enum
$tipeOrder = $input['tipe_order'];
if (!in_array($tipeOrder, ['dine_in', 'take_away'])) {
    Response::error('Tipe order tidak valid.', 422);
}
$metodeBayar = $input['metode_bayar'];
if (!in_array($metodeBayar, ['qris', 'tunai'])) {
    Response::error('Metode bayar tidak valid.', 422);
}

$items = $input['items'];
if (!is_array($items) || count($items) === 0) {
    Response::error('Pesanan harus memiliki minimal satu item.', 422);
}

try {
    // Mulai transaksi database
    $pdo->beginTransaction();

    // Generate ID pesanan
    $idPesanan = Helper::generateIdPesanan($pdo);
    $totalKeseluruhan = 0;

    // Siapkan statement untuk insert pesanan dan detail
    $stmtPesanan = $pdo->prepare(
        "INSERT INTO pesanan (id_pesanan, tanggal, nama_pembeli, tipe_order, metode_bayar, total, kasir_id)
         VALUES (?, NOW(), ?, ?, ?, ?, ?)"
    );
    $stmtDetail = $pdo->prepare(
        "INSERT INTO detail_pesanan (pesanan_id, menu_id, jumlah, catatan, suhu, gula, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    // Insert pesanan utama dulu (total diupdate setelah detail)
    $stmtPesanan->execute([
        $idPesanan,
        trim($input['nama_pembeli']),
        $tipeOrder,
        $metodeBayar,
        0, // total sementara
        Auth::user()['id']
    ]);

    // Proses setiap item
    foreach ($items as $item) {
        // Validasi item
        $errors = Helper::validate($item, [
            'menu_id' => 'required|numeric',
            'jumlah'  => 'required|numeric'
        ]);
        if (!empty($errors)) {
            // Rollback karena ada item tidak valid
            $pdo->rollBack();
            Response::error('Validasi item gagal.', 422, $errors);
        }

        $menuId = (int)$item['menu_id'];
        $jumlah = (int)$item['jumlah'];
        if ($jumlah < 1) {
            $pdo->rollBack();
            Response::error('Jumlah item minimal 1.', 422);
        }

        // Ambil data menu
        $stmtMenu = $pdo->prepare("SELECT * FROM menu WHERE id = ?");
        $stmtMenu->execute([$menuId]);
        $menu = $stmtMenu->fetch();
        if (!$menu) {
            $pdo->rollBack();
            Response::error("Menu dengan ID $menuId tidak ditemukan.", 404);
        }
        if ($menu['status'] !== 'tersedia') {
            $pdo->rollBack();
            Response::error("Menu '{$menu['nama']}' tidak tersedia.", 400);
        }

        // Hitung subtotal
        $subtotal = $menu['harga'] * $jumlah;
        $totalKeseluruhan += $subtotal;

        // Tentukan suhu dan gula (nullable)
        $suhu = isset($item['suhu']) && in_array($item['suhu'], ['panas', 'dingin']) ? $item['suhu'] : null;
        $gula = isset($item['gula']) && in_array($item['gula'], ['regular', 'less', 'non']) ? $item['gula'] : null;
        $catatan = isset($item['catatan']) ? trim($item['catatan']) : null;

        // Insert detail
        $stmtDetail->execute([
            $idPesanan,
            $menuId,
            $jumlah,
            $catatan,
            $suhu,
            $gula,
            $subtotal
        ]);
    }

    // Update total pesanan
    $stmtUpdateTotal = $pdo->prepare("UPDATE pesanan SET total = ? WHERE id_pesanan = ?");
    $stmtUpdateTotal->execute([$totalKeseluruhan, $idPesanan]);

    // Commit transaksi
    $pdo->commit();

    Response::success('Pesanan berhasil dibuat.', [
        'id_pesanan' => $idPesanan,
        'total'      => $totalKeseluruhan
    ]);
} catch (Exception $e) {
    // Rollback jika terjadi kesalahan
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    Response::error('Terjadi kesalahan server.', 500, ['error' => $e->getMessage()]);
}