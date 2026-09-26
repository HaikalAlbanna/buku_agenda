const express = require("express");
const router = express.Router();
const dataCache = require("../data_cache");

// GET semua surat masuk
router.get("/", (req, res) => {
  res.json(dataCache.getMasuk());
});

// POST tambah surat masuk baru
router.post("/", async (req, res) => {
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;
  if (!nomor_surat || !tanggal || !surat_dari || !perihal) {
    return res.status(400).json({ error: "Data surat masuk belum lengkap" });
  }

  const payload = {
    nomor_surat,
    tanggal,
    surat_dari,
    perihal,
    arsip_pdf: arsip_pdf || null,
  };

  const saved = await dataCache.addMasuk(payload);
  res.json({ message: "Surat masuk berhasil ditambahkan", data: [saved] });
});

// PUT update surat masuk
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;

  const updateData = {
    nomor_surat,
    tanggal,
    surat_dari,
    perihal,
  };
  if (arsip_pdf !== undefined) {
    updateData.arsip_pdf = arsip_pdf;
  }

  const updated = await dataCache.updateMasuk(id, updateData);
  res.json({ message: "Surat masuk berhasil diperbarui", data: updated });
});

// DELETE surat masuk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await dataCache.deleteMasuk(id);
  res.json({ message: "Surat masuk berhasil dihapus" });
});

module.exports = router;
