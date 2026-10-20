const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET tipe surat berdasarkan buku_kode
router.get("/:buku_kode", async (req, res) => {
  const { buku_kode } = req.params;
  const cleanKode = String(buku_kode).trim().toUpperCase();

  try {
    const { data, error } = await supabase
      .from("tipe_surat")
      .select("buku_kode, kode, nama")
      .eq("buku_kode", cleanKode)
      .order("kode", { ascending: true });

    if (error) {
      console.error("[tipe_surat] Error fetching tipe surat:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("[tipe_surat] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST tambah tipe surat baru
router.post("/", async (req, res) => {
  const { buku_kode, kode, nama } = req.body;
  if (!buku_kode || !kode || !nama) {
    return res
      .status(400)
      .json({ error: "Buku kode, kode, dan nama wajib diisi" });
  }

  const newTipe = {
    buku_kode: buku_kode.trim().toUpperCase(),
    kode: kode.trim(),
    nama: nama.trim(),
  };

  try {
    const { data, error } = await supabase
      .from("tipe_surat")
      .upsert([newTipe])
      .select();

    if (error) {
      console.error("[tipe_surat] Supabase upsert error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Tipe surat berhasil ditambahkan", data });
  } catch (err) {
    console.error("[tipe_surat] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE tipe surat
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  const { buku_kode } = req.query;

  if (!buku_kode) {
    return res.status(400).json({ error: "Query buku_kode wajib diisi" });
  }

  try {
    const { error } = await supabase
      .from("tipe_surat")
      .delete()
      .eq("buku_kode", buku_kode)
      .eq("kode", kode);

    if (error) {
      console.error("[tipe_surat] Supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Tipe surat berhasil dihapus" });
  } catch (err) {
    console.error("[tipe_surat] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

