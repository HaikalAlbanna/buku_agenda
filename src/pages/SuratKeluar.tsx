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
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
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
    const res = await authFetch(`${API_BASE}/surat_keluar`);
    const json = await res.json();
    setData(json);
  }

  async function loadBuku() {
    const res = await authFetch(`${API_BASE}/buku`);
    const json = await res.json();
    setBuku(json);
  }

  async function loadTipe(kode: string) {
    const res = await authFetch(`${API_BASE}/tipe_surat/${kode}`);
    const json = await res.json();
    setTipe(json);
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
    setFormAlamat(s.alamat_dituju);
    setFormPerihal(s.perihal);
    setExistingPdf(
      s.pdf_file_name && s.pdf_data
        ? { name: s.pdf_file_name, data: s.pdf_data }
        : null,
    );
    setDialogOpen(true);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat diperbarui" });
    } else {
      await authFetch(`${API_BASE}/surat_keluar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      toast({ title: "Berhasil", description: "Surat ditambahkan" });
    }

    await loadSuratKeluar();
    setDialogOpen(false);
    resetForm();
  }

  /* ================= DELETE ================= */

  async function handleDelete() {
    if (!deleteId) return;

    await authFetch(`${API_BASE}/surat_keluar/${deleteId}`, {
      method: "DELETE",
    });

    await loadSuratKeluar();
    setDeleteId(null);
    toast({ title: "Dihapus", description: "Surat keluar dihapus" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Surat Keluar</h2>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Surat
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-sm">Filter Buku:</Label>
        <Select value={filterBuku} onValueChange={setFilterBuku}>
          <SelectTrigger className="w-[200px]">
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Alamat Dituju</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Belum ada data surat keluar
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.tanggal}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.nomor_surat}
                    </TableCell>
                    <TableCell>{s.alamat_dituju}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {s.perihal}
                    </TableCell>
                    <TableCell>
                      {s.pdf_data ? (
                        <a
                          href={s.pdf_data}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={s.pdf_file_name || ""}
                        >
                          <FileText className="h-4 w-4 text-primary" />
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editId ? "Edit Surat Keluar" : "Tambah Surat Keluar"}
            </DialogTitle>
            <DialogDescription>
              Isi data surat keluar secara lengkap.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Buku</Label>
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
                <Label>Kode Tipe</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nomor Urut</Label>
                <Input
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                />
              </div>

              <div>
                <Label>Tanggal</Label>
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
                <p className="font-mono text-sm font-semibold text-foreground">
                  {previewNomor}
                </p>
              </div>
            )}

            <div>
              <Label>Alamat Dituju</Label>
              <Input
                value={formAlamat}
                onChange={(e) => setFormAlamat(e.target.value)}
              />
            </div>

            <div>
              <Label>Perihal</Label>
              <Input
                value={formPerihal}
                onChange={(e) => setFormPerihal(e.target.value)}
              />
            </div>

            <div>
              <Label>Arsip PDF</Label>
              <Input
                type="file"
                accept=".pdf"
                onChange={(e) => setFormPdf(e.target.files?.[0] || null)}
              />
              {existingPdf && !formPdf && (
                <p className="text-xs text-muted-foreground mt-1">
                  File saat ini: {existingPdf.name}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
            <Button onClick={handleSave}>{editId ? "Simpan" : "Tambah"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Surat Keluar?</AlertDialogTitle>
            <AlertDialogDescription>
              Data yang dihapus tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
