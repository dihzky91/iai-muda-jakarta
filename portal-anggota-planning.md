# Portal Anggota IAI Muda Jakarta — Rencana Pengembangan

## 1. Latar Belakang

Saat ini website IAI Muda DKI Jakarta hanya memiliki:
- Halaman publik (profil organisasi, struktur pengurus, event, artikel, galeri)
- Admin CMS (superadmin/admin/editor) untuk kelola konten

**Tidak ada** area khusus untuk anggota/pengurus (aktif maupun alumni).

Portal Anggota bertujuan menjadi **wadah eksklusif** bagi seluruh anggota IAI Muda — baik pengurus aktif, demisioner, maupun alumni — untuk terhubung, mengelola profil, dan mengakses sumber daya internal.

---

## 2. Tujuan

| Tujuan | Deskripsi |
|---|---|
| **Database anggota terpusat** | Data anggota tidak hilang setelah demisioner |
| **Self-service profil** | Anggota bisa update data sendiri (foto, bio, kontak) |
| **Onboarding terstruktur** | Pengurus baru mendapat akses panduan, dokumen, kontak |
| **Jaringan alumni** | Mempertahankan koneksi antar generasi kepengurusan |
| **Transparansi regenerasi** | Riwayat kepengurusan terdokumentasi per individu |

---

## 3. Target Pengguna

### Tahap 1 (MVP)
- **Pengurus Aktif** — anggota kepengurusan generasi saat ini
- **Pengurus Demisioner** — alumni kepengurusan sebelumnya

### Tahap 2 (Setelah MVP)
- **Anggota IAI Muda non-pengurus** — peserta kegiatan, komunitas
- **Pembina / Dewan Penasihat**

---

## 4. Gambaran Arsitektur

```
┌─────────────────────────────────────────┐
│           Halaman Publik                 │
│  (struktur, event, artikel, galeri)      │
└────────────────┬────────────────────────┘
                 │ (tidak perlu login)
┌────────────────▼────────────────────────┐
│          Portal Anggota (/member/*)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │  Profil   │ │Direktori │ │Onboarding│ │
│  │  Saya     │ │ Anggota  │ │   Kit    │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐              │
│  │Riwayat   │ │Pengaturan│              │
│  │Organisasi│ │  Akun    │              │
│  └──────────┘ └──────────┘              │
└────────────────┬────────────────────────┘
                 │ (JWT auth — cookie)
┌────────────────▼────────────────────────┐
│          Admin CMS (/admin/*)            │
│  (superadmin/admin/editor)               │
│  - Manage data anggota                   │
│  - Approve/aktivasi akun anggota         │
│  - Upload dokumen onboarding             │
└─────────────────────────────────────────┘
```

---

## 5. Database — Perubahan Skema

### Tabel Baru: `member_accounts`

```typescript
// db/schema.ts — tambahan
export const memberAccounts = mysqlTable('member_accounts', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull().unique().references(() => members.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isVerified: boolean('is_verified').default(false).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Migrasi Tambahan di `members`

```typescript
// Kolom tambahan di tabel members (jika belum ada)
phone: varchar('phone', { length: 20 }),        // baru
whatsapp: varchar('whatsapp', { length: 20 }),   // baru
isAlumni: boolean('is_alumni').default(false),   // baru — penanda alumni
```

### Tabel Baru (Tahap 2): `onboarding_documents`

```typescript
export const onboardingDocuments = mysqlTable('onboarding_documents', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  fileUrl: varchar('file_url', { length: 500 }),
  category: varchar('category', { length: 100 }), // 'panduan', 'dokumen', 'template'
  sortOrder: int('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## 6. API Endpoints

### Auth (Anggota)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/member/auth/login` | Login anggota |
| POST | `/api/member/auth/logout` | Logout |
| GET | `/api/member/auth/me` | Cek session |
| POST | `/api/member/auth/change-password` | Ganti password |

### Profil

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/member/profile` | Ambil profil sendiri |
| PUT | `/api/member/profile` | Update profil (foto, bio, kontak, dll) |
| POST | `/api/member/profile/image` | Upload foto profil |

### Direktori Anggota (Tahap 2)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/member/directory` | Cari/lihat anggota lain (search, filter) |
| GET | `/api/member/directory/:id` | Detail profil anggota lain |

### Onboarding (Tahap 2)

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/api/member/onboarding` | Ambil dokumen onboarding |

### Admin (kelola anggota)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/admin/member-accounts` | Buatkan akun untuk anggota (admin-only) |
| GET | `/api/admin/member-accounts` | List status akun anggota |
| PUT | `/api/admin/member-accounts/:id/toggle` | Aktif/nonaktifkan akun |
| DELETE | `/api/admin/member-accounts/:id` | Hapus akun |

---

## 7. Halaman / Routes

### Frontend (App Router)

| Route | Halaman | Akses |
|---|---|---|
| `/member/login` | Login anggota | Publik |
| `/member/dashboard` | Dashboard anggota | Login |
| `/member/profile` | Edit profil sendiri | Login |
| `/member/profile/:id` | Lihat profil anggota lain | Login |
| `/member/directory` | Direktori anggota | Login |
| `/member/onboarding` | Dokumen onboarding | Login |
| `/member/settings` | Pengaturan akun | Login |

### Komponen Baru

```
src/components/member/
├── MemberLayout.tsx       # Layout sidebar navigasi
├── MemberDashboard.tsx    # Dashboard utama (MVP: ringkasan profil)
├── MemberProfileEdit.tsx  # Form edit profil
├── MemberDirectory.tsx    # Direktori anggota (search + filter)
├── MemberOnboarding.tsx   # Dokumen onboarding
└── MemberLoginForm.tsx    # Form login anggota
```

---

## 8. Alur Auth

### Login
```
1. Anggota buka /member/login
2. Input email + password
3. POST /api/member/auth/login → validasi
4. Set cookie auth_token (sama seperti admin cookie)
5. Redirect ke /member/dashboard
```

### Registrasi (dibuatkan oleh admin)
```
1. Admin di CMS → tab "Anggota" → "Buatkan Akun"
2. Pilih member → input password awal
3. System buat record di member_accounts
4. Admin kasih tau credentials ke anggota (manual via WA/email)
```

### Reset Password (Tahap 2)
```
1. Anggota klik "Lupa Password"
2. Masukkan email → dapat token reset (via email)
3. Reset password
```

---

## 9. Prioritas MVP (Tahap 1)

Urutan implementasi:

| # | Fitur | Estimasi | Ketergantungan |
|---|---|---|---|
| 1 | Tambah tabel `member_accounts` + migrasi DB | 1 hari | - |
| 2 | API login/logout/me + JWT untuk anggota | 1 hari | #1 |
| 3 | Halaman login anggota (`/member/login`) | 1 hari | #2 |
| 4 | Dashboard anggota sederhana + layout | 1 hari | #3 |
| 5 | Edit profil sendiri (foto, bio, kontak) | 1-2 hari | #4 |
| 6 | Admin: fitur buatkan akun anggota | 1 hari | #1 |
| **Total** | **MVP** | **6-7 hari** | |

### Tahap 2

| # | Fitur | Estimasi |
|---|---|---|
| 7 | Direktori anggota (search + filter) | 1-2 hari |
| 8 | Lihat profil anggota lain | 1 hari |
| 9 | Onboarding documents | 2 hari |
| 10 | Fitur lupa/reset password | 1 hari |
| 11 | Role alumni vs aktif (filter direktori) | 1 hari |

---

## 10. Pertimbangan & Resiko

### Pro
- **Ekosistem organisasi lebih solid** — anggota tetap terhubung setelah demisioner
- **Data lebih akurat** — anggota update data sendiri
- **Efisiensi admin** — tidak perlu manual tanyain data tiap anggota
- **Onboarding lebih rapi** — pengurus baru siap lebih cepat

### Kontra / Resiko
- **Kompleksitas baru** — fitur auth, reset password, verifikasi
- **Adopsi tidak pasti** — anggota mungkin tidak termotivasi login rutin
- **Maintenance jangka panjang** — perlu urus akun, keamanan, support
- **Privasi data** — data kontak anggota terekspos di direktori

### Mitigasi
- MVP minimal dulu (profil saja) — jangan langsung full portal
- Jadikan login **opsional** — fitur publik tetap bisa diakses tanpa login
- Direktori anggota hanya menampilkan data yang diizinkan (opt-in)
- Beri insentif: akses ke dokumen eksklusif, jaringan alumni, CV builder

---

## 11. Kesimpulan & Rekomendasi

Portal Anggota layak dibangun ** jika prioritasnya adalah retensi anggota dan keberlanjutan organisasi ** antar generasi. Tapi jangan langsung kompleks.

**Rekomendasi:**
1. Mulai dari **Tahap 1 (MVP)** — cukup login + edit profil + admin buatkan akun
2. Evaluasi setelah 1-2 bulan — apakah anggota aktif pakai?
3. Baru lanjut ke Tahap 2 (direktori + onboarding + fitur lanjutan)

Estimasi total MVP: **6-7 hari kerja** (dikerjakan terpisah, tidak mengganggu fitur website yang sudah jalan).

---

*Dokumen ini bisa kamu edit sesuai prioritas. Kalau setuju lanjut MVP, saya bisa mulai dari pembuatan tabel `member_accounts` dan API auth anggota.*
