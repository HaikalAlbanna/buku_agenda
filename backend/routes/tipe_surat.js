const express = require("express");
const router = express.Router();
const dataCache = require("../data_cache");

// GET tipe surat berdasarkan buku_kode
router.get("/:buku_kode", (req, res) => {
  const { buku_kode } = req.params;
  res.json(dataCache.getTipeSurat(buku_kode));
});

// POST tambah tipe surat baru
router.post("/", async (req, res) => {
  const { buku_kode, kode, nama } = req.body;
  if (!buku_kode || !kode || !nama) {
    return res
      .status(400)
      .json({ error: "Buku kode, kode, dan nama wajib diisi" });
  }

  const newTipe = {
    buku_kode: buku_kode.trim().toUpperCase(),
    kode: kode.trim(),
    nama: nama.trim(),
  };

  const saved = await dataCache.addTipeSurat(newTipe);
  res.json({ message: "Tipe surat berhasil ditambahkan", data: [saved] });
});

// DELETE tipe surat
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  const { buku_kode } = req.query;

  if (!buku_kode) {
    return res.status(400).json({ error: "Query buku_kode wajib diisi" });
  }

  await dataCache.deleteTipeSurat(buku_kode, kode);
  res.json({ message: "Tipe surat berhasil dihapus" });
});

module.exports = router;
