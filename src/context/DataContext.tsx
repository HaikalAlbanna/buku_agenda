import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE, authFetch } from "@/lib/api";
import axios from "axios";

export interface TipeSurat {
  kode: string;
  nama: string;
}

export interface Buku {
  kode: string;
  nama: string;
  tipeSurat: TipeSurat[];
}

export interface SuratKeluarType {
  id: string;
  buku_kode: string;
  tipe_kode: string;
  nomor_urut: string;
  nomor_surat: string;
  tanggal: string;
  alamat_dituju: string;
  perihal: string;
  pdf_file_name: string | null;
  pdf_data: string | null;
}

export interface SuratMasukType {
  id: number;
  nomorSurat: string;
  tanggal: string;
  suratDari: string;
  perihal: string;
  pdfFileName: string | null;
  pdfData: string | null;
}

interface DataContextType {
  buku: Buku[];
  suratKeluar: SuratKeluarType[];
  suratMasuk: SuratMasukType[];
  loading: boolean;
  refreshBuku: () => Promise<void>;
  refreshSuratKeluar: () => Promise<void>;
  refreshSuratMasuk: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const CACHE_KEYS = {
  BUKU: "cache_buku_v1",
  SURAT_KELUAR: "cache_surat_keluar_v1",
  SURAT_MASUK: "cache_surat_masuk_v1",
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State dari localStorage (Tampilan Instan 0ms!)
  const [buku, setBuku] = useState<Buku[]>(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEYS.BUKU);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [suratKeluar, setSuratKeluar] = useState<SuratKeluarType[]>(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEYS.SURAT_KELUAR);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [suratMasuk, setSuratMasuk] = useState<SuratMasukType[]>(() => {
    try {
      const stored = localStorage.getItem(CACHE_KEYS.SURAT_MASUK);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // 2. Fungsi Refresh Data (Background Revalidation dengan Supabase)
  const refreshBuku = useCallback(async () => {
    try {
      const res = await axios.get<Buku[]>(`${API_BASE}/buku?include=tipe`);
      if (res.data) {
        setBuku(res.data);
        localStorage.setItem(CACHE_KEYS.BUKU, JSON.stringify(res.data));
      }
    } catch (e) {
      console.error("Gagal refresh buku dari Supabase", e);
    }
  }, []);

  const refreshSuratKeluar = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/surat_keluar`);
      if (res.ok) {
        const json = await res.json();
        setSuratKeluar(json || []);
        localStorage.setItem(CACHE_KEYS.SURAT_KELUAR, JSON.stringify(json || []));
      }
    } catch (e) {
      console.error("Gagal refresh surat keluar dari Supabase", e);
    }
  }, []);

  const refreshSuratMasuk = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/masuk`);
      if (res.ok) {
        const raw = await res.json();
        const formatted: SuratMasukType[] = (raw || []).map((item: any) => ({
          id: item.id,
          nomorSurat: item.nomor_surat || item.nomorSurat || "",
          tanggal: item.tanggal || "",
          suratDari: item.surat_dari || item.suratDari || "",
          perihal: item.perihal || "",
          pdfFileName: item.arsip_pdf ? `Arsip_SM_${item.id}.pdf` : null,
          pdfData: item.arsip_pdf || null,
        }));
        setSuratMasuk(formatted);
        localStorage.setItem(CACHE_KEYS.SURAT_MASUK, JSON.stringify(formatted));
      }
    } catch (e) {
      console.error("Gagal refresh surat masuk dari Supabase", e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([refreshBuku(), refreshSuratKeluar(), refreshSuratMasuk()]);
    setLoading(false);
  }, [refreshBuku, refreshSuratKeluar, refreshSuratMasuk]);

  // 3. Pre-fetch otomatis saat Provider di-mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <DataContext.Provider
      value={{
        buku,
        suratKeluar,
        suratMasuk,
        loading,
        refreshBuku,
        refreshSuratKeluar,
        refreshSuratMasuk,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
