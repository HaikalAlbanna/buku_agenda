import { useEffect, useState } from "react";
import axios from "axios";
import { fileToBase64, type SuratMasuk as SuratMasukType } from "@/lib/store";
import { API_BASE } from "@/lib/api";
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

export default function SuratMasuk() {
  const [data, setData] = useState<SuratMasukType[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formNomor, setFormNomor] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formDari, setFormDari] = useState("");
  const [formPerihal, setFormPerihal] = useState("");
  const [formPdf, setFormPdf] = useState<File | null>(null);
  const [existingPdf, setExistingPdf] = useState<{ name: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await axios.get(`${API_BASE}/masuk`);
      setData(
        res.data.map((d: any) => ({
          id: d.id.toString(),
          nomorSurat: d.nomor_surat,
          tanggal: new Date(d.tanggal).toLocaleDateString("en-CA"),
          suratDari: d.surat_dari,
          perihal: d.perihal,
          pdfFileName: d.arsip_pdf ? "PDF Terlampir" : null,
          pdfData: d.arsip_pdf || null,
        })),
      );
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal mengambil data dari server",
        variant: "destructive",
      });
    }
  }

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
    setFormTanggal(new Date().toLocaleDateString("en-CA"));
    setDialogOpen(true);
  }

  function openEdit(s: SuratMasukType) {
    setEditId(s.id);
    setFormNomor(s.nomorSurat);
    setFormTanggal(s.tanggal);
    setFormDari(s.suratDari);
    setFormPerihal(s.perihal);
    setFormPdf(null);
    // Hanya simpan nama file agar UI tidak melebar
    setExistingPdf(s.pdfFileName ? { name: s.pdfFileName } : null);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!formNomor || !formTanggal || !formDari || !formPerihal) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive",
      });
      return;
    }
    let pdfData: string | null = null;
    if (formPdf) {
      pdfData = await fileToBase64(formPdf);
    } else if (editId && existingPdf) {
      // Tetap kirim data lama ke backend agar tidak hilang
      const old = data.find((d) => d.id === editId);
      pdfData = old?.pdfData || null;
    }

    try {
      if (editId) {
        await axios.put(`${API_BASE}/masuk/${editId}`, {
          nomor_surat: formNomor,
          tanggal: formTanggal,
          surat_dari: formDari,
          perihal: formPerihal,
          arsip_pdf: pdfData,
        });
        toast({ title: "Berhasil", description: "Surat masuk diperbarui" });
      } else {
        await axios.post(`${API_BASE}/masuk`, {
          nomor_surat: formNomor,
          tanggal: formTanggal,
          surat_dari: formDari,
          perihal: formPerihal,
          arsip_pdf: pdfData,
        });
        toast({ title: "Berhasil", description: "Surat masuk ditambahkan" });
      }
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE}/masuk/${deleteId}`);
      setDeleteId(null);
      toast({ title: "Dihapus", description: "Surat masuk telah dihapus" });
      fetchData();
    } catch (err) {
      toast({
        title: "Error",
        description: "Gagal menghapus data",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Surat Masuk</h2>
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Surat
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nomor Surat</TableHead>
                <TableHead>Surat Dari</TableHead>
                <TableHead>Perihal</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
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
                    <TableCell>{s.tanggal}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.nomorSurat}
                    </TableCell>
                    <TableCell>{s.suratDari}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {s.perihal}
                    </TableCell>
                    <TableCell>
                      {s.pdfData ? (
                        <a
                          href={s.pdfData}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={s.pdfFileName || "file.pdf"}
                        >
                          <FileText className="h-4 w-4 text-primary" />
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
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
              {editId ? "Edit Surat Masuk" : "Tambah Surat Masuk"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nomor Surat</Label>
                <Input
                  value={formNomor}
                  onChange={(e) => setFormNomor(e.target.value)}
                  placeholder="Nomor surat masuk"
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
            <div>
              <Label>Surat Dari</Label>
              <Input
                value={formDari}
                onChange={(e) => setFormDari(e.target.value)}
                placeholder="Pengirim surat"
              />
            </div>
            <div>
              <Label>Perihal</Label>
              <Input
                value={formPerihal}
                onChange={(e) => setFormPerihal(e.target.value)}
                placeholder="Perihal surat"
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

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Surat Masuk?</AlertDialogTitle>
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
