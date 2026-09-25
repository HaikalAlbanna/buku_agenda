const express = require("express");
const router = express.Router();
const db = require("../db");

// GET semua tipe surat untuk satu buku
router.get("/:buku_kode", async (req, res) => {
  const { buku_kode } = req.params;
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tipe_surat WHERE buku_kode = ?",
      [buku_kode],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah tipe surat baru ke buku
router.post("/", async (req, res) => {
  const { buku_kode, kode, nama } = req.body;
  if (!buku_kode || !kode || !nama)
    return res.status(400).json({ error: "Semua field wajib diisi" });
  try {
    await db.execute(
      "INSERT INTO tipe_surat (buku_kode, kode, nama) VALUES (?, ?, ?)",
      [buku_kode, kode, nama],
    );
    res.json({ message: "Tipe surat berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tipe surat berdasarkan kode & buku_kode
router.delete("/:kode", async (req, res) => {
  const tipeKode = req.params.kode;
  const bukuKode = req.query.buku_kode; // frontend mengirim via query

  if (!bukuKode) {
    return res.status(400).json({ error: "buku_kode wajib disertakan" });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM tipe_surat WHERE kode = ? AND buku_kode = ?",
      [tipeKode, bukuKode],
    );

    // Periksa apakah ada baris yang dihapus
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipe surat tidak ditemukan" });
    }

    res.json({ message: "Tipe surat berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
