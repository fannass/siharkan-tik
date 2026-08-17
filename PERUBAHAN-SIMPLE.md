# Dokumentasi Perubahan Sistem SIHARKAN TIK

## Perubahan Utama

### 1. Input Inventaris Lebih Mudah
**Sebelum:** Setiap alat harus diinput satu per satu, bahkan untuk 100 unit.
**Sekarang:** Bisa langsung input jumlah (misal: HT Hytera 100 unit). Sistem otomatis menyimpan sebagai 1 batch.

### 2. Tampilan Data Alat TIK
Tabel sekarang menunjukkan:
- **Unit berserial** (alat dengan nomor seri, misal: HT-REAL-001)
- **Batch** (alat tanpa nomor seri, diinput berdasarkan jumlah)
- Kolom: Total, Tersedia, Dipinjam, Rusak, Hilang

### 3. Dashboard Statistik
Dashboard sekarang menampilkan kartu informasi:
- Total Alat, Tersedia, Dipinjam, Rusak, Hilang
- Statistik per kategori (HT, Repeater, Tower, dll)
- Aktivitas bulan berjalan

### 4. Peminjaman HT
- Bisa pinjam berdasarkan jumlah (bisa pinjam sebagian dari batch)
- Bisa mengembalikan sebagian
- Status otomatis: Dipinjam, Dikembalikan Sebagian, Dikembalikan, Terlambat
- Stok otomatis berkurang saat pinjam, bertambah saat kembali

### 5. Laporan Bulanan
Halaman baru `/laporan` dengan filter bulan:
- Data Alat TIK, Peminjaman HT, Suku Cadang, SPPM, Tracking
- Tampilan ringkasan dan detail per fitur
- Ekspor Excel dengan sheet terpisah

### 6. Export Excel
Sekarang bisa export ke Excel (.xlsx) dengan struktur:
- Sheet "Ringkasan"
- Sheet "Data Alat TIK"
- Sheet "Peminjaman HT"
- Sheet "Suku Cadang"
- Sheet "SPPM"
- Sheet "Tracking Perbaikan"

## Perubahan Database
- Tabel baru: `inventaris_batch` (stok berdasarkan jumlah)
- Tabel baru: `inventaris_mutasi` (riwayat perubahan stok)
- Kolom baru di `pinjaman`: jumlah, jumlah_dikembalikan, batch_id
- Fungsi otomatis untuk mengurangi/menambah stok

## Keuntungan
- Input lebih cepat (tidak perlu 100 baris untuk 100 unit)
- Stok selalu akurat (otomatis berubah saat pinjam/kembali)
- Laporan bisa di-filter per bulan
- Excel lebih terstruktur dan rapi
- Data lama (4.184 HT) tetap aman, tidak dihitung dua kali

## Catatan
- Migration database perlu dijalankan terlebih dahulu di Supabase
- Setelah migrasi, fitur baru sudah aktif