const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua surat masuk
router.get("/", async (req, res) => {
  const { tahun } = req.query;
  try {
    let query = supabase
      .from("masuk")
      .select("id, nomor_surat, tanggal, surat_dari, perihal, arsip_pdf, created_at")
      .order("tanggal", { ascending: false })
      .order("id", { ascending: false });

    if (tahun) {
      query = query.gte("tanggal", `${tahun}-01-01`).lte("tanggal", `${tahun}-12-31`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[masuk] Error fetching surat masuk:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("[masuk] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET detail surat masuk
router.get("/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("masuk")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
    }

    return res.json(data);
  } catch (err) {
    return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
  }
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

  try {
    const { data, error } = await supabase
      .from("masuk")
      .insert([payload])
      .select();

    if (error) {
      console.error("[masuk] Supabase insert error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor atau pasang SUPABASE_SERVICE_ROLE_KEY di Environment Variables Vercel.";
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }

    return res.json({ message: "Surat masuk berhasil ditambahkan", data });
  } catch (err) {
    console.error("[masuk] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
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

  try {
    const { data, error } = await supabase
      .from("masuk")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("[masuk] Supabase update error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor.";
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }

    return res.json({ message: "Surat masuk berhasil diperbarui", data });
  } catch (err) {
    console.error("[masuk] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE surat masuk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("masuk").delete().eq("id", id);
    if (error) {
      console.error("[masuk] Supabase delete error:", error);
      let userFriendlyMessage = error.message;
      if (error.code === "42501") {
        userFriendlyMessage = "Izin database ditolak (Supabase RLS Policy). Harap jalankan file docs/database/fix_rls.sql di Supabase SQL Editor.";
      }
      return res.status(500).json({ error: userFriendlyMessage, code: error.code });
    }
    return res.json({ message: "Surat masuk berhasil dihapus" });
  } catch (err) {
    console.error("[masuk] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

