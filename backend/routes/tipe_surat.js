const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET tipe surat berdasarkan buku_kode
router.get("/:buku_kode", async (req, res) => {
  const { buku_kode } = req.params;
  try {
    const { data, error } = await supabase
      .from("tipe_surat")
      .select("*")
      .eq("buku_kode", buku_kode)
      .order("kode", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah tipe surat baru
router.post("/", async (req, res) => {
  const { buku_kode, kode, nama } = req.body;
  if (!buku_kode || !kode || !nama) {
    return res.status(400).json({ error: "Buku kode, kode, dan nama wajib diisi" });
  }

  try {
    const { data, error } = await supabase.from("tipe_surat").insert([
      {
        buku_kode: buku_kode.trim(),
        kode: kode.trim(),
        nama: nama.trim(),
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Tipe surat berhasil ditambahkan", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Tipe surat berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
