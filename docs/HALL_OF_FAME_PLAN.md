# 🏛️ Perencanaan Fitur: Hall of Fame & History Timeline (`/portal/hall-of-fame`)
**Platform Portal Internal IAI Muda DKI Jakarta**

Dokumen ini berisi rancangan konsep lengkap, skema database, alur pengguna (UI/UX), serta tahapan eksekusi teknis untuk fitur **Hall of Fame & History Timeline**.

---

## 🎯 1. Latar Belakang & Tujuan Fitur

### Problem Statement
Organisasi kepemudaan dan profesi seperti IAI Muda DKI Jakarta mengalami pergantian kepengurusan secara berkala. Tanpa adanya dokumentasi digital yang terpusat, rekam jejak sejarah proker akbar, pencapaian kabinet, dan kontribusi alumni pengurus harian (BPH) dapat hilang seiring berjalannya waktu.

### Goal & Solution
Fitur **Hall of Fame & History Timeline** bertujuan untuk:
1. **Museum Digital Organisasi**: Mengabadikan perjalanan sejarah, momentum penting, dan proker akbar IAI Muda DKI Jakarta dari masa ke masa secara transparan dan berestetika tinggi.
2. **Penghormatan Alumni & BPH Demisioner**: Menampilkan jajaran kepemimpinan demisioner beserta jalinan karir profesional mereka saat ini (*Alumni Network*).
3. **Meningkatkan Pride of Belonging**: Memberikan kebanggaan visual bagi pengurus aktif maupun alumni bahwa nama dan kontribusi mereka diabadikan secara permanen di portal.
4. **Branding & Credibility**: Menjadi sarana pembuktian rekam jejak organisasi yang matang bagi pihak eksternal, universitas mitra, maupun perusahaan sponsor.

---

## 🎨 2. Tampilan Antarmuka & Komponen UI (UI/UX Breakdown)

Fitur ini akan diakses pada rute halaman `/portal/hall-of-fame` dengan 4 bagian visual utama:

### 1. Hero Banner & Filter Periode Generasi (`#0D1B3D` & Gold Accent)
- **Visual:** Banner bermewahkan gradien warna Navy Tua khas IAI Muda (`#0D1B3D`) dengan aksen emas (`amber-400`).
- **Filter Selector Periode:** Dropdown/Tab interaktif berbasis data real `generations` organisasi:
  - `Generasi ke-2 (2025-2026)` *(Periode Berjalan / Aktif)*
  - `Generasi ke-1 (2024-2025)` *(Periode Demisioner)*
- **Nama Kabinet (Opsional):** Jika diisi di CMS (misal: "Kabinet Akselerasi"), nama kabinet akan muncul di samping periode. Jika kosong, UI secara otomatis hanya menampilkan nama Generasi & Tahun (misal: "Generasi ke-2 (2025–2026)").

### 2. Interactive Vertical History Timeline (Garis Sejarah Organisasi)
- **Visual:** Garis vertikal menyala (*glowing timeline node*) di tengah/kiri layar dengan animasi Framer Motion saat di-scroll.
- **Node Item Milestone:**
  - **Tanggal & Lokasi Event**: Informasi waktu dan tempat momentum sejarah.
  - **Judul Milestone**: Misal *"Peluncuran Portal Internal & Musyawarah Wilayah I"*.
  - **Galeri Foto Dokumentasi**: Foto beresolusi tinggi dengan fitur *Lightbox Pop-up* saat diklik.
  - **Impact Badge**: Indikator dampak (misal: `1,200+ Peserta`, `15 Kampus Terlibat`, `3 KAP Sponsor`).

### 3. Leadership Legacy Wall (Jajaran Ketua & BPH Demisioner)
- **Visual:** Grid kartu eksekutif berbingkai aksen emas (*Gold Frame Card*).
- **Elemen Kartu Pengurus:**
  - Foto Resmi Pengurus saat menjabat.
  - Nama Lengkap & Gelar Profesional (misal: `CA`, `CPA`, `SE`, `M.Ak`).
  - Jabatan saat menjabat (Ketua Umum, Sekretaris Umum, Bendahara Umum, Koordinator Bidang).
  - Profil Karir Saat Ini (misal: `Senior Auditor di KAP EY Indonesia` / `Manager Keuangan`).
  - **Legacy Quote**: Pesan inspiratif untuk generasi pengurus penerus.

### 4. Wall of Champions (Penghargaan Member & Proker Terbaik)
- Kartu apresiasi khusus untuk memajang:
  - 🏆 **Member of the Year** pada periode terkait.
  - 🚀 **Best Program Kerja Award** pada periode terkait.

---

## 🗄️ 3. Perancangan Database (Drizzle ORM Schema)

Skema database Hall of Fame menginduk langsung ke tabel `generations` yang sudah ada di `db/schema.ts`, sehingga periode selalu sinkron dengan data organisasi:

```typescript
// 1. Ekstensi/Metadata Kabinet pada Tabel Generation (Opsional Nama Kabinet)
// Kolom tambahan pada tabel generations yang sudah ada:
// - cabinetName: varchar('cabinet_name', { length: 100 }) -> Nullable / Opsional
// - visionMission: text('vision_mission') -> Nullable
// - logoUrl: varchar('logo_url', { length: 255 }) -> Nullable

// 2. Tabel Timeline Milestone Sejarah (Berelasi dengan generationId)
export const historyMilestones = mysqlTable('history_milestones', {
  id: serial('id').primaryKey(),
  generationId: int('generation_id').notNull(),
  eventDate: varchar('event_date', { length: 50 }).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  impactTag: varchar('impact_tag', { length: 100 }), // e.g. '1,000+ Peserta'
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxGenId: index('idx_milestones_generation_id').on(table.generationId),
}));

// 3. Tabel Jajaran Alumni & BPH Demisioner
export const alumniBoard = mysqlTable('alumni_board', {
  id: serial('id').primaryKey(),
  generationId: int('generation_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  roleName: varchar('role_name', { length: 100 }).notNull(), // e.g. 'Ketua Umum', 'Sekretaris Umum'
  currentCompany: varchar('current_company', { length: 150 }), // e.g. 'Senior Auditor di KAP PwC'
  photoUrl: varchar('photo_url', { length: 255 }),
  quote: text('quote'),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxAlumniGenId: index('idx_alumni_generation_id').on(table.generationId),
}));
```

---

## 🖥️ 4. Pengaturan & Pengelolaan di Admin CMS

Pengaturan dan input data Hall of Fame akan ditempatkan di **Admin CMS** pada menu baru:

📍 **Path Admin CMS:** `/admin/hall-of-fame` (atau sub-modul di bawah menu **Pengaturan Organisasi / Generasi**).

### Fitur Admin CMS:
1. **Kelola Periode Generasi & Metadata Kabinet**: 
   - Memilih Generasi (misal Gen-1, Gen-2).
   - *Field* Nama Kabinet bersifat **opsional** (boleh dikosongkan).
2. **Kelola Timeline Sejarah / Milestone**:
   - Tambah, edit, dan hapus milestone momen penting organisasi per generasi.
   - Re-order urutan timeline dan upload foto dokumentasi.
3. **Kelola Jajaran BPH Demisioner & Alumni**:
   - Tambah data foto, nama, jabatan terdahulu, karir saat ini, dan legacy quote.
4. **Kelola Wall of Champions**:
   - Menentukan apresiasi Member of the Year & Proker Terbaik per periode.

---

## 🛠️ 5. Perancangan Endpoint API

### Public & Member Endpoints
1. **`GET /api/hall-of-fame/generations`**
   - Mengambil seluruh daftar generasi yang ada di database untuk dropdown filter.
2. **`GET /api/hall-of-fame/details?generationId={id}`**
   - Mengambil detail generasi/kabinet, jajaran BPH demisioner, serta timeline milestone sejarah untuk generasi terpilih.

### Admin CMS Management Endpoints
1. **`PUT /api/admin/hall-of-fame/generations/[id]`** — Mengedit metadata generasi/kabinet.
2. **`POST /api/admin/hall-of-fame/milestones`** — Menambah node timeline sejarah proker akbar.
3. **`POST /api/admin/hall-of-fame/alumni`** — Menambah/mengedit data BPH demisioner.

---

## 🗓️ 6. Rencana Eksekusi & Tahapan Pengembangan

| Tahap | Aktivitas | File Terkait / Output |
| :--- | :--- | :--- |
| **Tahap 1** | Skema Database & Migrasi | Update `db/schema.ts` (relasi ke `generationId`) & seeder data real |
| **Tahap 2** | API Routes & Services | `app/api/hall-of-fame/route.ts` |
| **Tahap 3** | Komponen UI Timeline & Legacy Wall | `src/components/member/HallOfFameView.tsx` |
| **Tahap 4** | Halaman Portal & Integrasi Navigasi | `app/portal/hall-of-fame/page.tsx` & Header Link |
| **Tahap 5** | Modul Admin CMS | `app/admin/hall-of-fame/page.tsx` (CMS Pengelolaan) |

---

*Dokumen ini telah disesuaikan dengan periode generasi real organisasi IAI Muda DKI Jakarta dan siap dijalankan.*
