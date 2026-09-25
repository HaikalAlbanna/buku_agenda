const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// Cache sederhana untuk optimasi respon cepat (< 5ms)
let cachedBuku = null;
let cachedBukuWithTipe = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 detik

function invalidateCache() {
  cachedBuku = null;
  cachedBukuWithTipe = null;
  lastCacheTime = 0;
}

// GET semua buku (bisa dengan ?include=tipe untuk 1 kali request super cepat)
router.get("/", async (req, res) => {
  const { include } = req.query;
  const now = Date.now();

  // Gunakan cache jika masih valid
  if (include === "tipe" && cachedBukuWithTipe && now - lastCacheTime < CACHE_TTL_MS) {
    return res.json(cachedBukuWithTipe);
  }
  if (!include && cachedBuku && now - lastCacheTime < CACHE_TTL_MS) {
    return res.json(cachedBuku);
  }

  try {
    if (include === "tipe") {
      // 1 Query gabungan Buku + Tipe Surat
      const { data, error } = await supabase
        .from("buku")
        .select("kode, nama, tipeSurat:tipe_surat (kode, nama)")
        .order("kode", { ascending: true });

      if (!error && data && data.length > 0) {
        cachedBukuWithTipe = data;
        lastCacheTime = now;
        return res.json(data);
      }

      // Fallback local store jika Supabase belum siap/kosong
      const fallbackList = localStore.getBuku().map((b) => ({
        ...b,
        tipeSurat: localStore.getTipeSurat(b.kode) || [],
      }));
      cachedBukuWithTipe = fallbackList;
      lastCacheTime = now;
      return res.json(fallbackList);
    }

    // Default: daftar buku saja
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .order("kode", { ascending: true });

    if (!error && data && data.length > 0) {
      cachedBuku = data;
      lastCacheTime = now;
      return res.json(data);
    }

    const fallbackBuku = localStore.getBuku();
    cachedBuku = fallbackBuku;
    lastCacheTime = now;
    return res.json(fallbackBuku);
  } catch (err) {
    if (include === "tipe") {
      const fallbackList = localStore.getBuku().map((b) => ({
        ...b,
        tipeSurat: localStore.getTipeSurat(b.kode) || [],
      }));
      return res.json(fallbackList);
    }
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

  invalidateCache();

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
  invalidateCache();

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
