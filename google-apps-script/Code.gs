// ============================================================
// Code.gs — Backend Google Apps Script untuk Sistem Penomoran Surat
// ============================================================

const SPREADSHEET_ID = "ISI_SPREADSHEET_ID_ANDA";
const BASE_FORMAT    = "WP.6.PAS.26";
const ALLOWED_DOMAIN = "domainkantor.go.id"; // ganti dengan domain email kantor

// Folder ID Google Drive per buku (isi dengan folder ID yang benar)
const FOLDER_MAP = {
  PR: "FOLDER_ID_PR",
  KU: "FOLDER_ID_KU",
  OT: "FOLDER_ID_OT",
  SA: "FOLDER_ID_SA",
  PB: "FOLDER_ID_PB",
  UM: "FOLDER_ID_UM",
  PW: "FOLDER_ID_PW",
  PK: "FOLDER_ID_PK",
};

// Sheet khusus untuk konfigurasi buku & tipe
const CONFIG_SHEET = "CONFIG";

// ====== AUTH ======

function doGet() {
  const email = Session.getActiveUser().getEmail();
  if (!email || !email.endsWith("@" + ALLOWED_DOMAIN)) {
    return HtmlService.createHtmlOutput(
      "<h2 style='font-family:sans-serif;text-align:center;margin-top:100px;'>⛔ Akses Ditolak</h2>" +
      "<p style='font-family:sans-serif;text-align:center;'>Anda tidak memiliki izin untuk mengakses aplikasi ini.</p>"
    );
  }
  return HtmlService.createHtmlOutputFromFile("index")
    .setTitle("Sistem Penomoran Surat")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getCurrentUser() {
  const email = Session.getActiveUser().getEmail();
  if (!email || !email.endsWith("@" + ALLOWED_DOMAIN)) {
    throw new Error("Unauthorized");
  }
  return { email: email, name: email.split("@")[0] };
}

// ====== HELPER ======

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureConfigSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG_SHEET);
    sheet.appendRow(["bukuKode", "bukuNama", "tipeKode", "tipeNama"]);
    // Seed default data
    const defaults = [
      ["PR", "Perencanaan", "01.01", "Kebijakan Perencanaan"],
      ["PR", "Perencanaan", "01.02", "Program dan Anggaran"],
      ["KU", "Keuangan", "02.01", "Kebijakan Keuangan"],
      ["KU", "Keuangan", "02.02", "Perbendaharaan"],
      ["OT", "Organisasi dan Tata Laksana", "03.01", "Kelembagaan"],
      ["OT", "Organisasi dan Tata Laksana", "03.02", "Ketatalaksanaan"],
      ["SA", "Sumber Daya Manusia Aparatur", "04.01", "Formasi dan Pengadaan"],
      ["SA", "Sumber Daya Manusia Aparatur", "04.02", "Mutasi dan Promosi"],
      ["PB", "Pengelolaan Barang Milik Negara", "05.01", "Perencanaan Kebutuhan"],
      ["PB", "Pengelolaan Barang Milik Negara", "05.02", "Pengadaan BMN"],
      ["UM", "Umum", "06.01", "Tata Usaha"],
      ["UM", "Umum", "06.02", "Rumah Tangga"],
      ["PW", "Pengawasan", "07.01", "Kebijakan Pengawasan"],
      ["PW", "Pengawasan", "07.02", "Audit Internal"],
      ["PK", "Pemasyarakatan", "08.01", "Pembinaan Narapidana"],
      ["PK", "Pemasyarakatan", "08.02", "Keamanan dan Ketertiban"],
    ];
    defaults.forEach(row => sheet.appendRow(row));
  }
  return sheet;
}

// ====== BUKU & TIPE MANAGEMENT ======

function getBukuList() {
  const sheet = ensureConfigSheet();
  const data = sheet.getDataRange().getValues();
  const bukuMap = {};

  for (let i = 1; i < data.length; i++) {
    const [bukuKode, bukuNama, tipeKode, tipeNama] = data[i];
    if (!bukuKode) continue;
    if (!bukuMap[bukuKode]) {
      bukuMap[bukuKode] = { kode: bukuKode, nama: bukuNama, tipeSurat: [] };
    }
    if (tipeKode) {
      bukuMap[bukuKode].tipeSurat.push({ kode: tipeKode, nama: tipeNama });
    }
  }
  return Object.values(bukuMap);
}

function addBuku(kode, nama) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureConfigSheet();
    // Check if already exists
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === kode.toUpperCase()) {
        throw new Error("Kode buku sudah ada");
      }
    }
    // Add a placeholder row (no tipe yet)
    sheet.appendRow([kode.toUpperCase(), nama, "", ""]);

    // Create sheet for this buku if not exists
    const ss = getSpreadsheet();
    if (!ss.getSheetByName(kode.toUpperCase())) {
      const newSheet = ss.insertSheet(kode.toUpperCase());
      newSheet.appendRow(["No", "Nomor Surat", "Tanggal Surat", "Perihal", "Tujuan", "Tipe", "Email Pembuat", "Timestamp"]);
    }

    return getBukuList();
  } finally {
    lock.releaseLock();
  }
}

function deleteBuku(kode) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureConfigSheet();
    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === kode) {
        rowsToDelete.push(i + 1);
      }
    }
    rowsToDelete.forEach(row => sheet.deleteRow(row));
    return getBukuList();
  } finally {
    lock.releaseLock();
  }
}

function addTipeSurat(bukuKode, tipeKode, tipeNama) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureConfigSheet();
    const data = sheet.getDataRange().getValues();
    // Find buku nama
    let bukuNama = "";
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bukuKode) {
        bukuNama = data[i][1];
        break;
      }
    }
    if (!bukuNama) throw new Error("Buku tidak ditemukan");

    // Check if there's a placeholder row (empty tipe)
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === bukuKode && !data[i][2]) {
        // Replace placeholder
        sheet.getRange(i + 1, 3).setValue(tipeKode);
        sheet.getRange(i + 1, 4).setValue(tipeNama);
        return getBukuList();
      }
    }

    sheet.appendRow([bukuKode, bukuNama, tipeKode, tipeNama]);
    return getBukuList();
  } finally {
    lock.releaseLock();
  }
}

function deleteTipeSurat(bukuKode, tipeKode) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureConfigSheet();
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][0] === bukuKode && data[i][2] === tipeKode) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return getBukuList();
  } finally {
    lock.releaseLock();
  }
}

// ====== SURAT KELUAR ======

function getSuratKeluar(bukuKode) {
  const ss = getSpreadsheet();
  const sheets = bukuKode ? [ss.getSheetByName(bukuKode)] : getBukuList().map(b => ss.getSheetByName(b.kode));

  const result = [];
  sheets.forEach(sheet => {
    if (!sheet) return;
    const sheetName = sheet.getName();
    if (sheetName === CONFIG_SHEET || sheetName === "SURAT_MASUK") return;
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;
    const data = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
    data.forEach((row, idx) => {
      result.push({
        id: sheetName + "_" + (idx + 2),
        sheetName: sheetName,
        rowIndex: idx + 2,
        no: row[0],
        nomorSurat: row[1],
        tanggal: row[2],
        perihal: row[3],
        tujuan: row[4],
        tipe: row[5],
        email: row[6],
        timestamp: row[7],
        bukuKode: sheetName,
      });
    });
  });
  return result;
}

function createSurat(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const email = Session.getActiveUser().getEmail();
    if (!email || !email.endsWith("@" + ALLOWED_DOMAIN)) {
      throw new Error("Unauthorized access");
    }

    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(data.buku);
    if (!sheet) throw new Error("Sheet untuk buku '" + data.buku + "' tidak ditemukan");

    const lastRow = sheet.getLastRow();
    let nextNumber = 1;

    if (lastRow > 1) {
      const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(v => v);
      if (values.length > 0) {
        nextNumber = Math.max(...values.map(Number)) + 1;
      }
    }

    // User bisa override nomor urut
    const nomorUrut = data.nomorUrut
      ? String(data.nomorUrut).padStart(4, "0")
      : String(nextNumber).padStart(4, "0");

    const nomorSurat = BASE_FORMAT + "-" + data.buku + "." + data.tipe + "-" + nomorUrut;
    const noUrut = data.nomorUrut ? parseInt(data.nomorUrut) : nextNumber;

    sheet.appendRow([
      noUrut,
      nomorSurat,
      data.tanggal,
      data.perihal,
      data.tujuan,
      data.tipe,
      email,
      new Date()
    ]);

    // Upload PDF ke Drive jika ada folder
    if (data.pdfBase64 && FOLDER_MAP[data.buku] && FOLDER_MAP[data.buku] !== "FOLDER_ID_" + data.buku) {
      try {
        const pdfBlob = Utilities.newBlob(
          Utilities.base64Decode(data.pdfBase64.split(",")[1] || data.pdfBase64),
          "application/pdf",
          nomorSurat + ".pdf"
        );
        const folder = DriveApp.getFolderById(FOLDER_MAP[data.buku]);
        folder.createFile(pdfBlob);
      } catch (e) {
        Logger.log("PDF upload error: " + e.message);
      }
    }

    return { success: true, nomorSurat: nomorSurat };
  } finally {
    lock.releaseLock();
  }
}

function updateSuratKeluar(sheetName, rowIndex, data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet tidak ditemukan");

    if (data.tanggal) sheet.getRange(rowIndex, 3).setValue(data.tanggal);
    if (data.perihal) sheet.getRange(rowIndex, 4).setValue(data.perihal);
    if (data.tujuan !== undefined) sheet.getRange(rowIndex, 5).setValue(data.tujuan);
    if (data.tipe) sheet.getRange(rowIndex, 6).setValue(data.tipe);

    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteSuratKeluarRow(sheetName, rowIndex) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = getSpreadsheet();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet tidak ditemukan");
    sheet.deleteRow(rowIndex);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ====== SURAT MASUK ======

function ensureSuratMasukSheet() {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName("SURAT_MASUK");
  if (!sheet) {
    sheet = ss.insertSheet("SURAT_MASUK");
    sheet.appendRow(["No", "Nomor Surat", "Tanggal", "Surat Dari", "Perihal", "Email Pembuat", "Timestamp"]);
  }
  return sheet;
}

function getSuratMasukList() {
  const sheet = ensureSuratMasukSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
  return data.map((row, idx) => ({
    id: "SM_" + (idx + 2),
    rowIndex: idx + 2,
    no: row[0],
    nomorSurat: row[1],
    tanggal: row[2],
    suratDari: row[3],
    perihal: row[4],
    email: row[5],
    timestamp: row[6],
  }));
}

function addSuratMasukEntry(data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const email = Session.getActiveUser().getEmail();
    if (!email || !email.endsWith("@" + ALLOWED_DOMAIN)) throw new Error("Unauthorized");

    const sheet = ensureSuratMasukSheet();
    const lastRow = sheet.getLastRow();
    let nextNo = 1;
    if (lastRow > 1) {
      const vals = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(v => v);
      if (vals.length > 0) nextNo = Math.max(...vals.map(Number)) + 1;
    }

    sheet.appendRow([nextNo, data.nomorSurat, data.tanggal, data.suratDari, data.perihal, email, new Date()]);

    if (data.pdfBase64) {
      try {
        const pdfBlob = Utilities.newBlob(
          Utilities.base64Decode(data.pdfBase64.split(",")[1] || data.pdfBase64),
          "application/pdf",
          data.nomorSurat.replace(/[^a-zA-Z0-9.-]/g, "_") + ".pdf"
        );
        // Simpan di folder SURAT_MASUK jika ada
        // Bisa dibuat folder khusus surat masuk
      } catch (e) {
        Logger.log("PDF upload error: " + e.message);
      }
    }

    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function updateSuratMasukEntry(rowIndex, data) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureSuratMasukSheet();
    if (data.nomorSurat) sheet.getRange(rowIndex, 2).setValue(data.nomorSurat);
    if (data.tanggal) sheet.getRange(rowIndex, 3).setValue(data.tanggal);
    if (data.suratDari) sheet.getRange(rowIndex, 4).setValue(data.suratDari);
    if (data.perihal) sheet.getRange(rowIndex, 5).setValue(data.perihal);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function deleteSuratMasukEntry(rowIndex) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = ensureSuratMasukSheet();
    sheet.deleteRow(rowIndex);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ====== EXPORT ======

function getExportData(year) {
  const buku = getBukuList();
  const keluar = getSuratKeluar();
  const masuk = getSuratMasukList();

  if (year) {
    const y = String(year);
    return {
      buku: buku,
      suratKeluar: keluar.filter(s => String(s.tanggal).startsWith(y)),
      suratMasuk: masuk.filter(s => String(s.tanggal).startsWith(y)),
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    buku: buku,
    suratKeluar: keluar,
    suratMasuk: masuk,
    exportedAt: new Date().toISOString(),
  };
}

function getNextNomorUrut(bukuKode) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(bukuKode);
  if (!sheet) return "0001";
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return "0001";
  const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat().filter(v => v);
  if (values.length === 0) return "0001";
  return String(Math.max(...values.map(Number)) + 1).padStart(4, "0");
}
