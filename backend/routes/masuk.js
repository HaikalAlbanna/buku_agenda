const express = require("express");
const router = express.Router();
const db = require("../db"); // pastikan ini sudah .promise()

// GET semua surat masuk
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM masuk ORDER BY tanggal DESC",
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST surat masuk
router.post("/", async (req, res) => {
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;
  try {
    await db.execute(
      `INSERT INTO masuk (nomor_surat, tanggal, surat_dari, perihal, arsip_pdf) VALUES (?, ?, ?, ?, ?)`,
      [nomor_surat, tanggal, surat_dari, perihal, arsip_pdf],
    );
    res.json({ message: "✅ Surat masuk berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update surat masuk
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;
  try {
    await db.execute(
      `UPDATE masuk SET nomor_surat=?, tanggal=?, surat_dari=?, perihal=?, arsip_pdf=? WHERE id=?`,
      [nomor_surat, tanggal, surat_dari, perihal, arsip_pdf, id],
    );
    res.json({ message: "✏️ Surat masuk berhasil diupdate" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE surat masuk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM masuk WHERE id=?", [id]);
    res.json({ message: "🗑 Surat masuk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
