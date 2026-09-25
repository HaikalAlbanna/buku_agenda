const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua surat keluar
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET export surat keluar
router.get("/export", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET detail surat keluar
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Surat tidak ditemukan" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  try {
    const { data, error } = await supabase.from("surat_keluar").insert([
      {
        id,
        buku_kode: bukuKode,
        tipe_kode: tipeKode,
        nomor_urut: nomorUrut,
        nomor_surat: nomorSurat,
        tanggal,
        alamat_dituju: alamatDituju || null,
        perihal,
        pdf_file_name: pdfFileName || null,
        pdf_data: pdfData || null,
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat keluar berhasil ditambahkan", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

  try {
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

    const { data, error } = await supabase
      .from("surat_keluar")
      .update(updateData)
      .eq("id", id);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat keluar berhasil diperbarui", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE surat keluar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("surat_keluar").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat keluar berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
