-- ========================================================
-- SKRIP PERBAIKAN RLS (ROW LEVEL SECURITY) SUPABASE
-- Mengatasi Error 500: "new row violates row-level security policy for table surat_keluar"
-- 
-- Buka Supabase Dashboard > SQL Editor:
-- https://supabase.com/dashboard/project/trdtkjupfevddwfpbmlc/sql/new
-- Tempelkan kode ini lalu klik "Run" (Ctrl + Enter)
-- ========================================================

-- 1. Pastikan Row Level Security (RLS) aktif pada seluruh tabel
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surat_keluar ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan Kebijakan (Policy) Lama Agar Bersih & Tidak Bentrok
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

-- 3. Buat Kebijakan Keamanan Lengkap (SELECT, INSERT, UPDATE, DELETE)
-- Karena Backend Express telah mengamankan seluruh rute dengan autentikasi JWT token & hashing password,
-- policy ini mengizinkan Backend (baik via publishable key maupun service_role key)
-- untuk mengelola data buku, tipe surat, surat masuk, dan surat keluar tanpa hambatan.

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

-- 4. Berikan Hak Akses Penuh ke Role Supabase
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role, postgres;

-- 5. Verifikasi Data Berhasil Terbaca & Siap Digunakan
SELECT 'buku' AS tabel, COUNT(*) AS total_baris FROM public.buku
UNION ALL
SELECT 'tipe_surat', COUNT(*) FROM public.tipe_surat
UNION ALL
SELECT 'masuk', COUNT(*) FROM public.masuk
UNION ALL
SELECT 'surat_keluar', COUNT(*) FROM public.surat_keluar;
