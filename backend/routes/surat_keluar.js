const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua surat keluar
router.get("/", async (req, res) => {
  const { buku, tahun } = req.query;
  try {
    let query = supabase
      .from("surat_keluar")
      .select("id, buku_kode, tipe_kode, nomor_urut, nomor_surat, tanggal, alamat_dituju, perihal, pdf_file_name, pdf_data, created_at")
      .order("tanggal", { ascending: false })
      .order("created_at", { ascending: false });

    if (buku && buku !== "all") {
      query = query.eq("buku_kode", buku.trim().toUpperCase());
    }

    if (tahun) {
      query = query.gte("tanggal", `${tahun}-01-01`).lte("tanggal", `${tahun}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[surat_keluar] Error fetching surat keluar:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("[surat_keluar] Exception:", err);
    return res.status(500).json({ error: err.message });
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
      console.error("[surat_keluar] Error exporting surat keluar:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("[surat_keluar] Exception:", err);
    return res.status(500).json({ error: err.message });
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

    if (error) {
      return res.status(404).json({ error: "Surat tidak ditemukan" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(404).json({ error: "Surat tidak ditemukan" });
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

  if (!bukuKode || !tipeKode || !nomorUrut || !nomorSurat || !tanggal || !perihal) {
    return res.status(400).json({
      error: "Data surat keluar belum lengkap. Pastikan Buku, Kode Tipe, Nomor Urut, Tanggal, dan Perihal telah diisi.",
    });
  }

  const row = {
    id: id || "SK-" + Date.now(),
    buku_kode: String(bukuKode).trim().toUpperCase(),
    tipe_kode: String(tipeKode).trim(),
    nomor_urut: String(nomorUrut).trim(),
    nomor_surat: String(nomorSurat).trim(),
    tanggal: String(tanggal).trim(),
    alamat_dituju: alamatDituju ? String(alamatDituju).trim() : null,
    perihal: String(perihal).trim(),
    pdf_file_name: pdfFileName || null,
    pdf_data: pdfData || null,
  };

  try {
    const { data, error } = await supabase.from("surat_keluar").insert([row]).select();

    if (error) {
      console.error("[surat_keluar] Supabase error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor atau pasang SUPABASE_SERVICE_ROLE_KEY di Environment Variables Vercel.";
      } else if (error.code === "23503") {
        userFriendlyMessage = `Relasi Buku/Tipe tidak ditemukan: Buku '${bukuKode}' atau Tipe '${tipeKode}' belum terdaftar di database.`;
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }

    return res.json({ message: "Surat keluar berhasil ditambahkan", data });
  } catch (err) {
    console.error("[surat_keluar] Exception:", err);
    return res.status(500).json({ error: err.message });
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

  const updateData = {};
  if (bukuKode) updateData.buku_kode = String(bukuKode).trim().toUpperCase();
  if (tipeKode) updateData.tipe_kode = String(tipeKode).trim();
  if (nomorUrut) updateData.nomor_urut = String(nomorUrut).trim();
  if (nomorSurat) updateData.nomor_surat = String(nomorSurat).trim();
  if (tanggal) updateData.tanggal = String(tanggal).trim();
  if (alamatDituju !== undefined) updateData.alamat_dituju = alamatDituju ? String(alamatDituju).trim() : null;
  if (perihal) updateData.perihal = String(perihal).trim();
  if (pdfFileName !== undefined) updateData.pdf_file_name = pdfFileName;
  if (pdfData !== undefined) updateData.pdf_data = pdfData;

  try {
    const { data, error } = await supabase
      .from("surat_keluar")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[surat_keluar] Supabase update error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor.";
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }

    return res.json({ message: "Surat keluar berhasil diperbarui", data });
  } catch (err) {
    console.error("[surat_keluar] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE surat keluar
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("surat_keluar").delete().eq("id", id);
    if (error) {
      console.error("[surat_keluar] Supabase delete error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor.";
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }
    return res.json({ message: "Surat keluar berhasil dihapus" });
  } catch (err) {
    console.error("[surat_keluar] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

