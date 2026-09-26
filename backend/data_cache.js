/**
 * DATA CACHE - Modul cache in-memory untuk seluruh data master
 * 
 * Strategi:
 * 1. Saat server start → muat semua data dari localStore ke memori (instan)
 * 2. Background sync → ambil data dari Supabase & MERGE dengan data lokal agar tidak ada data hilang
 * 3. Semua request GET → dilayani dari cache (< 1ms)
 * 4. Semua request POST/PUT/DELETE → update cache + localStore + kirim ke Supabase
 */

const localStore = require("./local_store");

// ============ IN-MEMORY CACHE ============
const cache = {
  buku: [],
  tipe_surat: [],
  masuk: [],
  surat_keluar: [],
  ready: false,
  lastSync: 0,
};

// ============ INIT: Muat dari localStore (instan, < 1ms) ============
function initCache() {
  cache.buku = localStore.getBuku();
  cache.tipe_surat = localStore.getTipeSurat();
  cache.masuk = localStore.getMasuk();
  cache.surat_keluar = localStore.getSuratKeluar();
  cache.ready = true;
  console.log(
    `✅ Cache dimuat: ${cache.buku.length} buku, ${cache.tipe_surat.length} tipe, ` +
    `${cache.masuk.length} surat masuk, ${cache.surat_keluar.length} surat keluar`
  );
}

// ============ BACKGROUND SYNC: Merge Supabase dengan data lokal ============
async function syncFromSupabase() {
  try {
    const supabase = require("./supabase");

    const [resBuku, resTipe, resMasuk, resKeluar] = await Promise.allSettled([
      supabase.from("buku").select("*").order("kode", { ascending: true }),
      supabase.from("tipe_surat").select("*").order("kode", { ascending: true }),
      supabase.from("masuk").select("*").order("id", { ascending: false }),
      supabase.from("surat_keluar").select("*").order("tanggal", { ascending: false }),
    ]);

    let updated = false;

    // 1. MERGE BUKU
    if (resBuku.status === "fulfilled" && !resBuku.value.error && resBuku.value.data) {
      const sbBuku = resBuku.value.data;
      const localBuku = localStore.getBuku();
      const mapBuku = new Map();

      for (const b of sbBuku) mapBuku.set(b.kode, b);
      for (const b of localBuku) {
        if (!mapBuku.has(b.kode)) mapBuku.set(b.kode, b);
      }
      for (const b of cache.buku) {
        if (!mapBuku.has(b.kode)) mapBuku.set(b.kode, b);
      }

      cache.buku = Array.from(mapBuku.values()).sort((a, b) => a.kode.localeCompare(b.kode));
      updated = true;
    }

    // 2. MERGE TIPE SURAT
    if (resTipe.status === "fulfilled" && !resTipe.value.error && resTipe.value.data) {
      const sbTipe = resTipe.value.data;
      const localTipe = localStore.getTipeSurat();
      const mapTipe = new Map();
      const makeKey = (t) => `${String(t.buku_kode).trim().toUpperCase()}:${String(t.kode).trim()}`;

      for (const t of sbTipe) mapTipe.set(makeKey(t), t);
      for (const t of localTipe) {
        if (!mapTipe.has(makeKey(t))) mapTipe.set(makeKey(t), t);
      }
      for (const t of cache.tipe_surat) {
        if (!mapTipe.has(makeKey(t))) mapTipe.set(makeKey(t), t);
      }

      cache.tipe_surat = Array.from(mapTipe.values()).sort((a, b) => a.kode.localeCompare(b.kode));
      updated = true;
    }

    // 3. MERGE SURAT MASUK
    if (resMasuk.status === "fulfilled" && !resMasuk.value.error && resMasuk.value.data) {
      const sbMasuk = resMasuk.value.data;
      const localMasuk = localStore.getMasuk();
      const mapMasuk = new Map();

      for (const m of sbMasuk) mapMasuk.set(String(m.id), m);
      for (const m of localMasuk) {
        if (!mapMasuk.has(String(m.id))) mapMasuk.set(String(m.id), m);
      }
      for (const m of cache.masuk) {
        if (!mapMasuk.has(String(m.id))) mapMasuk.set(String(m.id), m);
      }

      cache.masuk = Array.from(mapMasuk.values());
      updated = true;
    }

    // 4. MERGE SURAT KELUAR
    if (resKeluar.status === "fulfilled" && !resKeluar.value.error && resKeluar.value.data) {
      const sbKeluar = resKeluar.value.data;
      const localKeluar = localStore.getSuratKeluar();
      const mapKeluar = new Map();

      for (const k of sbKeluar) mapKeluar.set(String(k.id), k);
      for (const k of localKeluar) {
        if (!mapKeluar.has(String(k.id))) mapKeluar.set(String(k.id), k);
      }
      for (const k of cache.surat_keluar) {
        if (!mapKeluar.has(String(k.id))) mapKeluar.set(String(k.id), k);
      }

      cache.surat_keluar = Array.from(mapKeluar.values());
      updated = true;
    }

    cache.lastSync = Date.now();
    if (updated) {
      console.log(`🔄 Cache diperbarui: ${cache.buku.length} buku, ${cache.tipe_surat.length} tipe`);
    }
  } catch (e) {
    console.error("⚠️ Error saat syncFromSupabase:", e.message);
  }
}

// ============ GETTERS (Instan, < 0.1ms) ============
function getBuku() {
  return cache.buku;
}

function getBukuWithTipe() {
  const map = {};
  for (const t of cache.tipe_surat) {
    const key = String(t.buku_kode || "").trim().toUpperCase();
    if (!map[key]) map[key] = [];
    map[key].push({ kode: t.kode, nama: t.nama });
  }
  return cache.buku.map((b) => {
    const bKey = String(b.kode || "").trim().toUpperCase();
    return {
      kode: b.kode,
      nama: b.nama,
      tipeSurat: map[bKey] || [],
    };
  });
}

function getTipeSurat(buku_kode) {
  if (buku_kode) {
    const clean = String(buku_kode).trim().toUpperCase();
    return cache.tipe_surat.filter(
      (t) => String(t.buku_kode || "").trim().toUpperCase() === clean
    );
  }
  return cache.tipe_surat;
}

function getMasuk() {
  return cache.masuk;
}

function getSuratKeluar() {
  return cache.surat_keluar;
}

function getSuratKeluarById(id) {
  return cache.surat_keluar.find((s) => String(s.id) === String(id)) || null;
}

// ============ MUTATORS ============

// BUKU
async function addBuku(newBuku) {
  const exists = cache.buku.find((b) => b.kode === newBuku.kode);
  if (!exists) {
    cache.buku.push(newBuku);
    cache.buku.sort((a, b) => a.kode.localeCompare(b.kode));
  }
  localStore.addBuku(newBuku);

  try {
    const supabase = require("./supabase");
    const { error } = await supabase.from("buku").upsert([newBuku]);
    if (error) {
      console.error("⚠️ Error upserting buku to Supabase:", error.message || error);
    } else {
      console.log("✅ Buku berhasil disimpan ke Supabase:", newBuku.kode);
    }
  } catch (e) {
    console.error("⚠️ Exception upserting buku:", e.message);
  }
  return newBuku;
}

async function deleteBuku(kode) {
  cache.buku = cache.buku.filter((b) => b.kode !== kode);
  cache.tipe_surat = cache.tipe_surat.filter(
    (t) => String(t.buku_kode).trim().toUpperCase() !== String(kode).trim().toUpperCase()
  );
  localStore.deleteBuku(kode);

  try {
    const supabase = require("./supabase");
    await supabase.from("tipe_surat").delete().eq("buku_kode", kode);
    await supabase.from("buku").delete().eq("kode", kode);
  } catch (e) {}
  return true;
}

// TIPE SURAT
async function addTipeSurat(newTipe) {
  const cleanBukuKode = String(newTipe.buku_kode).trim().toUpperCase();
  const cleanKode = String(newTipe.kode).trim();
  const formattedTipe = {
    buku_kode: cleanBukuKode,
    kode: cleanKode,
    nama: newTipe.nama.trim(),
  };

  const exists = cache.tipe_surat.find(
    (t) =>
      String(t.buku_kode).trim().toUpperCase() === cleanBukuKode &&
      String(t.kode).trim() === cleanKode
  );

  if (!exists) {
    cache.tipe_surat.push(formattedTipe);
    cache.tipe_surat.sort((a, b) => a.kode.localeCompare(b.kode));
  }
  localStore.addTipeSurat(formattedTipe);

  try {
    const supabase = require("./supabase");
    const { error } = await supabase.from("tipe_surat").upsert([formattedTipe]);
    if (error) {
      console.error("⚠️ Error upserting tipe_surat to Supabase:", error.message || error);
    } else {
      console.log("✅ Tipe surat berhasil disimpan ke Supabase:", cleanBukuKode, cleanKode);
    }
  } catch (e) {
    console.error("⚠️ Exception upserting tipe_surat:", e.message);
  }
  return formattedTipe;
}

async function deleteTipeSurat(buku_kode, kode) {
  const cleanBukuKode = String(buku_kode).trim().toUpperCase();
  const cleanKode = String(kode).trim();

  cache.tipe_surat = cache.tipe_surat.filter(
    (t) =>
      !(
        String(t.buku_kode).trim().toUpperCase() === cleanBukuKode &&
        String(t.kode).trim() === cleanKode
      )
  );
  localStore.deleteTipeSurat(buku_kode, kode);

  try {
    const supabase = require("./supabase");
    await supabase
      .from("tipe_surat")
      .delete()
      .eq("buku_kode", buku_kode)
      .eq("kode", kode);
  } catch (e) {}
  return true;
}

// SURAT MASUK
async function addMasuk(item) {
  const saved = localStore.addMasuk(item);
  cache.masuk.unshift(saved);

  try {
    const supabase = require("./supabase");
    const { error } = await supabase.from("masuk").insert([{ ...item, id: saved.id }]);
    if (error) console.error("⚠️ Error insert masuk to Supabase:", error.message || error);
  } catch (e) {}
  return saved;
}

async function updateMasuk(id, updates) {
  const idx = cache.masuk.findIndex((m) => String(m.id) === String(id));
  if (idx !== -1) {
    cache.masuk[idx] = { ...cache.masuk[idx], ...updates };
  }
  localStore.updateMasuk(id, updates);

  try {
    const supabase = require("./supabase");
    await supabase.from("masuk").update(updates).eq("id", id);
  } catch (e) {}
  return idx !== -1 ? cache.masuk[idx] : null;
}

async function deleteMasuk(id) {
  cache.masuk = cache.masuk.filter((m) => String(m.id) !== String(id));
  localStore.deleteMasuk(id);

  try {
    const supabase = require("./supabase");
    await supabase.from("masuk").delete().eq("id", id);
  } catch (e) {}
  return true;
}

// SURAT KELUAR
async function addSuratKeluar(item) {
  const saved = localStore.addSuratKeluar(item);
  cache.surat_keluar.unshift(saved);

  try {
    const supabase = require("./supabase");
    const { error } = await supabase.from("surat_keluar").insert([item]);
    if (error) console.error("⚠️ Error insert surat_keluar to Supabase:", error.message || error);
  } catch (e) {}
  return saved;
}

async function updateSuratKeluar(id, updates) {
  const idx = cache.surat_keluar.findIndex((s) => String(s.id) === String(id));
  if (idx !== -1) {
    cache.surat_keluar[idx] = { ...cache.surat_keluar[idx], ...updates };
  }
  localStore.updateSuratKeluar(id, updates);

  try {
    const supabase = require("./supabase");
    await supabase.from("surat_keluar").update(updates).eq("id", id);
  } catch (e) {}
  return idx !== -1 ? cache.surat_keluar[idx] : null;
}

async function deleteSuratKeluar(id) {
  cache.surat_keluar = cache.surat_keluar.filter((s) => String(s.id) !== String(id));
  localStore.deleteSuratKeluar(id);

  try {
    const supabase = require("./supabase");
    await supabase.from("surat_keluar").delete().eq("id", id);
  } catch (e) {}
  return true;
}

// ============ EXPORT ============
module.exports = {
  initCache,
  syncFromSupabase,
  // Getters
  getBuku,
  getBukuWithTipe,
  getTipeSurat,
  getMasuk,
  getSuratKeluar,
  getSuratKeluarById,
  // Mutators
  addBuku,
  deleteBuku,
  addTipeSurat,
  deleteTipeSurat,
  addMasuk,
  updateMasuk,
  deleteMasuk,
  addSuratKeluar,
  updateSuratKeluar,
  deleteSuratKeluar,
};
