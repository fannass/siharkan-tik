# SIHARKAN-TIK — Project Documentation (Production Ready)

**Sistem Informasi Harmonisasi Peralatan Komunikasi Polda DIY**  
Versi: 1.0.0 | Status: Production Ready | Build: June 26, 2026

---

## 1. Overview
SIHARKAN-TIK adalah aplikasi manajemen aset dan pemeliharaan alat komunikasi fungsional untuk Bidang TIK Polda DIY. Aplikasi ini menggantikan sistem manual dengan database terpusat berbasis cloud untuk meningkatkan efisiensi monitoring alat, manajemen peminjaman, dan pelacakan perbaikan.

### Fitur Utama
- **Dashboard Real-time**: Ringkasan statistik aset dan status perbaikan menggunakan visualisasi donut chart.
- **Manajemen Alat TIK**: CRUD lengkap untuk berbagai kategori alat (HT, Tower, Repeater, dll.) dengan filter dan search.
- **Manajemen Pinjaman HT**: Pencatatan peminjaman HT oleh Satwil dengan pelacakan tanggal kembali dan status otomatis.
- **Monitoring Suku Cadang**: Inventaris suku cadang dengan sistem peringatan stok minimum (low-stock alert).
- **Tracking Perbaikan**: Sistem tiket aduan perbaikan dengan status progres (Belum $\rightarrow$ Proses $\rightarrow$ Selesai).
- **Manajemen SPPM**: Digitalisasi surat perintah pelaksanaan pekerjaan untuk Mabes dan Polres.
- **Konfigurasi Admin**: Pengaturan profil administrator dan informasi kontak yang dapat diperbarui secara dinamis.

---

## 2. Tech Stack

| Layer | Technology | Role |
|-------|------------|------|
| **Frontend** | React 18 | UI Library |
| **Build Tool** | Vite 5 | Fast bundling & dev server |
| **Routing** | React Router 6 | Client-side routing & protection |
| **Backend** | Supabase | BaaS (Database + Storage + Auth) |
| **Database** | PostgreSQL | Relational data storage |
| **Storage** | Supabase Storage | PDF, DOC, XLS, Images |
| **Styling** | Custom CSS | Design System (Black & Gold Polri) |
| **Deployment** | Vercel | Static site hosting |

---

## 3. Arsitektur Aplikasi

### 3.1 Struktur Folder
```text
src/
├── assets/          # Branding assets (logos)
├── components/      # UI components
│   ├── layout/      # Shell (Sidebar, Topbar, ProtectedRoute)
│   └── ui/          # Atomic components (Table, Button, Modal, Toast, etc.)
├── contexts/        # Global state (AuthContext)
├── hooks/           # Logic reuse (useSearch, usePagination, useToast, useExport)
├── layouts/         # Page wrappers (MainLayout)
├── lib/             # Core configurations (supabase.js)
├── pages/           # Routed views (Dashboard, Inventaris, etc.)
├── routes/          # Routing configuration (AppRoutes)
├── services/        # API layer (CRUD functions for Supabase)
└── utils/           # Helper functions (formatters, export CSV)
```

### 3.2 Data Flow
`UI Component` $\rightarrow$ `Custom Hook` $\rightarrow$ `Service Function` $\rightarrow$ `Supabase Client` $\rightarrow$ `Supabase Cloud`

---

## 4. Database & Storage

### 4.1 PostgreSQL Schema
Database terdiri dari 8 tabel utama:
- **satwil**: Daftar satuan wilayah Polda DIY.
- **kategori**: Jenis alat TIK.
- **inventaris**: Inti aset (FK ke kategori & satwil).
- **pinjaman**: Log peminjaman HT (FK ke inventaris).
- **suku_cadang**: Stok komponen pendukung.
- **tracking**: Log aduan/perbaikan.
- **sppm**: Dokumen surat perintah.
- **admin_config**: Pengaturan administrator.

### 4.2 Security (RLS)
Sistem menggunakan **Row Level Security (RLS)** pada setiap tabel. User yang terautentikasi (`authenticated`) diberikan akses penuh untuk operasi CRUD pada data operasional, sementara data referensi (`satwil`, `kategori`) dibatasi untuk read-only di sisi client.

### 4.3 Storage Bucket
Bucket: `siharkan-tik` (Public Read)
- **Allowed Formats**: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG, JPEG.
- **Max Size**: 10 MB per file.
- **Structure**: Folder-based (`pinjam-ht/`, `tracking/`, `sppm/`).

---

## 5. Panduan Instalasi & Deployment

### 5.1 Local Development
1. Clone repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di root folder:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```
4. Jalankan server:
   ```bash
   npm run dev
   ```

### 5.2 Database Setup (Supabase)
1. Masuk ke **Supabase Dashboard** $\rightarrow$ **SQL Editor**.
2. Jalankan file `supabase/migrations/00001_initial_schema.sql` (Tabel & Seed).
3. Jalankan file `supabase/migrations/00002_rls_and_storage.sql` (RLS & Storage config).

### 5.3 Deployment ke Vercel
1. Push code ke GitHub/GitLab.
2. Hubungkan repo ke Vercel.
3. Tambahkan Environment Variables di Vercel Settings.
4. Deploy. (Konfigurasi `vercel.json` sudah menangani SPA routing).

---

## 6. Panduan Penggunaan (Admin)

### 6.1 Login
Gunakan kredensial default:
- **Username**: `admin.diy`
- **Password**: `********`

### 6.2 Operasi CRUD
- **Tambah Data**: Klik tombol `+ Tambah` $\rightarrow$ Isi Form $\rightarrow$ Simpan.
- **Edit Data**: Klik ikon Edit pada baris tabel $\rightarrow$ Form otomatis terisi $\rightarrow$ Simpan.
- **Hapus Data**: Klik ikon Trash $\rightarrow$ Konfirmasi Modal $\rightarrow$ Hapus.
- **Export**: Klik tombol `Export` untuk mengunduh data yang terfilter dalam format CSV.

### 6.3 Pengelolaan File
- Upload file melalui form terkait (Pinjaman/Tracking/SPPM).
- File divalidasi secara otomatis (Max 10MB & Ekstensi yang diizinkan).

---

## 7. Checklist Produksi

- [x] **Build**: `npm run build` sukses tanpa error.
- [x] **Lint**: 0 error, hanya warning JSX (safe).
- [x] **Performance**: Lazy loading aktif untuk seluruh halaman.
- [x] **Security**: No secret keys in frontend, RLS enabled.
- [x] **UI/UX**: Responsive design, toast notifications, loading states.
- [x] **Auth**: Session persistence via localStorage.
