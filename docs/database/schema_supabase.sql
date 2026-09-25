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
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 8. Aktifkan RLS dan Buat Policy Akses Penuh (Agar Publishable Key bisa SELECT, INSERT, UPDATE, DELETE)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE buku ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipe_surat ENABLE ROW LEVEL SECURITY;
ALTER TABLE masuk ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_keluar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public full access users" ON users;
CREATE POLICY "Public full access users" ON users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access buku" ON buku;
CREATE POLICY "Public full access buku" ON buku FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access tipe_surat" ON tipe_surat;
CREATE POLICY "Public full access tipe_surat" ON tipe_surat FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access masuk" ON masuk;
CREATE POLICY "Public full access masuk" ON masuk FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access surat_keluar" ON surat_keluar;
CREATE POLICY "Public full access surat_keluar" ON surat_keluar FOR ALL USING (true) WITH CHECK (true);

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

-- 11. Seed Master Data Tipe Surat
INSERT INTO tipe_surat (buku_kode, kode, nama) VALUES
  ('PR', '01.01', 'Kebijakan Perencanaan'),
  ('PR', '01.02', 'Program dan Anggaran'),
  ('KU', '02.01', 'Kebijakan Keuangan'),
  ('KU', '02.02', 'Perbendaharaan'),
  ('OT', '03.01', 'Kelembagaan'),
  ('OT', '03.02', 'Ketatalaksanaan'),
  ('SA', '04.01', 'Formasi dan Pengadaan'),
  ('SA', '04.02', 'Mutasi dan Promosi'),
  ('PB', '05.01', 'Perencanaan Kebutuhan'),
  ('PB', '05.02', 'Pengadaan BMN'),
  ('UM', '06.01', 'Tata Usaha'),
  ('UM', '06.02', 'Rumah Tangga'),
  ('PW', '07.01', 'Kebijakan Pengawasan'),
  ('PW', '07.02', 'Audit Internal'),
  ('PK', '08.01', 'Pembinaan Narapidana'),
  ('PK', '08.02', 'Keamanan dan Ketertiban')
ON CONFLICT (buku_kode, kode) DO UPDATE 
SET nama = EXCLUDED.nama;

-- 12. Tampilkan Hasil Data Buku
SELECT * FROM buku ORDER BY kode ASC;
