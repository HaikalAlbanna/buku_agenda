const express = require("express");
const router = express.Router();
const dataCache = require("../data_cache");

// GET semua surat keluar
router.get("/", (req, res) => {
  res.json(dataCache.getSuratKeluar());
});

// GET export surat keluar
router.get("/export", (req, res) => {
  res.json(dataCache.getSuratKeluar());
});

// GET detail surat keluar
router.get("/:id", (req, res) => {
  const item = dataCache.getSuratKeluarById(req.params.id);
  if (!item) {
    return res.status(404).json({ error: "Surat tidak ditemukan" });
  }
  res.json(item);
});

// POST tambah surat keluar
router.post("/", async (req, res) => {
  const {
    id,
    bukuKode,
    tipeKode,
    nomorUrut,
    nomorSurat,
    tanggal,
    alamatDituju,
    perihal,
    pdfFileName,
    pdfData,
  } = req.body;

  const row = {
    id: id || "SK-" + Date.now(),
    buku_kode: bukuKode,
    tipe_kode: tipeKode,
    nomor_urut: nomorUrut,
    nomor_surat: nomorSurat,
    tanggal,
    alamat_dituju: alamatDituju || null,
    perihal,
    pdf_file_name: pdfFileName || null,
    pdf_data: pdfData || null,
  };

  const saved = await dataCache.addSuratKeluar(row);
  res.json({ message: "Surat keluar berhasil ditambahkan", data: [saved] });
});

// PUT update surat keluar
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    bukuKode,
    tipeKode,
    nomorUrut,
    nomorSurat,
    tanggal,
    alamatDituju,
    perihal,
    pdfFileName,
    pdfData,
  } = req.body;

  const updateData = {
    buku_kode: bukuKode,
    tipe_kode: tipeKode,
    nomor_urut: nomorUrut,
    nomor_surat: nomorSurat,
    tanggal,
    alamat_dituju: alamatDituju || null,
    perihal,
  };

  if (pdfFileName !== undefined) updateData.pdf_file_name = pdfFileName;
  if (pdfData !== undefined) updateData.pdf_data = pdfData;

  const updated = await dataCache.updateSuratKeluar(id, updateData);
  res.json({ message: "Surat keluar berhasil diperbarui", data: updated });
});

// DELETE surat keluar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await dataCache.deleteSuratKeluar(id);
  res.json({ message: "Surat keluar berhasil dihapus" });
});

module.exports = router;
