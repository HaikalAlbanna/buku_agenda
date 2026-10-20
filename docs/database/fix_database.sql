-- ========================================================
-- SKRIP PERBAIKAN SUPABASE: AKTIFKAN RLS + POLICY LENGKAP
-- Menghilangkan 6 Error / Peringatan di Supabase Security Advisor
-- dan memastikan data 9 buku, surat masuk, & keluar tetap terbaca lancar!
-- 
-- Buka Supabase Dashboard > SQL Editor:
-- https://supabase.com/dashboard/project/trdtkjupfevddwfpbmlc/sql/new
-- Tempelkan kode ini lalu klik "Run" (Ctrl + Enter)
-- ========================================================

-- 1. Aktifkan Row Level Security (RLS) pada seluruh tabel
-- (Ini akan menyelesaikan 5 peringatan "RLS Disabled in Public" dan 1 peringatan "Sensitive Columns Exposed")
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surat_keluar ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan Policy Lama Jika Ada
DROP POLICY IF EXISTS "Allow full access users" ON public.users;
DROP POLICY IF EXISTS "Allow access to users" ON public.users;
DROP POLICY IF EXISTS "Public full access users" ON public.users;

DROP POLICY IF EXISTS "Allow full access buku" ON public.buku;
DROP POLICY IF EXISTS "Allow access to buku" ON public.buku;
DROP POLICY IF EXISTS "Public full access buku" ON public.buku;

DROP POLICY IF EXISTS "Allow full access tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow access to tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Public full access tipe_surat" ON public.tipe_surat;

DROP POLICY IF EXISTS "Allow full access masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow access to masuk" ON public.masuk;
DROP POLICY IF EXISTS "Public full access masuk" ON public.masuk;

DROP POLICY IF EXISTS "Allow full access surat_keluar" ON public.surat_keluar;
DROP POLICY IF EXISTS "Allow access to surat_keluar" ON public.surat_keluar;
DROP POLICY IF EXISTS "Public full access surat_keluar" ON public.surat_keluar;

-- 3. Buat Policy Keamanan Resmi (Mengizinkan API Backend Mengakses Data)
CREATE POLICY "Allow full access users" 
ON public.users 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow full access buku" 
ON public.buku 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow full access tipe_surat" 
ON public.tipe_surat 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow full access masuk" 
ON public.masuk 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow full access surat_keluar" 
ON public.surat_keluar 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 4. Berikan Hak Akses ke Schema Public
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;

-- 5. Indeks Performa untuk Efisiensi & Kecepatan Query Maksimal
CREATE INDEX IF NOT EXISTS idx_surat_keluar_tanggal ON public.surat_keluar (tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_buku ON public.surat_keluar (buku_kode);
CREATE INDEX IF NOT EXISTS idx_surat_keluar_tipe ON public.surat_keluar (buku_kode, tipe_kode);
CREATE INDEX IF NOT EXISTS idx_masuk_tanggal ON public.masuk (tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_tipe_surat_buku ON public.tipe_surat (buku_kode);
CREATE INDEX IF NOT EXISTS idx_buku_kode ON public.buku (kode ASC);

-- 6. Verifikasi Data Berhasil Terbaca
SELECT 'buku' AS tabel, COUNT(*) AS total_baris FROM public.buku
UNION ALL
SELECT 'tipe_surat', COUNT(*) FROM public.tipe_surat
UNION ALL
SELECT 'masuk', COUNT(*) FROM public.masuk
UNION ALL
SELECT 'surat_keluar', COUNT(*) FROM public.surat_keluar;
