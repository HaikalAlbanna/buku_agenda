const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// GET semua surat keluar
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      return res.json(localStore.getSuratKeluar());
    }

    res.json(data || []);
  } catch (err) {
    res.json(localStore.getSuratKeluar());
  }
});

// GET export surat keluar
router.get("/export", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .select("*")
      .order("tanggal", { ascending: false });

    if (error) {
      return res.json(localStore.getSuratKeluar());
    }

    res.json(data || []);
  } catch (err) {
    res.json(localStore.getSuratKeluar());
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

    if (error || !data) {
      const fallback = localStore.getSuratKeluarById(req.params.id);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ error: "Surat tidak ditemukan" });
    }

    res.json(data);
  } catch (err) {
    const fallback = localStore.getSuratKeluarById(req.params.id);
    if (fallback) return res.json(fallback);
    res.status(404).json({ error: "Surat tidak ditemukan" });
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

  try {
    const { data, error } = await supabase.from("surat_keluar").insert([row]).select();

    if (error) {
      const saved = localStore.addSuratKeluar(row);
      return res.json({
        message: "Surat keluar berhasil ditambahkan (Local Fallback)",
        data: [saved],
      });
    }

    res.json({ message: "Surat keluar berhasil ditambahkan", data });
  } catch (err) {
    const saved = localStore.addSuratKeluar(row);
    res.json({
      message: "Surat keluar berhasil ditambahkan (Local Fallback)",
      data: [saved],
    });
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

  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      localStore.updateSuratKeluar(id, updateData);
      return res.json({
        message: "Surat keluar berhasil diperbarui (Local Fallback)",
      });
    }

    res.json({ message: "Surat keluar berhasil diperbarui", data });
  } catch (err) {
    localStore.updateSuratKeluar(id, updateData);
    res.json({
      message: "Surat keluar berhasil diperbarui (Local Fallback)",
    });
  }
});

// DELETE surat keluar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from("surat_keluar")
      .delete()
      .eq("id", id);

    if (error) {
      localStore.deleteSuratKeluar(id);
      return res.json({ message: "Surat keluar berhasil dihapus" });
    }

    res.json({ message: "Surat keluar berhasil dihapus" });
  } catch (err) {
    localStore.deleteSuratKeluar(id);
    res.json({ message: "Surat keluar berhasil dihapus" });
  }
});

module.exports = router;
