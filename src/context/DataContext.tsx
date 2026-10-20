import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_BASE, authFetch, getToken } from "@/lib/api";
import { useAuth } from "./AuthContext";

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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, token } = useAuth();

  // Bersihkan cache usang lama dari localStorage agar tidak mengganggu data riil dari database
  useEffect(() => {
    try {
      localStorage.removeItem("cache_buku_v1");
      localStorage.removeItem("cache_surat_keluar_v1");
      localStorage.removeItem("cache_surat_masuk_v1");
    } catch {
      // Abaikan jika storage tidak dapat diakses
    }
  }, []);

  // 1. Initial State murni kosong, menunggu pemuatan dari database
  const [buku, setBuku] = useState<Buku[]>([]);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluarType[]>([]);
  const [suratMasuk, setSuratMasuk] = useState<SuratMasukType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 2. Fungsi Refresh Data murni dari database Supabase
  const refreshBuku = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await authFetch(`${API_BASE}/buku?include=tipe`);
      if (res.ok) {
        const data = await res.json();
        setBuku(data || []);
      }
    } catch (e) {
      console.error("Gagal refresh buku dari Supabase", e);
    }
  }, []);

  const refreshSuratKeluar = useCallback(async () => {
    if (!getToken()) return;
    try {
      const res = await authFetch(`${API_BASE}/surat_keluar`);
      if (res.ok) {
        const json = await res.json();
        setSuratKeluar(json || []);
      }
    } catch (e) {
      console.error("Gagal refresh surat keluar dari Supabase", e);
    }
  }, []);

  const refreshSuratMasuk = useCallback(async () => {
    if (!getToken()) return;
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
      }
    } catch (e) {
      console.error("Gagal refresh surat masuk dari Supabase", e);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.allSettled([refreshBuku(), refreshSuratKeluar(), refreshSuratMasuk()]);
    setLoading(false);
  }, [refreshBuku, refreshSuratKeluar, refreshSuratMasuk]);

  // 3. Pre-fetch otomatis saat Provider di-mount jika token tersedia
  useEffect(() => {
    if (isAuthenticated || token || getToken()) {
      refreshAll();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token, refreshAll]);

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
