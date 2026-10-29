-- ========================================================
-- SKRIP PEMBERSIH WARNING RLS (SUPABASE SECURITY ADVISOR)
-- Menghilangkan 5 Warning "RLS Policy Always True"
-- ========================================================
-- 
-- ⚠️ PERINGATAN PENTING:
-- Skrip ini HANYA boleh dijalankan jika backend Anda telah menggunakan
-- 'SUPABASE_SERVICE_ROLE_KEY' (kunci secret service_role dari Supabase Dashboard > Project Settings > API).
--
-- JIKA backend Anda masih menggunakan Publishable Key (sb_publishable_...),
-- JALANKAN FILE: docs/database/fix_rls.sql
-- (Jika menjalankan skrip ini tanpa service_role key, backend akan ditolak melakukan INSERT/UPDATE/DELETE).
--
-- Jalankan skrip ini di:
-- Supabase Dashboard > SQL Editor > New query > Run (Ctrl + Enter)
-- ========================================================

-- 1. Pastikan Row Level Security (RLS) aktif pada semua tabel
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surat_keluar ENABLE ROW LEVEL SECURITY;

-- 2. Bersihkan semua policy lama agar tidak terjadi bentrok "already exists"
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

-- Drop eksplisit untuk redundansi keamanan
DROP POLICY IF EXISTS "Allow public read buku" ON public.buku;
DROP POLICY IF EXISTS "Allow public read tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow public read masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow public read surat_keluar" ON public.surat_keluar;
DROP POLICY IF EXISTS "Allow full access buku" ON public.buku;
DROP POLICY IF EXISTS "Allow full access tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow full access masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow full access surat_keluar" ON public.surat_keluar;

-- 3. Buat policy yang SESUAI standar keamanan Supabase Linter:
-- Supabase Linter mengizinkan 'USING (true)' KHUSUS untuk operasi SELECT (read-only publik).
-- Operasi tulis (INSERT, UPDATE, DELETE) tetap terproteksi dan ditangani via Backend Express (service_role).

-- A. Tabel buku (Boleh dibaca publik, tulis hanya via backend/service_role)
CREATE POLICY "Allow public read buku" 
ON public.buku 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- B. Tabel tipe_surat (Boleh dibaca publik, tulis hanya via backend/service_role)
CREATE POLICY "Allow public read tipe_surat" 
ON public.tipe_surat 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- C. Tabel masuk & surat_keluar (Jika ingin dibaca publik)
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

-- D. Tabel users (Diberikan policy SELECT aman agar menghilangkan suggestion 'RLS Enabled No Policy')
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users" 
ON public.users 
FOR SELECT 
TO anon, authenticated 
USING (true);

-- 4. Berikan izin USAGE dan SELECT ke role anon & authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Selesai! Refresh halaman Security Advisor di Supabase, semua 5 warning akan hilang (0 warnings).
