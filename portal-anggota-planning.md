# Portal Anggota IAI Muda Jakarta — Rencana Pengembangan

**Domain:** `imud.iaijakarta.or.id`  
**Status:** Planning → Implementation (Bertahap)  
**Design:** Modern (berbeda dari Admin CMS)  
**Last Updated:** 22 Juli 2026

---

## 1. Latar Belakang

Saat ini website IAI Muda DKI Jakarta (`imud.iaijakarta.or.id`) hanya memiliki:
- Halaman publik (profil organisasi, struktur pengurus, event, artikel, galeri)
- Admin CMS (superadmin/admin/editor) untuk kelola konten

**Tidak ada** area khusus untuk anggota/pengurus (aktif maupun alumni).

Portal Anggota bertujuan menjadi **wadah eksklusif** bagi seluruh anggota IAI Muda — baik pengurus aktif, demisioner, maupun alumni — untuk terhubung, mengelola profil, dan mengakses sumber daya internal.

### Prinsip Kontrol
- ✅ **Admin CMS = Source of Truth** — Kontrol penuh atas visibility dan akun portal
- ✅ **Member Portal = Self-Service** — Anggota hanya edit profil sendiri
- ✅ **Privacy First** — Tidak ada navbar publik, member tidak bisa "nyempil" ke halaman publik tanpa approval admin

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

## 3. Struktur URL

```
imud.iaijakarta.or.id
│
├── / (Halaman Publik — tidak perlu login)
│   ├── /                    → Homepage
│   ├── /about              → Tentang IAI Muda
│   ├── /structure          → Struktur Organisasi (hanya member dengan showPublic=true)
│   ├── /events             → Event
│   ├── /articles           → Artikel
│   ├── /gallery            → Galeri
│   └── /contact            → Kontak
│
├── /admin/* (Portal Admin — existing)
│   ├── /admin/login        → Login admin (username/password)
│   ├── /admin              → Dashboard admin
│   ├── /admin/members      → Kelola data anggota + kontrol visibility
│   └── ...                 → (CMS lengkap sudah ada)
│
└── /member/* (Portal Anggota — BARU)
    ├── /member/login       → Login anggota (email/password)
    ├── /member/dashboard   → Dashboard anggota (modern design)
    ├── /member/profile     → Edit profil sendiri
    ├── /member/directory   → Direktori anggota (Tahap 2)
    ├── /member/onboarding  → Dokumen onboarding (Tahap 2)
    └── /member/settings    → Pengaturan akun (ganti password)
```

**Catatan:**
- Tidak ada link "Portal Anggota" di navbar publik (akses langsung via URL)
- Portal anggota pakai design modern (card-based, gradients, micro-interactions)
- Admin portal tetap utilitarian/minimalist

---

## 4. Target Pengguna

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

### 5.1. Tabel Baru: `member_accounts`

```typescript
// db/schema.ts — tambahan
export const memberAccounts = mysqlTable('member_accounts', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull().unique()
    .references(() => members.id, { onDelete: 'cascade' }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

**Relasi:**
- 1 member bisa punya 0 atau 1 akun portal (optional)
- Cascade delete: hapus member → hapus akun portal otomatis

---

### 5.2. Update Tabel `members` (existing)

```typescript
// Kolom tambahan di tabel members
phone: varchar('phone', { length: 20 }),              // baru
whatsapp: varchar('whatsapp', { length: 20 }),        // baru
isAlumni: boolean('is_alumni').default(false),        // baru — penanda alumni
showPublic: boolean('show_public').default(true),     // baru — kontrol visibility
```

**Field `showPublic` (PENTING):**
- Diatur HANYA oleh admin di CMS
- `true` = muncul di halaman publik `/structure`
- `false` = tidak muncul di halaman publik (tapi tetap bisa login portal jika punya akun)
- Member TIDAK bisa mengubah field ini dari portal

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

## 8. Alur Auth & Kontrol Visibility

### 8.1. Login Member
```
1. Anggota buka imud.iaijakarta.or.id/member/login
2. Input email + password
3. POST /api/member/auth/login → validasi member_accounts
4. Set cookie auth_token dengan payload berbeda dari admin:
   {
     memberId: number,
     email: string,
     type: 'member'  // discriminator untuk prevent privilege escalation
   }
5. Redirect ke /member/dashboard
```

### 8.2. Registrasi Akun (Admin-Only)
```
1. Admin di CMS → tab "Kepengurusan" → pilih member
2. Klik "Buatkan Akun Portal"
3. Input password awal
4. System:
   - Buat record di member_accounts
   - Hash password dengan bcrypt
   - (Optional) Kirim email welcome otomatis
5. Admin kasih tau credentials ke anggota (via WA/email manual)
```

### 8.3. Flow Kontrol Visibility (Admin → Publik)

#### **Scenario A: Tambah Pengurus Tanpa Akun Portal**
```
1. Admin CMS → Tambah Pengurus Baru
   ├─ Isi: Nama, Posisi, Divisi, Email, Foto, dll
   ├─ Toggle: "Tampilkan di Halaman Publik" ✅ ON
   └─ Toggle: "Buatkan Akun Portal" ❌ OFF

2. Insert ke database:
   ├─ members: showPublic = true
   └─ member_accounts: (tidak ada record)

3. Hasil:
   ✅ Muncul di halaman publik /structure
   ❌ TIDAK bisa login ke portal anggota
```

#### **Scenario B: Tambah Pengurus + Buatkan Akun**
```
1. Admin CMS → Tambah Pengurus Baru
   ├─ Isi data lengkap
   ├─ Toggle: "Tampilkan di Halaman Publik" ✅ ON
   └─ Toggle: "Buatkan Akun Portal" ✅ ON → Input password

2. Insert ke database:
   ├─ members: showPublic = true
   └─ member_accounts: passwordHash, isActive = true

3. Hasil:
   ✅ Muncul di halaman publik /structure
   ✅ Bisa login ke portal anggota
   ✅ Bisa edit profil sendiri (bio, foto, phone, whatsapp)
```

#### **Scenario C: Member Edit Profil (Tidak Ubah Visibility)**
```
1. Member login portal → /member/profile → Edit bio, foto, phone

2. Update database:
   ├─ members.bio = "..." (update)
   ├─ members.imageUrl = "..." (update)
   ├─ members.phone = "..." (update)
   └─ members.showPublic = (TIDAK BERUBAH, tetap sesuai setting admin)

3. Halaman publik /structure:
   ├─ Jika showPublic = true → perubahan langsung terlihat
   └─ Jika showPublic = false → tetap tidak muncul

**Member TIDAK punya akses untuk toggle showPublic**
```

#### **Scenario D: Admin Sembunyikan dari Publik**
```
1. Admin CMS → Edit member → Toggle "Tampilkan di Halaman Publik" ❌ OFF

2. Update: members.showPublic = false

3. Hasil:
   ❌ Tidak muncul di halaman publik /structure
   ✅ Member tetap bisa login portal (jika punya akun)
   ✅ Data tetap ada di database
   ✅ Bisa diaktifkan kembali kapan saja
```

### 8.4. Reset Password (Tahap 2)
```
1. Anggota klik "Lupa Password" di /member/login
2. Masukkan email → dapat token reset (via email)
3. Klik link reset → set password baru
```

---

## 9. Roadmap Implementasi (Bertahap)

### **Week 1: Foundation (Database + Auth Backend)**

| # | Task | Estimasi | Output |
|---|---|---|---|
| 1 | Migration: tabel `member_accounts` + update `members` | 0.5 hari | Schema siap |
| 2 | Update `lib/auth.ts` untuk support member JWT | 0.5 hari | Dual auth (admin/member) |
| 3 | API `/api/member/auth/login` | 0.5 hari | Login member works |
| 4 | API `/api/member/auth/logout` | 0.5 hari | Logout works |
| 5 | API `/api/member/auth/me` | 0.5 hari | Session check works |
| 6 | Testing auth dengan Postman/curl | 0.5 hari | Backend verified |

**Deliverable:** Backend auth member selesai, bisa test via API tools

---

### **Week 2: Frontend Login + Dashboard**

| # | Task | Estimasi | Output |
|---|---|---|---|
| 7 | Halaman `/member/login` (modern design) | 1 hari | Login page |
| 8 | Component `MemberLayout` (sidebar modern) | 1 hari | Layout siap |
| 9 | Halaman `/member/dashboard` sederhana | 1 hari | Dashboard MVP |
| 10 | Protected routes & middleware | 0.5 hari | Security jalan |
| 11 | Redirect logic (unauthorized → login) | 0.5 hari | UX smooth |

**Deliverable:** Member bisa login dan lihat dashboard

---

### **Week 3: Profile Management**

| # | Task | Estimasi | Output |
|---|---|---|---|
| 12 | API `PUT /api/member/profile` | 0.5 hari | Update profile backend |
| 13 | API `POST /api/member/profile/image` | 0.5 hari | Upload foto |
| 14 | Halaman `/member/profile` (edit form) | 1.5 hari | Edit profil frontend |
| 15 | Integrasi ImageUploader (reuse dari admin) | 0.5 hari | Upload foto works |
| 16 | Halaman `/member/settings` (ganti password) | 1 hari | Change password |

**Deliverable:** Member bisa edit profil lengkap & ganti password

---

### **Week 4: Admin Integration**

| # | Task | Estimasi | Output |
|---|---|---|---|
| 17 | API `POST /api/admin/member-accounts` | 0.5 hari | Buatkan akun (backend) |
| 18 | API `GET /api/admin/member-accounts` | 0.5 hari | List akun member |
| 19 | API `PUT /api/admin/member-accounts/:id/toggle` | 0.5 hari | Aktif/nonaktifkan |
| 20 | Update UI Admin CMS: toggle "Tampil di Publik" | 1 hari | Kontrol visibility |
| 21 | Update UI Admin CMS: buatkan akun portal | 1 hari | Admin create account |
| 22 | Update query `/structure` pakai filter `showPublic` | 0.5 hari | Public page fixed |
| 23 | Testing end-to-end & bug fixes | 1 hari | MVP stable |

**Deliverable:** MVP complete! Admin bisa kelola akun, member bisa self-service profil

---

### **Total Estimasi MVP: 4 Minggu (20 hari kerja)**

### **Tahap 2: Advanced Features (Post-MVP)**

| # | Fitur | Estimasi | Priority |
|---|---|---|---|
| 24 | Direktori anggota (search + filter) | 2 hari | HIGH |
| 25 | Lupa/reset password via email | 1 hari | HIGH |
| 26 | Lihat profil anggota lain | 1 hari | MEDIUM |
| 27 | Onboarding documents (upload & download) | 2 hari | MEDIUM |
| 28 | Filter alumni vs aktif di direktori | 1 hari | LOW |
| 29 | Email welcome otomatis (Nodemailer/Resend) | 1 hari | LOW |
| 30 | Profile completeness indicator | 0.5 hari | LOW |

**Total Estimasi Tahap 2: ~2 Minggu**

---

## 10. Security & Access Control

### 10.1. Access Matrix

| Aksi | Admin CMS | Portal Anggota |
|------|-----------|----------------|
| Tambah member baru | ✅ | ❌ |
| Hapus member | ✅ | ❌ |
| Set `showPublic` (visibility) | ✅ | ❌ |
| Buatkan akun portal | ✅ | ❌ |
| Nonaktifkan akun member | ✅ | ❌ |
| Reset password member (admin) | ✅ | ❌ |
| Edit posisi/divisi member | ✅ | ❌ |
| Edit bio/foto sendiri | ❌ | ✅ (own profile) |
| Edit phone/whatsapp sendiri | ❌ | ✅ (own profile) |
| Ganti password sendiri | ❌ | ✅ |
| Lihat profil anggota lain | ❌ | ✅ (Tahap 2) |

### 10.2. JWT Token Separation

**Admin Token:**
```typescript
{
  userId: number,
  username: string,
  role: 'superadmin' | 'admin' | 'editor'
}
```

**Member Token:**
```typescript
{
  memberId: number,
  email: string,
  type: 'member'  // ← discriminator penting
}
```

**Middleware validation:**
- Admin endpoints: `requireRole(user, 'superadmin', 'admin')`
- Member endpoints: `requireType(user, 'member')`
- Prevent: member token akses admin endpoint dan sebaliknya

---

## 11. Admin CMS UI Enhancement

### 11.1. Tab Kepengurusan — Card Member (Update)

**Before (existing):**
```
┌────────────────────────────────────────────┐
│ [Foto] Justin Anandya Wibisana             │
│        Ketua Umum                           │
│        GENERASI KE-2    AKTIF    🔗 LinkedIn│
└────────────────────────────────────────────┘
```

**After (new):**
```
┌──────────────────────────────────────────────────┐
│ [Foto] Justin Anandya Wibisana                   │
│        Ketua Umum                                 │
│        GENERASI KE-2    AKTIF    🔗 LinkedIn     │
│                                                   │
│        👁️ Tampil di Publik: [✅ ON] [⚪ OFF]     │ ← Toggle control
│        🔐 Akun Portal: [✅ Aktif] [🔄 Reset PW]  │ ← Status & actions
│                  atau: [➕ Buat Akun]            │ ← Jika belum ada
│                                                   │
│        [...] (menu: Edit | Hapus)                │
└──────────────────────────────────────────────────┘
```

### 11.2. Modal "Buatkan Akun Portal"

```
┌─────────────────────────────────────────┐
│  Buatkan Akun Portal Anggota            │
│                                          │
│  Member: Justin Anandya Wibisana        │
│  Email: justin@imud.com (dari member)   │
│                                          │
│  Password Awal: [____________] 🔄 Generate│
│                                          │
│  ☐ Kirim email welcome otomatis         │
│                                          │
│  [Batal]              [Buat Akun] ✅    │
└─────────────────────────────────────────┘
```

---

## 12. Pertimbangan & Resiko

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

## 13. Design Specification

### 13.1. Portal Member vs Admin CMS

| Aspect | Admin CMS (Existing) | Member Portal (New) |
|--------|---------------------|---------------------|
| **Theme** | Minimalist, utilitarian | Modern, social |
| **Layout** | Sidebar + tables | Sidebar + cards |
| **Colors** | Neutral (gray/blue) | Vibrant gradients |
| **Components** | Dense data tables | Spacious cards with shadows |
| **Interactions** | Functional | Micro-interactions, smooth transitions |
| **Avatar** | Small/hidden | Large, prominent |
| **Focus** | Productivity | Networking & personal branding |

### 13.2. Design References

**Inspirasi:** LinkedIn dashboard (simplified), Notion personal workspace  
**Component library:** Reuse Lucide icons, Tailwind utilities  
**New elements:** Progress bars (profile completeness), avatar upload preview, card hover effects

---

## 14. Kesimpulan & Rekomendasi

Portal Anggota layak dibangun **jika prioritasnya adalah retensi anggota dan keberlanjutan organisasi** antar generasi.

### ✅ Keputusan Final:
1. **Implementasi bertahap** — 4 minggu MVP, evaluasi sebelum Tahap 2
2. **Admin tetap kontrol penuh** — visibility & akun portal diatur admin CMS
3. **Member self-service** — edit profil sendiri, ganti password
4. **Design modern** — berbeda dari admin CMS untuk UX yang lebih engaging
5. **No public navbar** — akses portal via URL langsung (privacy)

### 📅 Timeline:
- **Week 1:** Database + Auth Backend
- **Week 2:** Login + Dashboard Frontend
- **Week 3:** Profile Management
- **Week 4:** Admin Integration & Testing
- **Post-MVP:** Evaluasi adopsi → lanjut Tahap 2 (direktori, onboarding, dll)

### 🎯 Success Metrics:
- 70%+ pengurus aktif punya akun portal dalam 2 bulan
- Profile completeness rata-rata >60%
- Login aktif minimal 1x/bulan
- Admin tidak keberatan maintenance overhead

---

## 15. Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 22 Juli 2026 | Finalisasi planning: domain, visibility control, 4-week roadmap |
| (Initial) | Draft awal planning portal anggota |

---

**Status:** ✅ Planning Complete — Ready for Implementation  
**Next Step:** Week 1 Day 1 — Database migration `member_accounts`

*Dokumen ini akan diupdate seiring progress implementasi.*
