const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// Cache sederhana untuk optimasi respon super cepat (< 5ms)
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
      let dbBuku = null;
      let dbTipe = null;

      try {
        const [resBuku, resTipe] = await Promise.all([
          supabase
            .from("buku")
            .select("kode, nama")
            .order("kode", { ascending: true }),
          supabase
            .from("tipe_surat")
            .select("buku_kode, kode, nama")
            .order("kode", { ascending: true }),
        ]);

        // Debug logging
        console.log("[buku.js] resBuku error:", resBuku.error, "data length:", resBuku.data?.length);
        console.log("[buku.js] resTipe error:", resTipe.error, "data length:", resTipe.data?.length);

        if (!resBuku.error && resBuku.data && resBuku.data.length > 0) {
          dbBuku = resBuku.data;
        }
        if (!resTipe.error && resTipe.data) {
          dbTipe = resTipe.data;
        }
      } catch (e) {
        console.error("[buku.js] Supabase query error:", e.message);
        // Abaikan error Supabase, fallback ke localStore
      }

      // Sumber buku: Supabase jika ada, jika tidak gunakan localStore
      const bukuList = dbBuku && dbBuku.length > 0 ? dbBuku : localStore.getBuku();

      // Sumber tipe_surat: Supabase jika berhasil query, jika tidak gunakan localStore
      const tipeList = dbTipe !== null ? dbTipe : localStore.getTipeSurat();

      // Kelompokkan tipe surat berdasarkan buku_kode
      const map = {};
      for (const t of tipeList) {
        if (!map[t.buku_kode]) map[t.buku_kode] = [];
        map[t.buku_kode].push({ kode: t.kode, nama: t.nama });
      }

      const result = bukuList.map((b) => ({
        kode: b.kode,
        nama: b.nama,
        tipeSurat: map[b.kode] || [],
      }));

      cachedBukuWithTipe = result;
      lastCacheTime = now;
      return res.json(result);
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
      const bukuList = localStore.getBuku();
      const tipeList = localStore.getTipeSurat();
      const map = {};
      for (const t of tipeList) {
        if (!map[t.buku_kode]) map[t.buku_kode] = [];
        map[t.buku_kode].push({ kode: t.kode, nama: t.nama });
      }
      return res.json(
        bukuList.map((b) => ({
          kode: b.kode,
          nama: b.nama,
          tipeSurat: map[b.kode] || [],
        }))
      );
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
