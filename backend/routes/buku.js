const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua buku
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase.from("buku").select("*").order("kode", { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST tambah buku baru
router.post("/", async (req, res) => {
  const { kode, nama } = req.body;
  if (!kode || !nama) {
    return res.status(400).json({ error: "Kode dan nama wajib diisi" });
  }
  try {
    const { data, error } = await supabase.from("buku").insert([
      {
        kode: kode.toUpperCase().trim(),
        nama: nama.trim(),
      },
    ]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Buku berhasil ditambahkan", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  try {
    const { error } = await supabase.from("buku").delete().eq("kode", kode);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
