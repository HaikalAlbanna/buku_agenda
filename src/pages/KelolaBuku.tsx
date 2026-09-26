import { useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/api";
import { useData } from "@/context/DataContext";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type TipeSurat = { kode: string; nama: string };
type Buku = { kode: string; nama: string; tipeSurat: TipeSurat[] };

export default function KelolaBuku() {
  const { buku, refreshBuku } = useData();
  const [addBukuOpen, setAddBukuOpen] = useState(false);
  const [addTipeOpen, setAddTipeOpen] = useState<string | null>(null);
  const [deleteBukuKode, setDeleteBukuKode] = useState<string | null>(null);
  const [deleteTipeInfo, setDeleteTipeInfo] = useState<{
    bukuKode: string;
    tipeKode: string;
  } | null>(null);

  const [newBukuKode, setNewBukuKode] = useState("");
  const [newBukuNama, setNewBukuNama] = useState("");
  const [newTipeKode, setNewTipeKode] = useState("");
  const [newTipeNama, setNewTipeNama] = useState("");

  const [isSubmittingBuku, setIsSubmittingBuku] = useState(false);
  const [isSubmittingTipe, setIsSubmittingTipe] = useState(false);

  /** =======================
   *  TAMBAH BUKU
   * ======================= */
  const handleAddBuku = async () => {
    if (isSubmittingBuku) return;

    if (!newBukuKode || !newBukuNama) {
      toast({
        title: "Error",
        description: "Kode dan nama wajib diisi",
        variant: "destructive",
      });
      return;
    }
    if (buku.find((b) => b.kode === newBukuKode.toUpperCase())) {
      toast({
        title: "Error",
        description: "Kode buku sudah ada",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingBuku(true);
    try {
      await axios.post(`${API_BASE}/buku`, {
        kode: newBukuKode.toUpperCase(),
        nama: newBukuNama,
      });
      toast({ title: "Berhasil", description: "Buku baru ditambahkan" });
      setNewBukuKode("");
      setNewBukuNama("");
      setAddBukuOpen(false);
      refreshBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingBuku(false);
    }
  };

  /** =======================
   *  HAPUS BUKU
   * ======================= */
  const handleDeleteBuku = async () => {
    if (!deleteBukuKode) return;
    try {
      await axios.delete(`${API_BASE}/buku/${deleteBukuKode}`);
      toast({ title: "Dihapus", description: "Buku telah dihapus" });
      setDeleteBukuKode(null);
      refreshBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    }
  };

  /** =======================
   *  TAMBAH TIPE SURAT
   * ======================= */
  const handleAddTipe = async () => {
    if (isSubmittingTipe) return;

    if (!addTipeOpen || !newTipeKode || !newTipeNama) {
      toast({
        title: "Error",
        description: "Kode dan nama tipe wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingTipe(true);
    try {
      await axios.post(`${API_BASE}/tipe_surat`, {
        buku_kode: addTipeOpen,
        kode: newTipeKode,
        nama: newTipeNama,
      });
      toast({ title: "Berhasil", description: "Kode tipe ditambahkan" });
      setNewTipeKode("");
      setNewTipeNama("");
      setAddTipeOpen(null);
      refreshBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTipe(false);
    }
  };

  /** =======================
   *  HAPUS TIPE SURAT
   * ======================= */
  const handleDeleteTipe = async () => {
    if (!deleteTipeInfo) return;
    try {
      await axios.delete(
        `${API_BASE}/tipe_surat/${deleteTipeInfo.tipeKode}?buku_kode=${deleteTipeInfo.bukuKode}`,
      );
      toast({ title: "Dihapus", description: "Kode tipe telah dihapus" });
      setDeleteTipeInfo(null);
      refreshBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    }
  };

  /** =======================
   *  RENDER COMPONENT
   * ======================= */
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          Kelola Buku & Kode Tipe
        </h2>
        <Button onClick={() => setAddBukuOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Buku
        </Button>
      </div>

      {buku.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground text-sm">
            Belum ada buku. Tambahkan buku baru.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {buku.map((b) => (
            <AccordionItem
              key={b.kode}
              value={b.kode}
              className="border rounded-lg bg-card"
            >
              <AccordionTrigger className="px-3 sm:px-4 py-3 hover:no-underline">
                <div className="flex flex-wrap items-center gap-2 text-left">
                  <BookOpen className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm sm:text-base">{b.kode}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">— {b.nama}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({(b.tipeSurat || []).length} tipe)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 sm:px-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    Kode Tipe Surat
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8"
                      onClick={() => setAddTipeOpen(b.kode)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Tambah Tipe
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="text-xs h-8"
                      onClick={() => setDeleteBukuKode(b.kode)}
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Hapus Buku
                    </Button>
                  </div>
                </div>
                {(!b.tipeSurat || b.tipeSurat.length === 0) ? (
                  <p className="text-xs sm:text-sm text-muted-foreground py-2">
                    Belum ada kode tipe untuk buku ini.
                  </p>
                ) : (
                  <div className="overflow-x-auto border rounded-md">
                    <Table className="min-w-[450px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Kode</TableHead>
                          <TableHead>Nama Tipe Surat</TableHead>
                          <TableHead className="w-[60px] text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {b.tipeSurat.map((t) => (
                          <TableRow key={t.kode}>
                            <TableCell className="font-mono text-xs sm:text-sm font-medium">
                              {t.kode}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm">{t.nama}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  setDeleteTipeInfo({
                                    bukuKode: b.kode,
                                    tipeKode: t.kode,
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Add Buku Dialog */}
      <Dialog open={addBukuOpen} onOpenChange={(o) => setAddBukuOpen(o)}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Tambah Buku Baru</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi kode dan nama buku agenda baru yang ingin ditambahkan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs sm:text-sm">Kode Buku</Label>
              <Input
                value={newBukuKode}
                onChange={(e) => setNewBukuKode(e.target.value.toUpperCase())}
                placeholder="Contoh: HK"
                maxLength={5}
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Nama Buku</Label>
              <Input
                value={newBukuNama}
                onChange={(e) => setNewBukuNama(e.target.value)}
                placeholder="Contoh: Hukum"
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAddBukuOpen(false)}>
              Batal
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleAddBuku} disabled={isSubmittingBuku}>
              {isSubmittingBuku ? "Menambahkan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tipe Dialog */}
      <Dialog
        open={!!addTipeOpen}
        onOpenChange={(o) => !o && setAddTipeOpen(null)}
      >
        <DialogContent className="max-w-md w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg">Tambah Kode Tipe — Buku {addTipeOpen}</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Isi kode dan nama tipe surat baru untuk buku ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs sm:text-sm">Kode Tipe</Label>
              <Input
                value={newTipeKode}
                onChange={(e) => setNewTipeKode(e.target.value)}
                placeholder="Contoh: 01.01"
              />
            </div>
            <div>
              <Label className="text-xs sm:text-sm">Nama Tipe</Label>
              <Input
                value={newTipeNama}
                onChange={(e) => setNewTipeNama(e.target.value)}
                placeholder="Contoh: Kebijakan Pengawasan"
              />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setAddTipeOpen(null)}>
              Batal
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleAddTipe} disabled={isSubmittingTipe}>
              {isSubmittingTipe ? "Menambahkan..." : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Buku Confirmation */}
      <AlertDialog
        open={!!deleteBukuKode}
        onOpenChange={(o) => !o && setDeleteBukuKode(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">Hapus Buku {deleteBukuKode}?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Semua kode tipe di buku ini juga akan dihapus. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDeleteBuku}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tipe Confirmation */}
      <AlertDialog
        open={!!deleteTipeInfo}
        onOpenChange={(o) => !o && setDeleteTipeInfo(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:w-full p-4 sm:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              Hapus Kode Tipe {deleteTipeInfo?.tipeKode}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto" onClick={() => setDeleteTipeInfo(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction className="w-full sm:w-auto" onClick={handleDeleteTipe}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
