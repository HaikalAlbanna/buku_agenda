import { useState } from "react";
import axios from "axios";
import { downloadFile } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Upload,
  Archive,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { API_BASE } from "@/lib/api";

export default function ExportBackup() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [backupYear, setBackupYear] = useState(
    String(new Date().getFullYear()),
  );
  const [exportYear, setExportYear] = useState(
    String(new Date().getFullYear()),
  );

  async function fetchAllData() {
    try {
      const keluarRes = await axios.get(`${API_BASE}/surat_keluar/export`);
      const masukRes = await axios.get(`${API_BASE}/masuk`);
      const bukuRes = await axios.get(`${API_BASE}/buku`);

      return {
        suratKeluar: keluarRes.data || [],
        suratMasuk: masukRes.data || [],
        buku: bukuRes.data || [],
      };
    } catch (error: any) {
      console.error("FETCH ERROR:", error.response?.data || error);
      throw error;
    }
  }

  async function handleExportJSON() {
    try {
      const data = await fetchAllData();

      downloadFile(
        JSON.stringify(data, null, 2),
        `surat-backup-${new Date().toISOString().slice(0, 10)}.json`,
        "application/json",
      );

      toast({ title: "Berhasil", description: "Data diekspor dari database" });
    } catch {
      toast({
        title: "Error",
        description: "Gagal mengambil data dari database",
        variant: "destructive",
      });
    }
  }

  /* ===================================================
     EXPORT EXCEL DENGAN PILIH TAHUN
  ====================================================== */
  async function handleExportExcel() {
    try {
      const { suratKeluar, suratMasuk, buku } = await fetchAllData();

      const wb = XLSX.utils.book_new();

      // Filter berdasarkan tahun export
      const keluarFiltered = suratKeluar.filter((s: any) =>
        s.tanggal?.startsWith(exportYear),
      );
      const masukFiltered = suratMasuk.filter((s: any) =>
        s.tanggal?.startsWith(exportYear),
      );

      /* ===============================
         GROUP SURAT KELUAR PER BUKU
      ================================= */

      const grouped: Record<string, any[]> = {};

      keluarFiltered.forEach((item: any) => {
        const key = item.buku_kode || "Tanpa Buku";
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(item);
      });

      Object.keys(grouped).forEach((bukuKode) => {
        const dataPerBuku = grouped[bukuKode];

        const formatted = dataPerBuku.map((item: any) => ({
          "Nomor Surat": item.nomor_surat,
          Tanggal: item.tanggal
            ? new Date(item.tanggal).toLocaleDateString("id-ID")
            : "",
          "Alamat Dituju": item.alamat_dituju,
          Perihal: item.perihal,
        }));

        const ws = XLSX.utils.json_to_sheet(formatted);

        ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 40 }];

        const foundBuku = buku.find((b: any) => b.kode === bukuKode);
        const sheetName = foundBuku?.nama || bukuKode;

        XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
      });

      /* ===============================
         SURAT MASUK (HANYA KOLOM FIX)
      ================================= */

      const masuk = masukFiltered.map((item: any) => ({
        "Nomor Surat": item.nomor_surat,
        Tanggal: item.tanggal
          ? new Date(item.tanggal).toLocaleDateString("id-ID")
          : "",
        "Surat Dari": item.surat_dari,
        Perihal: item.perihal,
      }));

      const wsMasuk = XLSX.utils.json_to_sheet(masuk);
      wsMasuk["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 40 }];

      XLSX.utils.book_append_sheet(wb, wsMasuk, "Surat Masuk");

      XLSX.writeFile(
        wb,
        `surat-export-${exportYear}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );

      toast({
        title: "Berhasil",
        description: `Data tahun ${exportYear} diekspor ke Excel`,
      });
    } catch (error) {
      console.error("EXPORT EXCEL ERROR:", error);
      toast({
        title: "Error",
        description: "Gagal export Excel",
        variant: "destructive",
      });
    }
  }

  async function handleBackup() {
    try {
      const year = backupYear;
      const { suratKeluar, suratMasuk, buku } = await fetchAllData();

      const keluarYear = suratKeluar.filter((s: any) =>
        s.tanggal?.startsWith(year),
      );

      const masukYear = suratMasuk.filter((s: any) =>
        s.tanggal?.startsWith(year),
      );

      if (keluarYear.length === 0 && masukYear.length === 0) {
        toast({
          title: "Info",
          description: `Tidak ada data untuk tahun ${year}`,
        });
        return;
      }

      const backupData = {
        buku,
        suratKeluar: keluarYear,
        suratMasuk: masukYear,
        backupYear: year,
        exportedAt: new Date().toISOString(),
      };

      downloadFile(
        JSON.stringify(backupData, null, 2),
        `backup-tahun-${year}.json`,
        "application/json",
      );

      toast({
        title: "Backup Berhasil",
        description: `${keluarYear.length} surat keluar dan ${masukYear.length} surat masuk tahun ${year} berhasil diarsipkan.`,
      });
    } catch (error) {
      console.error("BACKUP ERROR:", error);
      toast({
        title: "Error",
        description: "Gagal melakukan backup",
        variant: "destructive",
      });
    }
  }

  async function handleImport() {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Pilih file JSON untuk diimpor",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await importFile.text();
      JSON.parse(text);

      toast({
        title: "Berhasil",
        description:
          "File JSON valid. Import ke database perlu endpoint khusus.",
      });

      setImportFile(null);
    } catch {
      toast({
        title: "Error",
        description: "File JSON tidak valid",
        variant: "destructive",
      });
    }
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear - i));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Export & Backup</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileJson className="h-5 w-5" />
              Export JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExportJSON} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileSpreadsheet className="h-5 w-5" />
              Export Excel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Pilih Tahun Export</Label>
            <Select value={exportYear} onValueChange={setExportYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleExportExcel} className="w-full mt-3">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-5 w-5" />
              Import JSON
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <Button
              onClick={handleImport}
              className="w-full mt-3"
              disabled={!importFile}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Archive className="h-5 w-5" />
              Backup Tahunan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label>Pilih Tahun Backup</Label>
            <Select value={backupYear} onValueChange={setBackupYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleBackup}
              className="w-full mt-3"
              variant="secondary"
            >
              <Archive className="mr-2 h-4 w-4" />
              Backup
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
