// Types
export interface TipeSurat {
  kode: string; // e.g. "01.01"
  nama: string; // e.g. "Kebijakan Pengawasan"
}

export interface Buku {
  kode: string;
  nama: string;
  tipeSurat: TipeSurat[];
}

export interface SuratKeluar {
  id: string;
  bukuKode: string;
  tipeKode: string;
  nomorUrut: string;
  nomorSurat: string;
  tanggal: string;
  alamatDituju: string;
  perihal: string;
  pdfFileName?: string;
  pdfData?: string;
  createdAt: string;
}

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  tanggal: string;
  suratDari: string;
  perihal: string;
  pdfFileName?: string;
  pdfData?: string;
  createdAt: string;
}

const DEFAULT_BUKU: Buku[] = [
  { kode: "PR", nama: "Perencanaan", tipeSurat: [
    { kode: "01.01", nama: "Kebijakan Perencanaan" },
    { kode: "01.02", nama: "Program dan Anggaran" },
  ]},
  { kode: "KU", nama: "Keuangan", tipeSurat: [
    { kode: "02.01", nama: "Kebijakan Keuangan" },
    { kode: "02.02", nama: "Perbendaharaan" },
  ]},
  { kode: "OT", nama: "Organisasi dan Tata Laksana", tipeSurat: [
    { kode: "03.01", nama: "Kelembagaan" },
    { kode: "03.02", nama: "Ketatalaksanaan" },
  ]},
  { kode: "SA", nama: "Sumber Daya Manusia Aparatur", tipeSurat: [
    { kode: "04.01", nama: "Formasi dan Pengadaan" },
    { kode: "04.02", nama: "Mutasi dan Promosi" },
  ]},
  { kode: "PB", nama: "Pengelolaan Barang Milik Negara", tipeSurat: [
    { kode: "05.01", nama: "Perencanaan Kebutuhan" },
    { kode: "05.02", nama: "Pengadaan BMN" },
  ]},
  { kode: "UM", nama: "Umum", tipeSurat: [
    { kode: "06.01", nama: "Tata Usaha" },
    { kode: "06.02", nama: "Rumah Tangga" },
  ]},
  { kode: "PW", nama: "Pengawasan", tipeSurat: [
    { kode: "07.01", nama: "Kebijakan Pengawasan" },
    { kode: "07.02", nama: "Audit Internal" },
  ]},
  { kode: "PK", nama: "Pemasyarakatan", tipeSurat: [
    { kode: "08.01", nama: "Pembinaan Narapidana" },
    { kode: "08.02", nama: "Keamanan dan Ketertiban" },
  ]},
];

const KEYS = {
  BUKU: "surat_buku",
  SURAT_KELUAR: "surat_keluar",
  SURAT_MASUK: "surat_masuk",
  BACKUP: "surat_backup",
};

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Buku
export function getBuku(): Buku[] {
  return get<Buku[]>(KEYS.BUKU, DEFAULT_BUKU);
}

export function saveBuku(buku: Buku[]) {
  set(KEYS.BUKU, buku);
}

export function addBuku(kode: string, nama: string): Buku[] {
  const list = getBuku();
  list.push({ kode: kode.toUpperCase(), nama, tipeSurat: [] });
  saveBuku(list);
  return list;
}

export function deleteBuku(kode: string): Buku[] {
  const list = getBuku().filter(b => b.kode !== kode);
  saveBuku(list);
  return list;
}

export function addTipeSurat(bukuKode: string, tipe: TipeSurat): Buku[] {
  const list = getBuku();
  const buku = list.find(b => b.kode === bukuKode);
  if (buku) {
    buku.tipeSurat.push(tipe);
    saveBuku(list);
  }
  return list;
}

export function deleteTipeSurat(bukuKode: string, tipeKode: string): Buku[] {
  const list = getBuku();
  const buku = list.find(b => b.kode === bukuKode);
  if (buku) {
    buku.tipeSurat = buku.tipeSurat.filter(t => t.kode !== tipeKode);
    saveBuku(list);
  }
  return list;
}

// Surat Keluar
export function getSuratKeluar(): SuratKeluar[] {
  return get<SuratKeluar[]>(KEYS.SURAT_KELUAR, []);
}

export function saveSuratKeluar(data: SuratKeluar[]) {
  set(KEYS.SURAT_KELUAR, data);
}

export function buildNomorSurat(bukuKode: string, tipeKode: string, nomorUrut: string): string {
  return `W.6.PAS.26.${bukuKode}.${tipeKode}-${nomorUrut}`;
}

export function addSuratKeluar(data: Omit<SuratKeluar, "id" | "nomorSurat" | "createdAt">): SuratKeluar[] {
  const list = getSuratKeluar();
  const nomorSurat = buildNomorSurat(data.bukuKode, data.tipeKode, data.nomorUrut);
  list.push({ ...data, id: generateId(), nomorSurat, createdAt: new Date().toISOString() });
  saveSuratKeluar(list);
  return list;
}

export function updateSuratKeluar(id: string, data: Partial<SuratKeluar>): SuratKeluar[] {
  const list = getSuratKeluar().map(s => {
    if (s.id === id) {
      const updated = { ...s, ...data };
      if (data.bukuKode || data.tipeKode || data.nomorUrut) {
        updated.nomorSurat = buildNomorSurat(
          data.bukuKode || s.bukuKode,
          data.tipeKode || s.tipeKode,
          data.nomorUrut || s.nomorUrut
        );
      }
      return updated;
    }
    return s;
  });
  saveSuratKeluar(list);
  return list;
}

export function deleteSuratKeluar(id: string): SuratKeluar[] {
  const list = getSuratKeluar().filter(s => s.id !== id);
  saveSuratKeluar(list);
  return list;
}

// Surat Masuk
export function getSuratMasuk(): SuratMasuk[] {
  return get<SuratMasuk[]>(KEYS.SURAT_MASUK, []);
}

export function saveSuratMasuk(data: SuratMasuk[]) {
  set(KEYS.SURAT_MASUK, data);
}

export function addSuratMasuk(data: Omit<SuratMasuk, "id" | "createdAt">): SuratMasuk[] {
  const list = getSuratMasuk();
  list.push({ ...data, id: generateId(), createdAt: new Date().toISOString() });
  saveSuratMasuk(list);
  return list;
}

export function updateSuratMasuk(id: string, data: Partial<SuratMasuk>): SuratMasuk[] {
  const list = getSuratMasuk().map(s => s.id === id ? { ...s, ...data } : s);
  saveSuratMasuk(list);
  return list;
}

export function deleteSuratMasukItem(id: string): SuratMasuk[] {
  const list = getSuratMasuk().filter(s => s.id !== id);
  saveSuratMasuk(list);
  return list;
}

// Export helpers
export function exportAllAsJSON() {
  return {
    buku: getBuku(),
    suratKeluar: getSuratKeluar(),
    suratMasuk: getSuratMasuk(),
    exportedAt: new Date().toISOString(),
  };
}

export function importFromJSON(data: { buku?: Buku[]; suratKeluar?: SuratKeluar[]; suratMasuk?: SuratMasuk[] }) {
  if (data.buku) saveBuku(data.buku);
  if (data.suratKeluar) saveSuratKeluar(data.suratKeluar);
  if (data.suratMasuk) saveSuratMasuk(data.suratMasuk);
}

export function getNextNomorUrut(bukuKode: string): string {
  const list = getSuratKeluar().filter(s => s.bukuKode === bukuKode);
  if (list.length === 0) return "0001";
  const maxNum = Math.max(...list.map(s => parseInt(s.nomorUrut, 10) || 0));
  return String(maxNum + 1).padStart(4, "0");
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
