import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailOpen, BookOpen, Send } from "lucide-react";
import { Link } from "react-router-dom";

type Buku = { kode: string; nama: string };

type SuratMasuk = {
  id: number;
  nomor_surat: string;
  tanggal: string;
  surat_dari: string;
  perihal: string;
  arsip_pdf: string;
};

type SuratKeluar = {
  id: number;
  nomor_surat: string;
  tanggal: string;
  alamat_dituju: string;
  perihal: string;
  pdf_file_name: string;
};

type TipeSurat = {
  id: number;
  kode: string;
  nama: string;
};

export default function Dashboard() {
  const [buku, setBuku] = useState<Buku[]>([]);
  const [masuk, setMasuk] = useState<SuratMasuk[]>([]);
  const [keluar, setKeluar] = useState<SuratKeluar[]>([]);
  const [tipePerBuku, setTipePerBuku] = useState<Record<string, TipeSurat[]>>(
    {},
  );

  useEffect(() => {
    // ==============================
    // FETCH BUKU & TIPE (Single Query Super Cepat)
    // ==============================
    axios
      .get(`${API_BASE}/buku?include=tipe`)
      .then((res) => {
        setBuku(res.data || []);
        const map: Record<string, TipeSurat[]> = {};
        (res.data || []).forEach((b: any) => {
          map[b.kode] = b.tipeSurat || [];
        });
        setTipePerBuku(map);
      })
      .catch((err) => console.error("Gagal fetch buku:", err));

    // ==============================
    // FETCH SURAT MASUK
    // ==============================
    axios
      .get(`${API_BASE}/masuk`)
      .then((res) => setMasuk(res.data))
      .catch((err) => console.error("Gagal fetch surat masuk:", err));

    // ==============================
    // FETCH SURAT KELUAR  ✅ BARU
    // ==============================
    axios
      .get(`${API_BASE}/surat_keluar`)
      .then((res) => setKeluar(res.data))
      .catch((err) => console.error("Gagal fetch surat keluar:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Surat Masuk */}
        <Link to="/surat-masuk">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Surat Masuk
              </CardTitle>
              <MailOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {masuk.length}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Jenis Buku */}
        <Link to="/kelola-buku">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Jenis Buku
              </CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {buku.length}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Surat Keluar ✅ SUDAH TERHUBUNG DATABASE */}
        <Link to="/surat-keluar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Surat Keluar
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {keluar.length}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Surat Keluar per Buku → jumlah tipe surat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Surat Keluar per Buku (Jumlah Tipe)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {buku.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada data buku.
              </p>
            ) : (
              <div className="space-y-2">
                {buku.map((b) => (
                  <div
                    key={b.kode}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-foreground">
                      {b.kode} — {b.nama}
                    </span>
                    <span className="font-semibold text-foreground">
                      {tipePerBuku[b.kode]?.length ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Surat Terbaru (Masuk + Keluar) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Surat Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {masuk.length === 0 && keluar.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada surat.</p>
            ) : (
              <div className="space-y-2">
                {/* 3 Surat Masuk Terakhir */}
                {masuk
                  .slice(-3)
                  .reverse()
                  .map((s) => (
                    <div
                      key={`masuk-${s.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate max-w-[200px]">
                        {s.nomor_surat}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Masuk
                      </span>
                    </div>
                  ))}

                {/* 3 Surat Keluar Terakhir */}
                {keluar
                  .slice(-3)
                  .reverse()
                  .map((s) => (
                    <div
                      key={`keluar-${s.id}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate max-w-[200px]">
                        {s.nomor_surat}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Keluar
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
