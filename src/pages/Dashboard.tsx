import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MailOpen, BookOpen, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { buku, suratKeluar: keluar, suratMasuk: masuk } = useData();

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
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
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {buku.length}
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Surat Keluar */}
        <Link to="/surat-keluar">
          <Card className="hover:shadow-md transition-shadow cursor-pointer sm:col-span-2 md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Surat Keluar
              </CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-foreground">
                {keluar.length}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Surat Keluar per Buku (Jumlah Tipe) */}
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
                    className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
                  >
                    <span className="text-foreground font-medium">
                      {b.kode} — {b.nama}
                    </span>
                    <span className="font-semibold text-foreground">
                      {(b.tipeSurat || []).length} tipe
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
                      className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
                    >
                      <span className="truncate max-w-[200px] font-mono text-xs">
                        {s.nomorSurat}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">
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
                      className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0"
                    >
                      <span className="truncate max-w-[200px] font-mono text-xs">
                        {s.nomor_surat}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded font-medium">
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
