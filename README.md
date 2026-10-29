# 🚗 Smart Bengkel Management & Live Queue System
> **Proyek Berbasis Proyek (PjBL) FTTI Unjaya** — Kolaborasi 4 Program Studi (Teknik Industri, Sistem Informasi, Informatika, Teknologi Informasi).

Sistem ekosistem digital terintegrasi yang dirancang khusus untuk memodernisasi operasional bengkel otomotif dengan studi kasus pada **Bekti Auto Solution Bengkel Mobil Injeksi Spesialis Nissan dan Umum**. 

Sistem ini menggabungkan aplikasi pelanggan berbasis **PWA (Progressive Web App)** untuk antrean transparan dan **Point of Sale (POS) Internal** pintar untuk efisiensi operasional bengkel.

---

## 🛠️ Tech Stack & Arsitektur

Project ini dikembangkan menggunakan pendekatan **Decoupled Architecture** dalam satu repositori (*monorepo*):

- **Backend API:** Laravel 11 (REST API, Sanctum Authentication, Eloquent ORM)
- **Frontend App:** React.js (Vite + TypeScript) & Tailwind CSS v4
- **Database:** PostgreSQL
- **Real-Time Synchronization:** Socket.io / Pusher / WebSockets
- **Third-Party Services:** WhatsApp API Gateway & Google Gemini API (AI Insights)

---

## 📂 Struktur Repositori

```text
smart-bengkel/
├── backend-api/      # Service API Engine (Laravel 11 & PostgreSQL)
├── frontend-app/     # Interface PWA Customer & Internal Smart POS (React Vite)
└── README.md         # Dokumentasi Utama Proyek
```

---

## 💡 Fitur Utama Ekosistem

### 1. Public Customer Portal (PWA Customer)
- **Express Check-in:** Pendaftaran antrean mandiri via pemindaian QR Code tanpa perlu di-install.
- **Live Queue Ticket:** Pemantauan status pengerjaan mobil dan estimasi waktu tunggu secara *real-time*.
- **E-Service Logbook:** Buku servis digital untuk memantau riwayat pemeliharaan kendaraan.
- **In-Shop Digital Catalog:** Katalog *sparepart* dan jasa servis yang transparan.

### 2. Internal Smart POS & Management System
- **Dual-Flow Transaction:** Opsi transaksi *Member Scan* dan *Fast-Track 1-Click* untuk pelanggan umum.
- **Smart Inventory Alert:** Peringatan stok kritis menggunakan kalkulasi *Reorder Point* (ROP) & EOQ.
- **Role-Based Access Control (RBAC):** Pembagian hak akses terisolasi untuk Owner, Kasir, dan Mekanik.
- **AI Executive Summary:** Ringkasan finansial dan wawasan operasional harian berbasis AI untuk Pemilik Bengkel.

---

## 🤝 Kontribusi Multidisiplin 4 Prodi FTTI

| Program Studi | Fokus Kontribusi & Responsibilitas |
| :--- | :--- |
| **Teknik Industri** | Pemetaaan alur antrean, analisis *Standard Time* pengerjaan, dan formula matematis *Reorder Point* (ROP/EOQ) stok. |
| **Sistem Informasi** | Perancangan UI/UX (PWA & POS), analisis alur proses bisnis (*As-Is & To-Be*), serta pemetaaan kebutuhan pengguna. |
| **Informatika** | Pengembangan RESTful API Laravel 11, skema database PostgreSQL, integrasi Gemini API, dan algoritma antrean. |
| **Teknologi Informasi** | Pengelolaan infrastruktur jaringan lokal/cloud, keamanan sistem (RBAC), jaringan *real-time*, dan *deployment*. |

---

## 🚀 Panduan Memulai (Quick Start)

### Prasyarat System
- Node.js (v18+)
- PHP (v8.2+) & Composer
- PostgreSQL Server

### 1. Setup Backend (Laravel API)
```bash
cd backend-api
composer install
cp .env.example .env
# Sesuaikan kredensial PostgreSQL pada file .env
php artisan key:generate
php artisan migrate
php artisan serve
```
*Backend API akan berjalan di: `http://localhost:8000`*

### 2. Setup Frontend (React App)
```bash
cd frontend-app
npm install --legacy-peer-deps
npm run dev
```
*Frontend App akan berjalan di: `http://localhost:5173`*

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk keperluan akademis **Project-Based Learning (PjBL) Fakultas Teknologi dan Informatika (FTTI), Universitas Jendral Achmad Yani Yogyakarta (Unjaya)**.
