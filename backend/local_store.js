const fs = require("fs");
const path = require("path");

// Simpan data di direktori .data di luar backend agar tidak memicu reload nodemon
const dataDir =
  process.env.VERCEL === "1"
    ? "/tmp"
    : path.resolve(__dirname, "..", ".data");
const dbFilePath = path.join(dataDir, "local_db.json");

const SEED_DATA = {
  buku: [
    { kode: "PR", nama: "Perencanaan" },
    { kode: "KU", nama: "Keuangan" },
    { kode: "OT", nama: "Organisasi dan Tata Laksana" },
    { kode: "SA", nama: "Sumber Daya Manusia Aparatur" },
    { kode: "PB", nama: "Pengelolaan Barang Milik Negara" },
    { kode: "UM", nama: "Umum" },
    { kode: "PW", nama: "Pengawasan" },
    { kode: "PK", nama: "Pemasyarakatan" },
  ],
  tipe_surat: [],
  masuk: [],
  surat_keluar: [],
};

function ensureDbFile() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dbFilePath)) {
      fs.writeFileSync(dbFilePath, JSON.stringify(SEED_DATA, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Gagal inisialisasi file local_db:", e.message);
  }
}

function readDb() {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(SEED_DATA));
  }
}

function writeDb(data) {
  ensureDbFile();
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Gagal menyimpan ke local_db:", e.message);
  }
}

module.exports = {
  // BUKU
  getBuku: () => {
    const db = readDb();
    return db.buku || SEED_DATA.buku;
  },
  addBuku: (item) => {
    const db = readDb();
    if (!db.buku) db.buku = [...SEED_DATA.buku];
    const exists = db.buku.find((b) => b.kode === item.kode);
    if (!exists) {
      db.buku.push(item);
      writeDb(db);
    }
    return item;
  },
  deleteBuku: (kode) => {
    const db = readDb();
    if (db.buku) {
      db.buku = db.buku.filter((b) => b.kode !== kode);
      writeDb(db);
    }
    return true;
  },

  // TIPE SURAT
  getTipeSurat: (buku_kode) => {
    const db = readDb();
    const list = db.tipe_surat || SEED_DATA.tipe_surat;
    if (buku_kode) {
      return list.filter((t) => t.buku_kode === buku_kode);
    }
    return list;
  },
  addTipeSurat: (item) => {
    const db = readDb();
    if (!db.tipe_surat) db.tipe_surat = [...SEED_DATA.tipe_surat];
    const exists = db.tipe_surat.find(
      (t) => t.buku_kode === item.buku_kode && t.kode === item.kode
    );
    if (!exists) {
      db.tipe_surat.push(item);
      writeDb(db);
    }
    return item;
  },
  deleteTipeSurat: (buku_kode, kode) => {
    const db = readDb();
    if (db.tipe_surat) {
      db.tipe_surat = db.tipe_surat.filter(
        (t) => !(t.buku_kode === buku_kode && t.kode === kode)
      );
      writeDb(db);
    }
    return true;
  },

  // SURAT MASUK
  getMasuk: () => {
    const db = readDb();
    return (db.masuk || []).slice().reverse();
  },
  addMasuk: (item) => {
    const db = readDb();
    if (!db.masuk) db.masuk = [];
    const newId = db.masuk.length > 0 ? Math.max(...db.masuk.map((m) => m.id || 0)) + 1 : 1;
    const record = { id: newId, ...item, created_at: new Date().toISOString() };
    db.masuk.push(record);
    writeDb(db);
    return record;
  },
  updateMasuk: (id, updates) => {
    const db = readDb();
    if (!db.masuk) db.masuk = [];
    const idx = db.masuk.findIndex((m) => String(m.id) === String(id));
    if (idx !== -1) {
      db.masuk[idx] = { ...db.masuk[idx], ...updates };
      writeDb(db);
      return db.masuk[idx];
    }
    return null;
  },
  deleteMasuk: (id) => {
    const db = readDb();
    if (db.masuk) {
      db.masuk = db.masuk.filter((m) => String(m.id) !== String(id));
      writeDb(db);
    }
    return true;
  },

  // SURAT KELUAR
  getSuratKeluar: () => {
    const db = readDb();
    return (db.surat_keluar || []).slice().reverse();
  },
  getSuratKeluarById: (id) => {
    const db = readDb();
    return (db.surat_keluar || []).find((s) => String(s.id) === String(id)) || null;
  },
  addSuratKeluar: (item) => {
    const db = readDb();
    if (!db.surat_keluar) db.surat_keluar = [];
    const record = { ...item, created_at: new Date().toISOString() };
    db.surat_keluar.push(record);
    writeDb(db);
    return record;
  },
  updateSuratKeluar: (id, updates) => {
    const db = readDb();
    if (!db.surat_keluar) db.surat_keluar = [];
    const idx = db.surat_keluar.findIndex((s) => String(s.id) === String(id));
    if (idx !== -1) {
      db.surat_keluar[idx] = { ...db.surat_keluar[idx], ...updates };
      writeDb(db);
      return db.surat_keluar[idx];
    }
    return null;
  },
  deleteSuratKeluar: (id) => {
    const db = readDb();
    if (db.surat_keluar) {
      db.surat_keluar = db.surat_keluar.filter((s) => String(s.id) !== String(id));
      writeDb(db);
    }
    return true;
  },
};
