const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// GET semua surat masuk
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("masuk")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      return res.json(data);
    }
    return res.json(localStore.getMasuk());
  } catch (err) {
    return res.json(localStore.getMasuk());
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
      const saved = localStore.addMasuk(payload);
      return res.json({
        message: "Surat masuk berhasil ditambahkan (Local Fallback)",
        data: [saved],
      });
    }

    localStore.addMasuk(payload);
    return res.json({ message: "Surat masuk berhasil ditambahkan", data });
  } catch (err) {
    const saved = localStore.addMasuk(payload);
    return res.json({
      message: "Surat masuk berhasil ditambahkan (Local Fallback)",
      data: [saved],
    });
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
      localStore.updateMasuk(id, updateData);
      return res.json({
        message: "Surat masuk berhasil diperbarui (Local Fallback)",
      });
    }

    localStore.updateMasuk(id, updateData);
    return res.json({ message: "Surat masuk berhasil diperbarui", data });
  } catch (err) {
    localStore.updateMasuk(id, updateData);
    return res.json({
      message: "Surat masuk berhasil diperbarui (Local Fallback)",
    });
  }
});

// DELETE surat masuk
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from("masuk").delete().eq("id", id);
    localStore.deleteMasuk(id);
    if (error) {
      return res.json({ message: "Surat masuk berhasil dihapus" });
    }
    return res.json({ message: "Surat masuk berhasil dihapus" });
  } catch (err) {
    localStore.deleteMasuk(id);
    return res.json({ message: "Surat masuk berhasil dihapus" });
  }
});

module.exports = router;
