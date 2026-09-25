# Buku Agenda

Aplikasi web untuk manajemen surat keluar, surat masuk, master buku, tipe surat, dan export/backup data.

## 1. Prasyarat

- Node.js 18+ (disarankan Node.js 20 LTS)
- npm 9+
- MySQL 8+ (atau MariaDB kompatibel)
- Git

## 2. Clone Repository

```bash
git clone <URL_REPOSITORY_ANDA>
cd surat-flow
```

## 3. Setup Database

1. Masuk ke MySQL.
2. Buat database:

```sql
CREATE DATABASE penomoran_surat;
```

3. Import skema tabel dari file:

- [`docs/database/schema.sql`](/d:/project/surat-flow/docs/database/schema.sql)

Contoh command:

```bash
mysql -u root -p penomoran_surat < docs/database/schema.sql
```

## 4. Konfigurasi Environment Backend

Buat file `backend/.env` (atau sesuaikan file yang sudah ada):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=penomoran_surat
PORT=5000
```

Catatan:

- Kode backend mendukung `DB_PASSWORD` dan `DB_PASS`.
- Jika password MySQL kosong, biarkan nilainya kosong.

## 5. Install Dependency

Install dependency frontend (root project):

```bash
npm install
```

Install dependency backend:

```bash
cd backend
npm install
cd ..
```

## 6. Menjalankan Aplikasi

Jalankan backend (terminal 1):

```bash
cd backend
npm run dev
```

Jalankan frontend (terminal 2):

```bash
npm run dev
```

## 7. Akses Aplikasi & Akun Login Default

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5000/api`

### Akun Administrator (Bawaan Database)
Aplikasi telah dilengkapi autentikasi keamanan berbasis JWT token & bcrypt hashing. Akun admin otomatis di-generate saat backend pertama kali dijalankan:

- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `Administrator`

*(Pada menu login frontend juga disediakan tombol cepat "Gunakan Akun Demo" untuk langsung mengisi kredensial tersebut)*.

## 8. Struktur Singkat

- `src/`: frontend React + Vite
- `backend/`: API Express + MySQL
- `docs/`: dokumentasi aplikasi dan database

## 9. Dokumentasi Tambahan

- Gambaran aplikasi: [`docs/aplikasi.md`](/d:/project/surat-flow/docs/aplikasi.md)
- Dokumentasi database: [`docs/database/README.md`](/d:/project/surat-flow/docs/database/README.md)
