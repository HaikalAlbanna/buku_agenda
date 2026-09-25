# Dokumentasi Aplikasi Buku Agenda

## Tujuan Aplikasi

Buku Agenda dipakai untuk mengelola:

- surat keluar,
- surat masuk,
- master buku,
- master tipe surat,
- export dan backup data.

## Fitur Utama

1. Dashboard ringkasan jumlah data.
2. Kelola Surat Keluar (CRUD + arsip PDF).
3. Kelola Surat Masuk (CRUD + arsip PDF).
4. Kelola Buku dan Tipe Surat.
5. Export JSON dan Excel.
6. Backup data tahunan ke JSON.

## Arsitektur Singkat

- Frontend: React + TypeScript + Vite.
- Backend: Express.js.
- Database: MySQL.

## Endpoint API

Base URL: `http://localhost:5000/api`

### Buku

- `GET /buku`
- `POST /buku`
- `DELETE /buku/:kode`

### Tipe Surat

- `GET /tipe_surat/:buku_kode`
- `POST /tipe_surat`
- `DELETE /tipe_surat/:kode?buku_kode=...`

### Surat Masuk

- `GET /masuk`
- `POST /masuk`
- `PUT /masuk/:id`
- `DELETE /masuk/:id`

### Surat Keluar

- `GET /surat_keluar`
- `GET /surat_keluar/export`
- `GET /surat_keluar/:id`
- `POST /surat_keluar`
- `PUT /surat_keluar/:id`
- `DELETE /surat_keluar/:id`
