-- ========================================================
-- SKRIP LENGKAP SUPABASE UNTUK BUKU AGENDA
-- Buka Dashboard Supabase > SQL Editor > Tempel skrip ini > Klik "Run"
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
  arsip_pdf TEXT NULL
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
  FOREIGN KEY (buku_kode, tipe_kode) REFERENCES tipe_surat(buku_kode, kode) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_surat_keluar_tanggal ON surat_keluar (tanggal);

-- 6. Nonaktifkan RLS agar Publishable Key dapat melakukan SELECT, INSERT, UPDATE, DELETE penuh
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE buku DISABLE ROW LEVEL SECURITY;
ALTER TABLE tipe_surat DISABLE ROW LEVEL SECURITY;
ALTER TABLE masuk DISABLE ROW LEVEL SECURITY;
ALTER TABLE surat_keluar DISABLE ROW LEVEL SECURITY;

-- 7. Seed Akun Default Admin (Username: admin | Password: admin123)
-- Hash bcrypt untuk 'admin123'
INSERT INTO users (username, nama, password, role)
VALUES ('admin', 'Administrator', '$2a$10$wT5f2rN98c8vjWdD34h7tOQh2U8aD/qZ9V6xK2M9N8w1h6vW2X5G6', 'admin')
ON CONFLICT (username) DO NOTHING;

-- 8. Seed Master Data Buku
INSERT INTO buku (kode, nama) VALUES
  ('PR', 'Perencanaan'),
  ('KU', 'Keuangan'),
  ('OT', 'Organisasi dan Tata Laksana'),
  ('SA', 'Sumber Daya Manusia Aparatur'),
  ('PB', 'Pengelolaan Barang Milik Negara'),
  ('UM', 'Umum'),
  ('PW', 'Pengawasan'),
  ('PK', 'Pemasyarakatan')
ON CONFLICT (kode) DO NOTHING;

-- 9. Seed Master Data Tipe Surat
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
ON CONFLICT (buku_kode, kode) DO NOTHING;
