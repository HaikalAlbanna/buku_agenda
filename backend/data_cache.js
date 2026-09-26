/**
 * DATA CACHE - Modul cache in-memory untuk seluruh data master
 * 
 * Strategi:
 * 1. Saat server start → muat semua data dari localStore ke memori (instan)
 * 2. Background sync → coba ambil data dari Supabase, update cache jika berhasil
 * 3. Semua request GET → dilayani dari cache (< 1ms)
 * 4. Semua request POST/PUT/DELETE → update cache + kirim ke Supabase/localStore
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

// ============ BACKGROUND SYNC: Coba update dari Supabase ============
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

    if (resBuku.status === "fulfilled" && !resBuku.value.error && resBuku.value.data?.length > 0) {
      cache.buku = resBuku.value.data;
      updated = true;
    }
    if (resTipe.status === "fulfilled" && !resTipe.value.error && resTipe.value.data) {
      cache.tipe_surat = resTipe.value.data;
      updated = true;
    }
    if (resMasuk.status === "fulfilled" && !resMasuk.value.error && resMasuk.value.data) {
      cache.masuk = resMasuk.value.data;
      updated = true;
    }
    if (resKeluar.status === "fulfilled" && !resKeluar.value.error && resKeluar.value.data) {
      cache.surat_keluar = resKeluar.value.data;
      updated = true;
    }

    cache.lastSync = Date.now();
    if (updated) {
      console.log("🔄 Cache diperbarui dari Supabase");
    }
  } catch (e) {
    // Supabase tidak tersedia — cache tetap menggunakan data localStore
  }
}

// ============ GETTERS (Instan, < 0.1ms) ============
function getBuku() {
  return cache.buku;
}

function getBukuWithTipe() {
  const map = {};
  for (const t of cache.tipe_surat) {
    const key = t.buku_kode;
    if (!map[key]) map[key] = [];
    map[key].push({ kode: t.kode, nama: t.nama });
  }
  return cache.buku.map((b) => ({
    kode: b.kode,
    nama: b.nama,
    tipeSurat: map[b.kode] || [],
  }));
}

function getTipeSurat(buku_kode) {
  if (buku_kode) {
    return cache.tipe_surat.filter((t) => t.buku_kode === buku_kode);
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

// ============ MUTATORS (Update cache + Supabase + localStore) ============

// BUKU
async function addBuku(newBuku) {
  // Update cache langsung
  if (!cache.buku.find((b) => b.kode === newBuku.kode)) {
    cache.buku.push(newBuku);
    cache.buku.sort((a, b) => a.kode.localeCompare(b.kode));
  }
  localStore.addBuku(newBuku);

  // Kirim ke Supabase (non-blocking)
  try {
    const supabase = require("./supabase");
    await supabase.from("buku").upsert([newBuku]);
  } catch (e) {}
  return newBuku;
}

async function deleteBuku(kode) {
  cache.buku = cache.buku.filter((b) => b.kode !== kode);
  localStore.deleteBuku(kode);

  try {
    const supabase = require("./supabase");
    await supabase.from("buku").delete().eq("kode", kode);
  } catch (e) {}
  return true;
}

// TIPE SURAT
async function addTipeSurat(newTipe) {
  const exists = cache.tipe_surat.find(
    (t) => t.buku_kode === newTipe.buku_kode && t.kode === newTipe.kode
  );
  if (!exists) {
    cache.tipe_surat.push(newTipe);
    cache.tipe_surat.sort((a, b) => a.kode.localeCompare(b.kode));
  }
  localStore.addTipeSurat(newTipe);

  try {
    const supabase = require("./supabase");
    await supabase.from("tipe_surat").upsert([newTipe]);
  } catch (e) {}
  return newTipe;
}

async function deleteTipeSurat(buku_kode, kode) {
  cache.tipe_surat = cache.tipe_surat.filter(
    (t) => !(t.buku_kode === buku_kode && t.kode === kode)
  );
  localStore.deleteTipeSurat(buku_kode, kode);

  try {
    const supabase = require("./supabase");
    await supabase.from("tipe_surat").delete().eq("buku_kode", buku_kode).eq("kode", kode);
  } catch (e) {}
  return true;
}

// SURAT MASUK
async function addMasuk(item) {
  const saved = localStore.addMasuk(item);
  cache.masuk.unshift(saved);

  try {
    const supabase = require("./supabase");
    await supabase.from("masuk").insert([{ ...item, id: saved.id }]);
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
    await supabase.from("surat_keluar").insert([item]);
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
