const express = require("express");
const router = express.Router();
const dataCache = require("../data_cache");

// GET semua buku (bisa dengan ?include=tipe)
router.get("/", (req, res) => {
  const { include } = req.query;
  if (include === "tipe") {
    return res.json(dataCache.getBukuWithTipe());
  }
  return res.json(dataCache.getBuku());
});

// POST tambah buku baru
router.post("/", async (req, res) => {
  const { kode, nama } = req.body;
  if (!kode || !nama) {
    return res.status(400).json({ error: "Kode dan nama wajib diisi" });
  }

  const newBuku = {
    kode: kode.toUpperCase().trim(),
    nama: nama.trim(),
  };

  const saved = await dataCache.addBuku(newBuku);
  res.json({ message: "Buku berhasil ditambahkan", data: [saved] });
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  await dataCache.deleteBuku(kode);
  res.json({ message: "Buku berhasil dihapus" });
});

module.exports = router;
