const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua surat masuk
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("masuk")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah surat masuk baru
router.post("/", async (req, res) => {
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;
  if (!nomor_surat || !tanggal || !surat_dari || !perihal) {
    return res.status(400).json({ error: "Data surat masuk belum lengkap" });
  }

  try {
    const { data, error } = await supabase.from("masuk").insert([
      {
        nomor_surat,
        tanggal,
        surat_dari,
        perihal,
        arsip_pdf: arsip_pdf || null,
      },
    ]).select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat masuk berhasil ditambahkan", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update surat masuk
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nomor_surat, tanggal, surat_dari, perihal, arsip_pdf } = req.body;

  try {
    const updateData = {
      nomor_surat,
      tanggal,
      surat_dari,
      perihal,
    };
    if (arsip_pdf !== undefined) {
      updateData.arsip_pdf = arsip_pdf;
    }

    const { data, error } = await supabase
      .from("masuk")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat masuk berhasil diupdate", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE surat masuk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("masuk").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Surat masuk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
