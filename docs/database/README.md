# Dokumentasi Database Supabase

Proyek ini telah dikonfigurasi untuk terhubung ke **Supabase** via library `@supabase/supabase-js`. Seluruh URL dan API Key disimpan secara privat di dalam file `.env` (lokal) atau Environment Variables (di Vercel) dan tidak diunggah ke repositori publik.

## Konfigurasi Environment (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_publishable_key
```

## Cara Mengaktifkan Tabel di Supabase (Sekali Saja)
1. Buka dashboard proyek Anda di: **[supabase.com/dashboard](https://supabase.com/dashboard)**
2. Pilih proyek Supabase Anda.
3. Buka menu **SQL Editor** (ikon terminal/`SQL` di bilah kiri).
4. Klik **New Query**.
5. Salin dan tempel seluruh isi skrip dari file:
   - [`docs/database/schema_supabase.sql`](./schema_supabase.sql)
6. Klik tombol hijau **Run**.
7. Selesai! Semua tabel (`users`, `buku`, `tipe_surat`, `masuk`, `surat_keluar`), akun admin demo, dan data awal buku langsung aktif dan tersinkronisasi.
