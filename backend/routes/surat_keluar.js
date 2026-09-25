const express = require("express");
const router = express.Router();
const db = require("../db");

/* ===================================================
   GET - Export (WAJIB DI ATAS /:id)
=================================================== */
router.get("/export", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        id,
        buku_kode,
        tipe_kode,
        nomor_urut,
        nomor_surat,
        tanggal,
        alamat_dituju,
        perihal,
        pdf_file_name
      FROM surat_keluar
      ORDER BY tanggal DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("🔥 EXPORT ERROR DETAIL:", error); // WAJIB ADA
    res.status(500).json({
      message: "Gagal export data",
      error: error.message,
    });
  }
});

/* ===================================================
   GET - Ambil semua surat keluar
=================================================== */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM surat_keluar ORDER BY tanggal DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error("GET surat_keluar error:", error);
    res.status(500).json({ message: "Gagal mengambil data surat keluar" });
  }
});

/* ===================================================
   GET - Ambil berdasarkan ID
=================================================== */
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM surat_keluar WHERE id = ?", [
      req.params.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("GET by ID error:", error);
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});

/* ===================================================
   POST
=================================================== */
router.post("/", async (req, res) => {
  try {
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

    await db.execute(
      `INSERT INTO surat_keluar
       (id, buku_kode, tipe_kode, nomor_urut, nomor_surat,
        tanggal, alamat_dituju, perihal,
        pdf_file_name, pdf_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        bukuKode,
        tipeKode,
        nomorUrut,
        nomorSurat,
        tanggal,
        alamatDituju,
        perihal,
        pdfFileName || null,
        pdfData || null,
      ],
    );

    res.status(201).json({ message: "Surat keluar berhasil ditambahkan" });
  } catch (error) {
    console.error("POST surat_keluar error:", error);
    res.status(500).json({ message: "Gagal menambahkan data" });
  }
});

/* ===================================================
   PUT
=================================================== */
router.put("/:id", async (req, res) => {
  try {
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

    const [result] = await db.execute(
      `UPDATE surat_keluar SET
        buku_kode = ?,
        tipe_kode = ?,
        nomor_urut = ?,
        nomor_surat = ?,
        tanggal = ?,
        alamat_dituju = ?,
        perihal = ?,
        pdf_file_name = ?,
        pdf_data = ?
       WHERE id = ?`,
      [
        bukuKode,
        tipeKode,
        nomorUrut,
        nomorSurat,
        tanggal,
        alamatDituju,
        perihal,
        pdfFileName || null,
        pdfData || null,
        req.params.id,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Surat keluar berhasil diperbarui" });
  } catch (error) {
    console.error("PUT surat_keluar error:", error);
    res.status(500).json({ message: "Gagal memperbarui data" });
  }
});

/* ===================================================
   DELETE
=================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.execute("DELETE FROM surat_keluar WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "Surat keluar berhasil dihapus" });
  } catch (error) {
    console.error("DELETE surat_keluar error:", error);
    res.status(500).json({ message: "Gagal menghapus data" });
  }
});

module.exports = router;
