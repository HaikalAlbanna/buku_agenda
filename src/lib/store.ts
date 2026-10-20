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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function buildNomorSurat(bukuKode: string, tipeKode: string, nomorUrut: string): string {
  return `W.6.PAS.26.${bukuKode}.${tipeKode}-${nomorUrut}`;
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

