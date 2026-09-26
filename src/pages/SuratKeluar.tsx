import { useEffect, useState } from "react";
import { buildNomorSurat, fileToBase64 } from "@/lib/store";
import { authFetch, API_BASE } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, FileText, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Buku {
  kode: string;
  nama: string;
}

interface TipeSurat {
  kode: string;
  nama: string;
}

interface SuratKeluarType {
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

const MAX_PDF_SIZE = 1 * 1024 * 1024; // 1 MB

export default function SuratKeluar() {
  const [buku, setBuku] = useState<Buku[]>([]);
  const [tipe, setTipe] = useState<TipeSurat[]>([]);
  const [data, setData] = useState<SuratKeluarType[]>([]);
  const [filterBuku, setFilterBuku] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formBuku, setFormBuku] = useState("");
  const [formTipe, setFormTipe] = useState("");
  const [formNomor, setFormNomor] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formAlamat, setFormAlamat] = useState("");
  const [formPerihal, setFormPerihal] = useState("");
  const [formPdf, setFormPdf] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<{
    name: string;
    data: string;
  } | null>(null);

  /* ================= LOAD DATA ================= */

  async function loadSuratKeluar() {
    try {
      const res = await authFetch(`${API_BASE}/surat_keluar`);
      const json = await res.json();
      setData(json || []);
    } catch (e) {
      console.error("Gagal load surat keluar", e);
    }
  }

  async function loadBuku() {
    try {
      const res = await authFetch(`${API_BASE}/buku`);
      const json = await res.json();
      setBuku(json || []);
    } catch (e) {
      console.error("Gagal load buku", e);
    }
  }

  async function loadTipe(kode: string) {
    try {
      const res = await authFetch(`${API_BASE}/tipe_surat/${kode}`);
      const json = await res.json();
      setTipe(json || []);
    } catch (e) {
      console.error("Gagal load tipe", e);
    }
  }

  useEffect(() => {
    loadSuratKeluar();
    loadBuku();
  }, []);

  useEffect(() => {
    if (formBuku) {
      loadTipe(formBuku);
      setFormTipe("");
    } else {
      setTipe([]);
    }
  }, [formBuku]);

  const previewNomor =
    formBuku && formTipe && formNomor
      ? buildNomorSurat(formBuku, formTipe, formNomor)
      : "";

  const filtered =
    filterBuku === "all"
      ? data
      : data.filter((s) => s.buku_kode === filterBuku);

  function resetForm() {
    setFormBuku("");
    setFormTipe("");
    setFormNomor("");
    setFormTanggal("");
    setFormAlamat("");
    setFormPerihal("");
    setFormPdf(null);
    setExistingPdf(null);
    setEditId(null);
  }

  function openAdd() {
    resetForm();

    const today = new Date();
    const localDate =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");

    setFormTanggal(localDate);
    setDialogOpen(true);
  }

  function openEdit(s: SuratKeluarType) {
    setEditId(s.id);
    setFormBuku(s.buku_kode);
    setFormTipe(s.tipe_kode);
    setFormNomor(s.nomor_urut);
    setFormTanggal(s.tanggal);
    setFormAlamat(s.alamat_dituju || "");
    setFormPerihal(s.perihal);
    setExistingPdf(
      s.pdf_file_name && s.pdf_data
        ? { name: s.pdf_file_name, data: s.pdf_data }
        : null
    );
    setDialogOpen(true);
  }

  /* ================= NOMOR OTOMATIS ================= */

  function handleAutoNumber() {
    if (!formBuku || !formTipe) {
      toast({
        title: "Peringatan",
        description: "Pilih Buku dan Kode Tipe terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    const targetList = data.filter(
      (s) => s.buku_kode === formBuku && s.tipe_kode === formTipe
    );
    const listToUse =
      targetList.length > 0
        ? targetList
        : data.filter((s) => s.buku_kode === formBuku);

    let maxNum = 0;
    let targetPad = 4;

    for (const s of listToUse) {
      if (s.nomor_urut) {
        const cleanDigits = s.nomor_urut.replace(/\D/g, "");
        if (cleanDigits) {
          const num = parseInt(cleanDigits, 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
            targetPad = Math.max(s.nomor_urut.length, cleanDigits.length, 4);
          }
        }
      }
    }

    const nextNum = maxNum + 1;
    const autoStr = String(nextNum).padStart(targetPad, "0");

    setFormNomor(autoStr);
    toast({
      title: "Nomor Urut Otomatis",
      description: `Nomor urut berikutnya: ${autoStr} (Buku ${formBuku}, Tipe ${formTipe})`,
    });
  }

  /* ================= VALIDASI FILE PDF ================= */

  function handlePdfChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_PDF_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        toast({
          title: "File Terlalu Besar",
          description: `Ukuran file PDF tidak boleh lebih dari 1 MB (Ukuran file Anda: ${sizeMB} MB)`,
          variant: "destructive",
        });
        e.target.value = "";
        setFormPdf(null);
        return;
      }
      setFormPdf(file);
    } else {
      setFormPdf(null);
    }
  }

  /* ================= SAVE ================= */

  async function handleSave() {
    if (!formBuku || !formTipe || !formNomor || !formTanggal || !formPerihal) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }

    let pdfFileName = existingPdf?.name || null;
    let pdfData = existingPdf?.data || null;

    if (formPdf) {
      pdfFileName = formPdf.name;
      pdfData = await fileToBase64(formPdf);
    }

    const payload = {
      id: editId ?? uuidv4(),
      bukuKode: formBuku,
      tipeKode: formTipe,
      nomorUrut: formNomor,
      nomorSurat: buildNomorSurat(formBuku, formTipe, formNomor),
      tanggal: formTanggal,
      alamatDituju: formAlamat,
      perihal: formPerihal,
      pdfFileName,
      pdfData,
    };

    if (editId) {
      await authFetch(`${API_BASE}/surat_keluar/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat keluar diperbarui" });
    } else {
      await authFetch(`${API_BASE}/surat_keluar`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat keluar ditambahkan" });
    }

    setDialogOpen(false);
    resetForm();
    loadSuratKeluar();
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (!deleteId) return;
    await authFetch(`${API_BASE}/surat_keluar/${deleteId}`, {
      method: "DELETE",
    });
    setDeleteId(null);
    toast({ title: "Dihapus", description: "Surat keluar dihapus" });
    loadSuratKeluar();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Surat Keluar</h2>
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Surat
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <Label className="text-sm">Filter Buku:</Label>
        <Select value={filterBuku} onValueChange={setFilterBuku}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Buku</SelectItem>
            {buku.map((b) => (
              <SelectItem key={b.kode} value={b.kode}>
                {b.kode} — {b.nama}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Tanggal</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Alamat Dituju</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead className="w-[60px]">PDF</TableHead>
                  <TableHead className="w-[90px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Belum ada data surat keluar
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs sm:text-sm">{s.tanggal}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        {s.nomor_surat}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{s.alamat_dituju || "—"}</TableCell>
                      <TableCell className="text-xs sm:text-sm max-w-[200px] truncate">
                        {s.perihal}
                      </TableCell>
                      <TableCell>
                        {s.pdf_data ? (
                          <a
                            href={s.pdf_data}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={s.pdf_file_name || "surat-keluar.pdf"}
                            className="inline-flex items-center justify-center p-1 hover:bg-accent rounded"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteId(s.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) resetForm();
          setDialogOpen(o);
        }}
      >
        <DialogContent className="max-w-lg w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {editId ? "Edit Surat Keluar" : "Tambah Surat Keluar"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi data surat keluar secara lengkap.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm">Buku</Label>
                <Select value={formBuku} onValueChange={setFormBuku}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih buku" />
                  </SelectTrigger>
                  <SelectContent>
                    {buku.map((b) => (
                      <SelectItem key={b.kode} value={b.kode}>
                        {b.kode} — {b.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs sm:text-sm">Kode Tipe</Label>
                <Select
                  value={formTipe}
                  onValueChange={setFormTipe}
                  disabled={!formBuku}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipe.map((t) => (
                      <SelectItem key={t.kode} value={t.kode}>
                        {t.kode} — {t.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs sm:text-sm">Nomor Urut</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!formBuku || !formTipe}
                    className="h-6 px-2 text-[11px] font-medium"
                    onClick={handleAutoNumber}
                    title={
                      !formBuku || !formTipe
                        ? "Pilih Buku dan Kode Tipe terlebih dahulu"
                        : "Deteksi nomor urut otomatis"
                    }
                  >
                    <Sparkles className="mr-1 h-3 w-3" />
                    Otomatis
                  </Button>
                </div>
                <Input
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                  placeholder="Contoh: 0001"
                />
              </div>

              <div>
                <Label className="text-xs sm:text-sm mb-1.5 block">Tanggal</Label>
                <Input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                />
              </div>
            </div>

            {previewNomor && (
              <div className="rounded-md bg-muted p-3">
                <Label className="text-xs text-muted-foreground">
                  Preview Nomor Surat
                </Label>
                <p className="font-mono text-xs sm:text-sm font-semibold text-foreground break-all">
                  {previewNomor}
                </p>
              </div>
            )}

            <div>
              <Label className="text-xs sm:text-sm">Alamat Dituju</Label>
              <Input
                value={formAlamat}
                onChange={(e) => setFormAlamat(e.target.value)}
                placeholder="Alamat / tujuan surat"
              />
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Perihal</Label>
              <Input
                value={formPerihal}
                onChange={(e) => setFormPerihal(e.target.value)}
                placeholder="Perihal surat"
              />
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Arsip PDF (Maksimal 1 MB)</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="cursor-pointer text-xs sm:text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Format file PDF, ukuran maksimal 1 MB.
              </p>
              {existingPdf && !formPdf && (
                <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                  File saat ini: {existingPdf.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSave}>
              {editId ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Hapus Surat Keluar?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Data yang dihapus tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
