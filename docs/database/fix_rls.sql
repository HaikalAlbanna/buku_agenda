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
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename IN ('users', 'buku', 'tipe_surat', 'masuk', 'surat_keluar')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

DROP POLICY IF EXISTS "Allow public read buku" ON public.buku;
DROP POLICY IF EXISTS "Allow public read tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow public read masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow public read surat_keluar" ON public.surat_keluar;

-- 3. Buat Kebijakan Keamanan (RLS Policies) sesuai rekomendasi Supabase Linter
-- Hanya izinkan SELECT publik agar tidak memicu warning "RLS Policy Always True".
-- Backend Express menggunakan 'service_role' key yang otomatis bypass RLS untuk INSERT/UPDATE/DELETE.

CREATE POLICY "Allow public read buku" 
ON public.buku 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read tipe_surat" 
ON public.tipe_surat 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read masuk" 
ON public.masuk 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read surat_keluar" 
ON public.surat_keluar 
FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Allow public read users" 
ON public.users 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Berikan Hak Akses (Grants) ke Role Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
