const express = require("express");
const router = express.Router();
const db = require("../db");

// GET semua buku
router.get("/", async (req, res) => {
  try {
    const result = await db.execute("SELECT * FROM buku");
    // result biasanya [rows, fields]
    const rows = Array.isArray(result[0]) ? result[0] : result;
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah buku baru
router.post("/", async (req, res) => {
  const { kode, nama } = req.body;
  if (!kode || !nama)
    return res.status(400).json({ error: "Kode dan nama wajib diisi" });
  try {
    await db.execute("INSERT INTO buku (kode, nama) VALUES (?, ?)", [
      kode.toUpperCase(),
      nama,
    ]);
    res.json({ message: "Buku berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  try {
    await db.execute("DELETE FROM buku WHERE kode = ?", [kode]);
    res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
