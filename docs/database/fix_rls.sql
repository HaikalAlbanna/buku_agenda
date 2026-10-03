-- ========================================================
-- SKRIP PERBAIKAN RLS (ROW LEVEL SECURITY) SUPABASE
-- Buku Agenda - Supabase Security Advisor Fix
-- 
-- Petunjuk Penggunaan:
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Tempelkan skrip di bawah ini lalu klik "Run" (Ctrl + Enter)
-- ========================================================

-- 1. Aktifkan RLS pada seluruh tabel di skema public
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surat_keluar ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan Kebijakan (Policy) Lama Jika Ada
DROP POLICY IF EXISTS "Public full access users" ON public.users;
DROP POLICY IF EXISTS "Allow anon read write users" ON public.users;
DROP POLICY IF EXISTS "Public full access buku" ON public.buku;
DROP POLICY IF EXISTS "Allow anon read write buku" ON public.buku;
DROP POLICY IF EXISTS "Public full access tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow anon read write tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Public full access masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow anon read write masuk" ON public.masuk;
DROP POLICY IF EXISTS "Public full access surat_keluar" ON public.surat_keluar;
DROP POLICY IF EXISTS "Allow anon read write surat_keluar" ON public.surat_keluar;

-- 3. Buat Kebijakan Keamanan (RLS Policies)

-- Policy untuk tabel 'users'
CREATE POLICY "Allow access to users" 
ON public.users 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Policy untuk tabel 'buku'
CREATE POLICY "Allow access to buku" 
ON public.buku 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Policy untuk tabel 'tipe_surat'
CREATE POLICY "Allow access to tipe_surat" 
ON public.tipe_surat 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Policy untuk tabel 'masuk'
CREATE POLICY "Allow access to masuk" 
ON public.masuk 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- Policy untuk tabel 'surat_keluar'
CREATE POLICY "Allow access to surat_keluar" 
ON public.surat_keluar 
FOR ALL 
TO anon, authenticated, service_role 
USING (true) 
WITH CHECK (true);

-- 4. Berikan Hak Akses (Grants) ke Role Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
