import { useEffect, useState } from "react";
import axios from "axios";
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
  const [buku, setBuku] = useState<Buku[]>([]);
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

  /** =======================
   *  FETCH SEMUA BUKU & TIPE
   * ======================= */
  const fetchBuku = async () => {
    try {
      const res = await axios.get<Buku[]>(`${API_BASE}/buku`);
      const bukuWithTipe = await Promise.all(
        res.data.map(async (b) => {
          const tipeRes = await axios.get<TipeSurat[]>(
            `${API_BASE}/tipe_surat/${b.kode}`,
          );
          return { ...b, tipeSurat: tipeRes.data };
        }),
      );
      setBuku(bukuWithTipe);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBuku();
  }, []);

  /** =======================
   *  TAMBAH BUKU
   * ======================= */
  const handleAddBuku = async () => {
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
    try {
      await axios.post(`${API_BASE}/buku`, {
        kode: newBukuKode.toUpperCase(),
        nama: newBukuNama,
      });
      toast({ title: "Berhasil", description: "Buku baru ditambahkan" });
      setNewBukuKode("");
      setNewBukuNama("");
      setAddBukuOpen(false);
      fetchBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
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
      fetchBuku();
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
    if (!addTipeOpen || !newTipeKode || !newTipeNama) {
      toast({
        title: "Error",
        description: "Kode dan nama tipe wajib diisi",
        variant: "destructive",
      });
      return;
    }
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
      fetchBuku();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.error || err.message,
        variant: "destructive",
      });
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
      fetchBuku();
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Kelola Buku & Kode Tipe
        </h2>
        <Button onClick={() => setAddBukuOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Buku
        </Button>
      </div>

      <Accordion type="multiple" className="space-y-2">
        {buku.map((b) => (
          <AccordionItem
            key={b.kode}
            value={b.kode}
            className="border rounded-lg bg-card"
          >
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="font-semibold">{b.kode}</span>
                <span className="text-muted-foreground">— {b.nama}</span>
                <span className="text-xs text-muted-foreground">
                  ({b.tipeSurat.length} tipe)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">
                  Kode Tipe Surat
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddTipeOpen(b.kode)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Tambah Tipe
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteBukuKode(b.kode)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Hapus Buku
                  </Button>
                </div>
              </div>
              {b.tipeSurat.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada kode tipe untuk buku ini.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead className="w-[60px]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b.tipeSurat.map((t) => (
                      <TableRow key={t.kode}>
                        <TableCell className="font-mono">{t.kode}</TableCell>
                        <TableCell>{t.nama}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
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
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {buku.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Belum ada buku. Tambahkan buku baru.
          </CardContent>
        </Card>
      )}

      {/* Add Buku Dialog */}
      <Dialog open={addBukuOpen} onOpenChange={(o) => setAddBukuOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Buku Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kode Buku</Label>
              <Input
                value={newBukuKode}
                onChange={(e) => setNewBukuKode(e.target.value.toUpperCase())}
                placeholder="Contoh: HK"
                maxLength={5}
              />
            </div>
            <div>
              <Label>Nama Buku</Label>
              <Input
                value={newBukuNama}
                onChange={(e) => setNewBukuNama(e.target.value)}
                placeholder="Contoh: Hukum"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddBukuOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddBuku}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tipe Dialog */}
      <Dialog
        open={!!addTipeOpen}
        onOpenChange={(o) => !o && setAddTipeOpen(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kode Tipe — Buku {addTipeOpen}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Kode Tipe</Label>
              <Input
                value={newTipeKode}
                onChange={(e) => setNewTipeKode(e.target.value)}
                placeholder="Contoh: 01.01"
              />
            </div>
            <div>
              <Label>Nama Tipe</Label>
              <Input
                value={newTipeNama}
                onChange={(e) => setNewTipeNama(e.target.value)}
                placeholder="Contoh: Kebijakan Pengawasan"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTipeOpen(null)}>
              Batal
            </Button>
            <Button onClick={handleAddTipe}>Tambah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Buku Confirmation */}
      <AlertDialog
        open={!!deleteBukuKode}
        onOpenChange={(o) => !o && setDeleteBukuKode(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Buku {deleteBukuKode}?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua kode tipe di buku ini juga akan dihapus. Tindakan ini tidak
              bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBuku}>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Hapus Kode Tipe {deleteTipeInfo?.tipeKode}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTipeInfo(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTipe}>
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
