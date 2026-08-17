# Rencana Implementasi Revisi Sistem Inventaris dan Laporan SIHARKAN TIK

## 1. Tujuan

Mengimplementasikan revisi dari client pada aplikasi SIHARKAN TIK agar:

1. Admin dapat memasukkan jumlah alat secara langsung, misalnya HT Hytera sebanyak 100 unit.
2. Dashboard menampilkan jumlah akumulasi aktual, bukan jumlah baris data.
3. Setiap perubahan stok tercatat dan dapat ditelusuri.
4. Laporan tersedia berdasarkan fitur, item, lokasi, status, dan periode satu bulan.
5. Ekspor Excel tersusun rapi dan terpisah berdasarkan fitur.
6. Data lama tetap dapat digunakan tanpa menyebabkan penghitungan ganda.

## 2. Konteks Project Saat Ini

Aplikasi menggunakan:

- React 18
- Vite
- React Router
- Supabase
- PostgreSQL
- JavaScript JSX
- ESLint

Halaman utama:

- `/` - Dashboard
- `/alat-tik` - Data Alat TIK
- `/pinjaman-ht` - Peminjaman HT
- `/suku-cadang` - Suku Cadang
- `/sppm` - Data SPPM
- `/tracking` - Tracking Perbaikan
- `/kontak-admin` - Kontak Admin

File utama yang relevan:

- `src/pages/DashboardPage.jsx`
- `src/pages/AlatTIKPage.jsx`
- `src/pages/PinjamanHTPage.jsx`
- `src/pages/SukuCadangPage.jsx`
- `src/pages/SPPMPage.jsx`
- `src/pages/TrackingPage.jsx`
- `src/services/inventaris.js`
- `src/services/pinjaman.js`
- `src/services/stats.js`
- `src/hooks/useExport.js`
- `src/utils/exportToCSV.js`
- `src/routes/AppRoutes.jsx`
- `supabase/migrations/`

## 3. Keputusan Konsep Utama

### 3.1 Sistem Hybrid

Gunakan sistem hybrid:

1. Alat yang memiliki nomor seri dapat dicatat per unit.
2. Alat tanpa nomor seri atau stok dalam jumlah besar dicatat sebagai batch.
3. Batch menyimpan jumlah total, bukan membuat satu baris untuk setiap unit.
4. Nomor seri tetap bersifat opsional.
5. Dashboard menggabungkan data unit dan data batch dengan aturan yang jelas.
6. Data rekap lama tidak boleh dijumlahkan ulang bersama data baru jika mewakili aset yang sama.

### 3.2 Contoh Input

Admin memasukkan:

- Kategori: HT
- Merek: Hytera
- Model: HT Series
- Jumlah: 100
- Kondisi: Baik
- Lokasi: Gudang
- Tanggal masuk: 2026-08-01

Sistem menyimpan satu data batch dengan jumlah 100, bukan 100 baris inventaris.

### 3.3 Kondisi Stok

Sistem harus mendukung:

- Total
- Tersedia
- Dipinjam
- Rusak
- Hilang
- Dalam perbaikan
- Dipindahkan
- Dikembalikan
- Koreksi stok

## 4. Aturan Bisnis

### 4.1 Input Inventaris

Form Data Alat TIK harus memiliki dua mode:

#### Mode Per Unit

Digunakan jika alat memiliki identitas individual:

- ID alat
- Nomor seri
- Nama alat
- Merek
- Model
- Kategori
- Kondisi
- Lokasi
- Tanggal masuk

#### Mode Batch

Digunakan untuk input jumlah:

- Nama alat
- Merek
- Model
- Kategori
- Jumlah
- Satuan
- Kondisi
- Lokasi
- Nomor batch, jika tersedia
- Tanggal masuk
- Sumber pengadaan
- Keterangan

### 4.2 Validasi

Mode batch harus memvalidasi:

- Jumlah wajib diisi.
- Jumlah harus berupa angka bulat.
- Jumlah harus lebih besar dari nol.
- Kategori wajib dipilih.
- Lokasi wajib dipilih.
- Kondisi wajib dipilih.
- Tanggal masuk wajib diisi.
- Nomor batch tidak boleh duplikat jika diisi.

Mode per unit harus memvalidasi:

- ID wajib unik.
- Nomor seri tidak boleh duplikat jika diisi.
- Kategori wajib dipilih.
- Lokasi wajib dipilih.
- Kondisi wajib dipilih.
- Tanggal masuk wajib diisi.

Validasi penting harus dilakukan di database atau RPC, bukan hanya di frontend.

### 4.3 Mutasi Stok

Setiap perubahan jumlah harus membuat catatan mutasi.

Jenis mutasi:

- `MASUK`
- `PINJAM`
- `KEMBALI`
- `RUSAK`
- `HILANG`
- `PINDAH`
- `KOREKSI_PLUS`
- `KOREKSI_MINUS`
- `PERBAIKAN`
- `SELESAI_PERBAIKAN`

Setiap mutasi minimal berisi:

- Item atau batch
- Jenis mutasi
- Jumlah
- Tanggal transaksi
- Lokasi asal
- Lokasi tujuan
- Referensi fitur
- Nomor transaksi
- Pengguna pembuat
- Keterangan
- Waktu pembuatan

Stok tersedia tidak boleh diubah secara manual tanpa membuat mutasi.

## 5. Perubahan Database

Buat migration baru. Jangan mengubah migration lama yang sudah pernah dijalankan.

### 5.1 Tabel `inventaris_batch`

Tambahkan tabel untuk menyimpan stok berdasarkan jumlah.

Kolom minimal:

- `id`
- `nama`
- `merk`
- `model`
- `kategori_id`
- `lokasi_id`
- `kondisi`
- `jumlah_awal`
- `jumlah_tersedia`
- `jumlah_dipinjam`
- `jumlah_rusak`
- `jumlah_hilang`
- `satuan`
- `nomor_batch`
- `tanggal_masuk`
- `sumber_pengadaan`
- `keterangan`
- `created_at`
- `updated_at`

Aturan:

- Semua jumlah harus bernilai nol atau lebih.
- `jumlah_awal` tidak boleh negatif.
- `jumlah_tersedia` tidak boleh negatif.
- Foreign key kategori dan lokasi harus valid.
- Tambahkan index untuk kategori, lokasi, kondisi, dan tanggal masuk.

### 5.2 Tabel `inventaris_mutasi`

Tambahkan tabel histori perubahan stok.

Kolom minimal:

- `id`
- `batch_id`
- `inventaris_id`
- `jenis_mutasi`
- `jumlah`
- `tanggal_transaksi`
- `lokasi_asal_id`
- `lokasi_tujuan_id`
- `referensi_fitur`
- `referensi_id`
- `nomor_transaksi`
- `status`
- `keterangan`
- `created_by`
- `created_at`

`batch_id` dipakai untuk stok batch.

`inventaris_id` dipakai untuk alat per unit jika mutasi berkaitan dengan unit tertentu.

### 5.3 Tabel `suku_cadang_mutasi`

Jika laporan Suku Cadang harus akurat per bulan, tambahkan tabel transaksi suku cadang.

Kolom minimal:

- `id`
- `suku_cadang_id`
- `jenis_transaksi`
- `jumlah`
- `tanggal_transaksi`
- `lokasi_id`
- `referensi`
- `keterangan`
- `created_by`
- `created_at`

Jenis transaksi:

- `TERIMA`
- `GUNAKAN`
- `KOREKSI_PLUS`
- `KOREKSI_MINUS`

Kolom saldo lama tetap dapat dipertahankan untuk kompatibilitas, tetapi saldo baru harus dihitung dari transaksi atau diperbarui melalui fungsi database.

### 5.4 RPC atau Database Function

Buat fungsi database atomik untuk:

- Menambahkan batch.
- Membuat mutasi stok.
- Meminjam stok.
- Mengembalikan stok.
- Mengubah kondisi stok.
- Memindahkan stok.
- Melakukan koreksi stok.

Operasi peminjaman harus gagal jika jumlah yang diminta lebih besar daripada stok tersedia.

Operasi pengembalian harus gagal jika jumlah pengembalian tidak valid.

## 6. Migrasi Data Lama

Sebelum migrasi:

1. Backup data Supabase.
2. Identifikasi data detail di `inventaris`.
3. Identifikasi data agregat di `rekap_inventaris`.
4. Tentukan data mana yang merupakan aset yang sama.
5. Hindari menjumlahkan detail unit dan rekap agregat secara bersamaan.
6. Tandai sumber data lama.
7. Simpan data lama sebagai legacy jika belum dapat dipastikan.

Aturan migrasi:

- Data dengan nomor seri tetap berada pada tabel detail unit.
- Data rekap tanpa nomor seri dikonversi menjadi batch awal.
- Jumlah awal batch dibuat dari jumlah rekap yang telah diverifikasi.
- Setiap batch awal memiliki mutasi `MASUK`.
- Data yang tidak dapat dipastikan tidak boleh otomatis dijumlahkan.
- Buat laporan hasil migrasi berisi jumlah sebelum dan sesudah.

## 7. Revisi Service

Buat atau revisi service berikut:

- `src/services/inventaris.js`
- `src/services/inventarisBatch.js`
- `src/services/inventarisMutasi.js`
- `src/services/dashboard.js`
- `src/services/laporan.js`
- `src/services/sukuCadangMutasi.js`
- `src/utils/exportToExcel.js`

Service inventaris harus memisahkan:

- Data detail unit.
- Data batch.
- Data mutasi.
- Statistik agregat.

Jangan menggunakan `array.length` sebagai total stok kecuali data tersebut memang satu baris untuk satu unit.

## 8. Revisi Halaman Data Alat TIK

Pada `AlatTIKPage.jsx`:

1. Tambahkan pilihan mode Input Per Unit dan Input Batch.
2. Tampilkan field sesuai mode.
3. Tambahkan field jumlah pada mode batch.
4. Tambahkan validasi jumlah.
5. Tampilkan tipe data: Unit atau Batch.
6. Tampilkan jumlah stok pada tabel.
7. Tampilkan status jumlah tersedia.
8. Tambahkan aksi lihat detail mutasi.
9. Tambahkan aksi tambah stok melalui transaksi masuk.
10. Hindari membuat 100 baris ketika jumlah yang dimasukkan adalah 100.
11. Pertahankan dukungan data lama.
12. Pisahkan tampilan data legacy jika diperlukan.

Tabel Data Alat TIK minimal menampilkan:

- No
- Nama alat
- Kategori
- Merek
- Model
- Nomor seri atau nomor batch
- Tipe data
- Jumlah awal
- Tersedia
- Dipinjam
- Rusak
- Hilang
- Kondisi
- Lokasi
- Tanggal masuk
- Aksi

## 9. Revisi Dashboard

Dashboard harus mengambil data agregat dari service dashboard.

Kartu utama:

- Total seluruh alat
- Total HT
- Total Repeater
- Total Ransus
- Total Tower
- Total Drone
- Total Call Center
- Total Command Center
- Total Bodycam
- Total unit berserial
- Total stok batch
- Total tersedia
- Total dipinjam
- Total rusak
- Total hilang

Dashboard juga harus menampilkan:

- Ringkasan stok per kategori.
- Ringkasan stok per kondisi.
- Ringkasan stok per lokasi.
- Jumlah alat masuk bulan berjalan.
- Jumlah alat dipinjam bulan berjalan.
- Jumlah alat dikembalikan bulan berjalan.
- Jumlah alat rusak bulan berjalan.
- Jumlah alat dalam perbaikan.
- Peringatan stok rendah.
- Peminjaman yang belum dikembalikan.

Setiap kartu jumlah harus menggunakan jumlah kuantitas, bukan jumlah baris.

Jika data detail dan batch ditampilkan bersamaan, tampilkan sumber dan aturan perhitungannya agar tidak terjadi double counting.

## 10. Revisi Peminjaman HT

Pada `PinjamanHTPage.jsx`:

1. Input peminjaman menggunakan jumlah.
2. Admin memilih item atau batch.
3. Sistem menampilkan stok tersedia.
4. Jumlah pinjaman tidak boleh melebihi stok tersedia.
5. Sistem membuat transaksi `PINJAM`.
6. Sistem mengurangi stok tersedia.
7. Pengembalian membuat transaksi `KEMBALI`.
8. Sistem menambah stok tersedia.
9. Data peminjaman menyimpan:
   - Tanggal pinjam
   - Peminjam
   - Satwil atau lokasi
   - Item
   - Merek
   - Model
   - Jumlah
   - Nomor seri jika tersedia
   - Status
   - Tanggal rencana kembali
   - Tanggal aktual kembali
   - Keterangan
10. Tampilkan total jumlah sedang dipinjam.
11. Tampilkan jumlah peminjaman aktif.
12. Tampilkan peminjaman terlambat.
13. Tampilkan jumlah yang sudah dikembalikan.

Untuk peminjaman batch tanpa nomor seri, pelacakan menggunakan item, batch, jumlah, peminjam, lokasi, dan nomor transaksi.

## 11. Modul Laporan

Buat halaman baru:

- `src/pages/LaporanPage.jsx`

Tambahkan route:

- `/laporan`

Tambahkan navigasi menu Laporan.

### 11.1 Filter Laporan

Filter minimal:

- Bulan
- Tahun
- Fitur
- Kategori
- Item
- Lokasi
- Kondisi
- Status
- Peminjam

Default periode adalah bulan berjalan.

### 11.2 Fitur yang Dilaporkan

Laporan harus mendukung:

1. Data Alat TIK
2. Peminjaman HT
3. Suku Cadang
4. SPPM
5. Tracking Perbaikan

### 11.3 Laporan Data Alat TIK

Kolom minimal:

- Tanggal masuk
- Nama alat
- Kategori
- Merek
- Model
- Nomor seri atau nomor batch
- Jumlah masuk
- Jumlah tersedia
- Jumlah dipinjam
- Jumlah rusak
- Jumlah hilang
- Kondisi
- Lokasi
- Sumber data

### 11.4 Laporan Peminjaman HT

Kolom minimal:

- Tanggal pinjam
- Tanggal rencana kembali
- Tanggal aktual kembali
- Nama peminjam
- Satwil
- Jenis HT
- Merek
- Model
- Nomor seri atau batch
- Jumlah
- Status
- Lama peminjaman
- Keterangan

### 11.5 Laporan Suku Cadang

Kolom minimal:

- Tanggal transaksi
- Nama suku cadang
- Kategori
- Jenis transaksi
- Jumlah masuk
- Jumlah digunakan
- Saldo
- Lokasi
- Referensi
- Keterangan

### 11.6 Laporan SPPM

Gunakan kolom sesuai data yang sudah tersedia, minimal:

- Tanggal
- Nomor dokumen
- Jenis atau kategori
- Sumber
- Tujuan
- Status
- Keterangan

### 11.7 Laporan Tracking Perbaikan

Kolom minimal:

- Tanggal laporan
- Item
- Kategori
- Lokasi
- Keluhan
- Status
- Teknisi atau penanggung jawab
- Tanggal selesai
- Lama perbaikan
- Keterangan

### 11.8 Ringkasan Laporan

Setiap laporan harus menampilkan:

- Periode laporan.
- Tanggal dibuat.
- Total transaksi.
- Total item.
- Total jumlah.
- Subtotal per item.
- Subtotal per kategori.
- Subtotal per lokasi.
- Status transaksi.
- Data kosong jika memang tidak ada transaksi.

## 12. Struktur Excel

Tambahkan dependency Excel yang sesuai project. Gunakan `xlsx` untuk kebutuhan standar atau `exceljs` jika styling lebih lengkap diperlukan.

Buat utilitas:

- `src/utils/exportToExcel.js`

### 12.1 Workbook Gabungan

Gunakan satu workbook dengan sheet:

1. `Ringkasan`
2. `Data Alat TIK`
3. `Mutasi Inventaris`
4. `Peminjaman HT`
5. `Suku Cadang`
6. `SPPM`
7. `Tracking Perbaikan`

### 12.2 Isi Sheet Ringkasan

- Judul laporan
- Periode bulan dan tahun
- Tanggal generate
- Total seluruh alat
- Total per kategori
- Total tersedia
- Total dipinjam
- Total rusak
- Total hilang
- Total transaksi tiap fitur

### 12.3 Aturan Format Excel

Setiap worksheet harus memiliki:

- Judul.
- Periode laporan.
- Header yang jelas.
- Header diberi warna.
- Kolom angka menggunakan format angka.
- Tanggal menggunakan format tanggal.
- Freeze pane pada baris header.
- Autofilter.
- Lebar kolom disesuaikan.
- Baris total atau subtotal.
- Nama sheet maksimal 31 karakter.
- Nama file konsisten, contoh `laporan_siharkan_tik_2026-08.xlsx`.

Data pada Excel harus berasal dari dataset laporan yang sama dengan yang ditampilkan di layar.

Jangan membuat data Excel yang berbeda dari data tabel web.

## 13. Keamanan dan Hak Akses

Atur hak akses:

- Admin dapat melihat, menambah, mengubah, dan membuat mutasi.
- Pengguna biasa hanya dapat melihat data sesuai hak akses.
- Penghapusan data dibatasi.
- Mutasi yang sudah masuk laporan tidak boleh dihapus sembarangan.
- Koreksi dilakukan melalui mutasi koreksi.
- Semua perubahan menyimpan pengguna dan waktu.
- RLS Supabase harus diterapkan pada tabel baru.
- Jangan menyimpan credential di frontend.
- Jangan menonaktifkan RLS untuk mempermudah implementasi.

## 14. Performa

1. Gunakan query agregasi database atau RPC.
2. Jangan mengambil seluruh tabel jika hanya membutuhkan total.
3. Tambahkan index pada kolom tanggal, kategori, lokasi, status, dan foreign key.
4. Gunakan pagination untuk tabel besar.
5. Jangan melakukan fetch berulang tanpa kebutuhan.
6. Setelah mutasi, refresh data yang relevan saja.
7. Hindari perhitungan statistik berulang di banyak halaman.
8. Gunakan satu service sebagai sumber statistik resmi.

## 15. Testing

Tambahkan test untuk:

### Inventaris

- Input batch dengan jumlah 100 menghasilkan satu batch.
- Jumlah tidak boleh nol.
- Jumlah tidak boleh negatif.
- Duplikasi nomor batch ditolak.
- Duplikasi nomor seri ditolak.
- Data unit dan batch dapat dibedakan.
- Dashboard tidak melakukan double counting.

### Mutasi

- Mutasi masuk menambah stok.
- Mutasi pinjam mengurangi stok tersedia.
- Mutasi kembali menambah stok tersedia.
- Mutasi rusak mengurangi stok tersedia.
- Mutasi hilang mengurangi stok tersedia.
- Jumlah pinjaman tidak boleh melebihi stok.
- Mutasi tidak valid ditolak.
- Perubahan stok dilakukan secara atomik.

### Laporan

- Filter bulan bekerja.
- Data hanya berada dalam periode yang dipilih.
- Subtotal per item benar.
- Total per kategori benar.
- Total per lokasi benar.
- Laporan kosong ditampilkan dengan benar.

### Excel

- Workbook berhasil dibuat.
- Semua sheet tersedia.
- Header benar.
- Total sesuai tabel web.
- Format tanggal dan angka benar.
- Data tidak terpotong.

## 16. Urutan Implementasi

Implementasikan secara bertahap:

### Tahap 1 - Analisis

- Periksa struktur project.
- Periksa schema aktif.
- Periksa data lama.
- Tentukan sumber kebenaran.
- Pastikan tidak ada perubahan yang merusak fitur lama.

### Tahap 2 - Database

- Buat migration tabel batch.
- Buat migration tabel mutasi.
- Buat migration transaksi suku cadang jika diperlukan.
- Buat index.
- Buat constraint.
- Buat RLS.
- Buat RPC atomik.

### Tahap 3 - Service

- Buat service batch.
- Buat service mutasi.
- Buat service dashboard.
- Buat service laporan.
- Buat service ekspor Excel.

### Tahap 4 - Form Data Alat TIK

- Tambahkan mode unit dan batch.
- Tambahkan input jumlah.
- Tambahkan validasi.
- Tambahkan tampilan data batch.
- Pertahankan kompatibilitas data lama.

### Tahap 5 - Peminjaman

- Ubah input menjadi jumlah.
- Tambahkan validasi stok.
- Tambahkan mutasi pinjam dan kembali.
- Tampilkan saldo stok.

### Tahap 6 - Dashboard

- Hubungkan dashboard dengan service statistik.
- Tampilkan total kuantitas.
- Tampilkan statistik per kategori, kondisi, dan lokasi.
- Tampilkan aktivitas bulan berjalan.

### Tahap 7 - Laporan

- Buat route dan halaman laporan.
- Tambahkan filter periode.
- Tambahkan laporan per fitur.
- Tambahkan subtotal dan total.

### Tahap 8 - Excel

- Tambahkan library.
- Buat workbook.
- Buat sheet per fitur.
- Tambahkan styling dan total.
- Uji hasil pembukaan file Excel.

### Tahap 9 - Migrasi Data

- Backup.
- Konversi rekap lama menjadi batch awal yang sudah diverifikasi.
- Buat mutasi masuk.
- Validasi jumlah sebelum dan sesudah.
- Catat data yang tidak dapat dimigrasikan otomatis.

### Tahap 10 - Verifikasi

Jalankan:

```bash
npm run lint
npm run build
```

Jika test runner telah ditambahkan, jalankan:

```bash
npm test
```

Jika typecheck telah dikonfigurasi, jalankan:

```bash
npm run typecheck
```

## 17. Kriteria Selesai
Implementasi dianggap selesai jika:
 1. Admin dapat memasukkan HT Hytera sebanyak 100 melalui satu form.
 2. Sistem menyimpan satu batch dengan jumlah 100.
 3. Dashboard menampilkan total 100 unit.
 4. Peminjaman 10 unit mengubah stok tersedia menjadi 90.
 5. Pengembalian 10 unit mengembalikan stok tersedia menjadi 100.
 6. Data peminjaman tercatat dalam laporan bulanan.
 7. Laporan dapat difilter berdasarkan bulan.
 8. Laporan tersusun per fitur dan per item.
 9. Excel memiliki sheet terpisah dan rapi.
10. Tidak ada penghitungan ganda antara data legacy, unit, dan batch.
11. Data lama tetap dapat dibaca.
12. Lint dan build berhasil.
13. Proses utama memiliki test yang memadai.
## ## 18. Instruksi untuk AI Implementer
Bertindak sebagai senior full-stack engineer yang memahami React, Supabase, PostgreSQL, dan sistem inventaris.
Sebelum mengubah kode:
 1. Baca struktur project.
 2. Baca file yang relevan.
 3. Baca migration Supabase.
 4. Baca service dan halaman yang berkaitan.
 5. Periksa pola coding yang sudah digunakan.
 6. Jangan mengarang nama tabel, kolom, atau dependency tanpa memeriksa project.
 7. Jangan menghapus fitur lama tanpa alasan.
 8. Jangan membuat data ganda.
 9. Jangan menambahkan komentar kode kecuali benar-benar diperlukan.
10. Gunakan migration baru untuk perubahan database.
11. Ikuti pola UI yang sudah ada.
12. Pastikan data yang ditampilkan dashboard dan Excel berasal dari sumber yang sama.
13. Setelah setiap tahap besar, jalankan validasi yang tersedia.
14. Jika menemukan konflik desain, prioritaskan konsep batch, mutasi, laporan bulanan, dan pencegahan double counting.
15. Jika informasi penting belum tersedia, berhenti dan tanyakan sebelum membuat asumsi yang berisiko.
Sebelum menyatakan selesai, tampilkan:
- Daftar file yang diubah.
- Ringkasan perubahan.
- Migration yang dibuat.
- Test yang dijalankan.
- Hasil lint.
- Hasil build.
- Risiko atau pekerjaan lanjutan.
Ambil waktu untuk memahami seluruh codebase dan pikirkan implementasi ini secara menyeluruh sebelum mulai mengubah file.
