const express = require("express");
const router = express.Router();
const supabase = require("../supabase");

// GET semua buku (dengan ?include=tipe untuk gabungan relasi yang cepat & efisien)
router.get("/", async (req, res) => {
  const { include } = req.query;

  try {
    if (include === "tipe") {
      // Query paralel buku dan tipe_surat
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

      if (resBuku.error) {
        console.error("[buku] Error fetching buku:", resBuku.error);
        return res.status(500).json({ error: resBuku.error.message });
      }

      const bukuList = resBuku.data || [];
      const tipeList = !resTipe.error && resTipe.data ? resTipe.data : [];

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

    // Default: GET /api/buku (hanya kolom yang diperlukan)
    const { data, error } = await supabase
      .from("buku")
      .select("kode, nama")
      .order("kode", { ascending: true });

    if (error) {
      console.error("[buku] Error fetching buku:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("[buku] Exception:", err);
    return res.status(500).json({ error: err.message });
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
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Buku berhasil ditambahkan", data });
  } catch (err) {
    console.error("[buku] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE buku
router.delete("/:kode", async (req, res) => {
  const { kode } = req.params;

  try {
    // Hapus tipe surat terkait di Supabase
    await supabase.from("tipe_surat").delete().eq("buku_kode", kode);
    const { error } = await supabase.from("buku").delete().eq("kode", kode);

    if (error) {
      console.error("[buku] Supabase delete error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Buku berhasil dihapus" });
  } catch (err) {
    console.error("[buku] Exception:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

