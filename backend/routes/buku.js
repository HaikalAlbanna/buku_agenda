const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// GET semua buku
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .order("kode", { ascending: true });

    if (error || !data || data.length === 0) {
      return res.json(localStore.getBuku());
    }

    res.json(data);
  } catch (err) {
    res.json(localStore.getBuku());
  }
});

// POST tambah buku baru
router.post("/", async (req, res) => {
  const { kode, nama } = req.body;
  if (!kode || !nama) {
    return res.status(400).json({ error: "Kode dan nama wajib diisi" });
  }

  const newBuku = {
    kode: kode.toUpperCase().trim(),
    nama: nama.trim(),
  };

  try {
    const { data, error } = await supabase.from("buku").insert([newBuku]).select();

    if (error) {
      const saved = localStore.addBuku(newBuku);
      return res.json({ message: "Buku berhasil ditambahkan (Local Fallback)", data: [saved] });
    }

    res.json({ message: "Buku berhasil ditambahkan", data });
  } catch (err) {
    const saved = localStore.addBuku(newBuku);
    res.json({ message: "Buku berhasil ditambahkan (Local Fallback)", data: [saved] });
  }
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;
  try {
    const { error } = await supabase.from("buku").delete().eq("kode", kode);
    if (error) {
      localStore.deleteBuku(kode);
      return res.json({ message: "Buku berhasil dihapus" });
    }
    res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    localStore.deleteBuku(kode);
    res.json({ message: "Buku berhasil dihapus" });
  }
});

module.exports = router;
