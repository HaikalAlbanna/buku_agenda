const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// GET semua buku (bisa dengan ?include=tipe untuk 1 kali query paralel super cepat)
router.get("/", async (req, res) => {
  const { include } = req.query;

  try {
    if (include === "tipe") {
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

      const bukuList =
        !resBuku.error && resBuku.data && resBuku.data.length > 0
          ? resBuku.data
          : localStore.getBuku();

      const tipeList =
        !resTipe.error && resTipe.data && resTipe.data.length > 0
          ? resTipe.data
          : localStore.getTipeSurat();

      const map = {};
      for (const t of tipeList) {
        const key = String(t.buku_kode || "").trim().toUpperCase();
        if (!map[key]) map[key] = [];
        map[key].push({ kode: t.kode, nama: t.nama });
      }

      const result = bukuList.map((b) => {
        const bKey = String(b.kode || "").trim().toUpperCase();
        return {
          kode: b.kode,
          nama: b.nama,
          tipeSurat: map[bKey] || [],
        };
      });

      return res.json(result);
    }

    // Default: GET /api/buku
    const { data, error } = await supabase
      .from("buku")
      .select("*")
      .order("kode", { ascending: true });

    if (!error && data && data.length > 0) {
      return res.json(data);
    }

    return res.json(localStore.getBuku());
  } catch (err) {
    return res.json(localStore.getBuku());
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
    const { data, error } = await supabase
      .from("buku")
      .upsert([newBuku])
      .select();

    if (error) {
      console.error("[buku] Supabase upsert error:", error);
      const saved = localStore.addBuku(newBuku);
      return res.json({
        message: "Buku berhasil ditambahkan (Local Fallback)",
        data: [saved],
      });
    }

    localStore.addBuku(newBuku);
    return res.json({ message: "Buku berhasil ditambahkan", data });
  } catch (err) {
    const saved = localStore.addBuku(newBuku);
    return res.json({
      message: "Buku berhasil ditambahkan (Local Fallback)",
      data: [saved],
    });
  }
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;

  try {
    await supabase.from("tipe_surat").delete().eq("buku_kode", kode);
    const { error } = await supabase.from("buku").delete().eq("kode", kode);

    localStore.deleteBuku(kode);
    if (error) {
      return res.json({ message: "Buku berhasil dihapus (Local Fallback)" });
    }

    return res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    localStore.deleteBuku(kode);
    return res.json({ message: "Buku berhasil dihapus" });
  }
});

module.exports = router;
