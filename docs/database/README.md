# Dokumentasi Database

## Nama Database

`penomoran_surat`

## File Skema

Skema SQL ada di file:

- [`schema.sql`](/d:/project/surat-flow/docs/database/schema.sql)

## Tabel Utama

1. `buku`: master buku surat.
2. `tipe_surat`: master tipe surat per buku.
3. `masuk`: data surat masuk.
4. `surat_keluar`: data surat keluar.

## Cara Import

```bash
mysql -u root -p penomoran_surat < docs/database/schema.sql
```
