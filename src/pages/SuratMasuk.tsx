import { useEffect, useState } from "react";
import { fileToBase64 } from "@/lib/store";
import { authFetch, API_BASE } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SuratMasukType {
  id: number;
  nomorSurat: string;
  tanggal: string;
  suratDari: string;
  perihal: string;
  pdfFileName: string | null;
  pdfData: string | null;
}

const MAX_PDF_SIZE = 1 * 1024 * 1024; // 1 MB

export default function SuratMasuk() {
  const [data, setData] = useState<SuratMasukType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formNomor, setFormNomor] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formDari, setFormDari] = useState("");
  const [formPerihal, setFormPerihal] = useState("");
  const [formPdf, setFormPdf] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<{
    name: string;
    data: string;
  } | null>(null);

  /* ================= LOAD DATA ================= */

  async function loadSuratMasuk() {
    try {
      const res = await authFetch(`${API_BASE}/masuk`);
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

      setData(formatted);
    } catch (e) {
      console.error("Gagal load surat masuk", e);
    }
  }

  useEffect(() => {
    loadSuratMasuk();
  }, []);

  function resetForm() {
    setFormNomor("");
    setFormTanggal("");
    setFormDari("");
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

  function openEdit(s: SuratMasukType) {
    setEditId(s.id);
    setFormNomor(s.nomorSurat);
    setFormTanggal(s.tanggal);
    setFormDari(s.suratDari);
    setFormPerihal(s.perihal);
    setExistingPdf(
      s.pdfFileName && s.pdfData
        ? { name: s.pdfFileName, data: s.pdfData }
        : null
    );
    setDialogOpen(true);
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
    if (!formNomor || !formTanggal || !formDari || !formPerihal) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }

    let arsipPdf = existingPdf?.data || null;

    if (formPdf) {
      arsipPdf = await fileToBase64(formPdf);
    }

    const payload = {
      nomor_surat: formNomor,
      tanggal: formTanggal,
      surat_dari: formDari,
      perihal: formPerihal,
      arsip_pdf: arsipPdf,
    };

    if (editId) {
      await authFetch(`${API_BASE}/masuk/${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat masuk diperbarui" });
    } else {
      await authFetch(`${API_BASE}/masuk`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat masuk ditambahkan" });
    }

    setDialogOpen(false);
    resetForm();
    loadSuratMasuk();
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (!deleteId) return;
    await authFetch(`${API_BASE}/masuk/${deleteId}`, {
      method: "DELETE",
    });
    setDeleteId(null);
    toast({ title: "Dihapus", description: "Surat masuk dihapus" });
    loadSuratMasuk();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Surat Masuk</h2>
        <Button onClick={openAdd} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Surat
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[650px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Tanggal</TableHead>
                  <TableHead>Nomor Surat</TableHead>
                  <TableHead>Surat Dari</TableHead>
                  <TableHead>Perihal</TableHead>
                  <TableHead className="w-[60px]">PDF</TableHead>
                  <TableHead className="w-[90px] text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      Belum ada data surat masuk
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-xs sm:text-sm">{s.tanggal}</TableCell>
                      <TableCell className="font-mono text-xs font-medium">
                        {s.nomorSurat}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{s.suratDari}</TableCell>
                      <TableCell className="text-xs sm:text-sm max-w-[200px] truncate">
                        {s.perihal}
                      </TableCell>
                      <TableCell>
                        {s.pdfData ? (
                          <a
                            href={s.pdfData}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={s.pdfFileName || "surat-masuk.pdf"}
                            className="inline-flex items-center justify-center p-1 hover:bg-accent rounded"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
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
              {editId ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi data surat masuk secara lengkap.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm">Nomor Surat</Label>
                <Input
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                  placeholder="Nomor surat masuk"
                />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Tanggal</Label>
                <Input
                  type="date"
                  value={formTanggal}
                  onChange={(e) => setFormTanggal(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Surat Dari</Label>
              <Input
                value={formDari}
                onChange={(e) => setFormDari(e.target.value)}
                placeholder="Pengirim surat"
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

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Hapus Surat Masuk?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Data yang dihapus tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDelete}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
