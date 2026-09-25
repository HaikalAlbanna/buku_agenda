# Dokumentasi Database Supabase

Proyek ini telah dikonfigurasi untuk terhubung langsung ke **Supabase** menggunakan **Publishable API Key** via library `@supabase/supabase-js`.

## URL & Key Supabase
- **URL**: `https://trdtkjupfevddwfpbmlc.supabase.co`
- **Publishable Key**: `sb_publishable_wApXcE_OIo8g0dZRKSt2Vw_-kSspZxe`

## Cara Mengaktifkan Tabel di Supabase (Sekali Saja)
1. Buka dashboard proyek Anda di: **[supabase.com/dashboard](https://supabase.com/dashboard)**
2. Pilih proyek Anda (`trdtkjupfevddwfpbmlc`).
3. Buka menu **SQL Editor** (ikon terminal/SQL di bilah kiri).
4. Klik **New Query**.
5. Salin dan tempel seluruh isi skrip dari file:
   - [`docs/database/schema_supabase.sql`](./schema_supabase.sql)
6. Klik tombol hijau **Run**.
7. Selesai! Semua tabel (`users`, `buku`, `tipe_surat`, `masuk`, `surat_keluar`), akun admin demo, dan data awal buku langsung aktif dan tersinkronisasi.
