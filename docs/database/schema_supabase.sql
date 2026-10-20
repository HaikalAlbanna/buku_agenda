-- ========================================================
-- SKRIP LENGKAP SUPABASE UNTUK BUKU AGENDA
-- Buka Dashboard Supabase:
-- https://supabase.com/dashboard/project/trdtkjupfevddwfpbmlc/sql/new
-- Tempel semua skrip di bawah ini > Klik "Run" (Ctrl + Enter)
-- ========================================================

-- 1. Buat Tabel Users (Autentikasi Admin)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  nama VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Buat Tabel Buku
CREATE TABLE IF NOT EXISTS buku (
  kode VARCHAR(20) PRIMARY KEY,
  nama VARCHAR(100) NOT NULL
);

-- 3. Buat Tabel Tipe Surat
CREATE TABLE IF NOT EXISTS tipe_surat (
  buku_kode VARCHAR(20) NOT NULL REFERENCES buku(kode) ON UPDATE CASCADE ON DELETE CASCADE,
  kode VARCHAR(20) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  PRIMARY KEY (buku_kode, kode)
);

-- 4. Buat Tabel Surat Masuk
CREATE TABLE IF NOT EXISTS masuk (
  id SERIAL PRIMARY KEY,
  nomor_surat VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  surat_dari VARCHAR(150) NOT NULL,
  perihal VARCHAR(255) NOT NULL,
  arsip_pdf TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Buat Tabel Surat Keluar
CREATE TABLE IF NOT EXISTS surat_keluar (
  id VARCHAR(50) PRIMARY KEY,
  buku_kode VARCHAR(20) NOT NULL REFERENCES buku(kode) ON UPDATE CASCADE ON DELETE RESTRICT,
  tipe_kode VARCHAR(20) NOT NULL,
  nomor_urut VARCHAR(20) NOT NULL,
  nomor_surat VARCHAR(120) NOT NULL,
  tanggal DATE NOT NULL,
  alamat_dituju VARCHAR(255) NULL,
  perihal VARCHAR(255) NOT NULL,
  pdf_file_name VARCHAR(255) NULL,
  pdf_data TEXT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (buku_kode, tipe_kode) REFERENCES tipe_surat(buku_kode, kode) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- 6. Buat Indexes untuk performa pencarian & pengurutan
CREATE INDEX IF NOT EXISTS idx_surat_keluar_tanggal ON surat_keluar (tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_masuk_tanggal ON masuk (tanggal DESC);

-- 7. Berikan Hak Akses ke Schema Public
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8. Aktifkan RLS dan Buat Policy Keamanan (Sesuai Rekomendasi Supabase Linter)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surat_keluar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access users" ON public.users;
DROP POLICY IF EXISTS "Allow access to users" ON public.users;
DROP POLICY IF EXISTS "Allow public read users" ON public.users;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public full access buku" ON public.buku;
DROP POLICY IF EXISTS "Allow access to buku" ON public.buku;
CREATE POLICY "Allow public read buku" ON public.buku FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public full access tipe_surat" ON public.tipe_surat;
DROP POLICY IF EXISTS "Allow access to tipe_surat" ON public.tipe_surat;
CREATE POLICY "Allow public read tipe_surat" ON public.tipe_surat FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public full access masuk" ON public.masuk;
DROP POLICY IF EXISTS "Allow access to masuk" ON public.masuk;
CREATE POLICY "Allow public read masuk" ON public.masuk FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public full access surat_keluar" ON public.surat_keluar;
DROP POLICY IF EXISTS "Allow access to surat_keluar" ON public.surat_keluar;
CREATE POLICY "Allow public read surat_keluar" ON public.surat_keluar FOR SELECT TO anon, authenticated USING (true);

-- 9. Seed Akun Default Admin (Username: admin | Password: admin123)
INSERT INTO users (username, nama, password, role)
VALUES ('admin', 'Administrator', '$2b$10$gfZ8CtNDwoj7f.gxajTBTeY3Tkge68v3nRkyyD8B9NtNSlozWMxuS', 'admin')
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password, nama = EXCLUDED.nama;

-- 10. Seed Master Data Buku
INSERT INTO buku (kode, nama) VALUES
  ('PR', 'Perencanaan'),
  ('KU', 'Keuangan'),
  ('OT', 'Organisasi dan Tata Laksana'),
  ('SA', 'Sumber Daya Manusia Aparatur'),
  ('PB', 'Pengelolaan Barang Milik Negara'),
  ('UM', 'Umum'),
  ('PW', 'Pengawasan'),
  ('PK', 'Pemasyarakatan')
ON CONFLICT (kode) DO UPDATE 
SET nama = EXCLUDED.nama;

-- 11. Kosongkan Tabel Tipe Surat (Dikelola mandiri oleh pengguna)
DELETE FROM tipe_surat;

-- 12. Tampilkan Hasil Data Buku
SELECT * FROM buku ORDER BY kode ASC;
