const express = require("express");
const router = express.Router();
const supabase = require("../supabase");
const localStore = require("../local_store");

// GET tipe surat berdasarkan buku_kode
router.get("/:buku_kode", async (req, res) => {
  const { buku_kode } = req.params;
  const cleanKode = String(buku_kode).trim().toUpperCase();

  try {
    const { data, error } = await supabase
      .from("tipe_surat")
      .select("*")
      .eq("buku_kode", cleanKode)
      .order("kode", { ascending: true });

    if (!error && data && data.length > 0) {
      return res.json(data);
    }

    return res.json(localStore.getTipeSurat(cleanKode));
  } catch (err) {
    return res.json(localStore.getTipeSurat(cleanKode));
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
      const saved = localStore.addTipeSurat(newTipe);
      return res.json({
        message: "Tipe surat berhasil ditambahkan (Local Fallback)",
        data: [saved],
      });
    }

    localStore.addTipeSurat(newTipe);
    return res.json({ message: "Tipe surat berhasil ditambahkan", data });
  } catch (err) {
    const saved = localStore.addTipeSurat(newTipe);
    return res.json({
      message: "Tipe surat berhasil ditambahkan (Local Fallback)",
      data: [saved],
    });
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

    localStore.deleteTipeSurat(buku_kode, kode);
    if (error) {
      return res.json({ message: "Tipe surat berhasil dihapus (Local Fallback)" });
    }

    return res.json({ message: "Tipe surat berhasil dihapus" });
  } catch (err) {
    localStore.deleteTipeSurat(buku_kode, kode);
    return res.json({ message: "Tipe surat berhasil dihapus" });
  }
});

module.exports = router;
