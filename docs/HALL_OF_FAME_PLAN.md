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

### 1. Hero Banner & Filter Kabinet (`#0D1B3D` & Gold Accent)
- **Visual:** Banner bermewahkan gradien warna Navy Tua khas IAI Muda (`#0D1B3D`) dengan aksen emas (`amber-400`).
- **Filter Selector Periode:** Dropdown/Tab interaktif untuk memilih periode kabinet:
  - `2024/2025` — Kabinet Akselerasi *(Periode Berjalan)*
  - `2023/2024` — Kabinet Inovasi
  - `2022/2023` — Kabinet Sinergi
  - `2021/2022` — Kabinet Pelopor *(Pendirian)*

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

Perubahan skema database yang akan ditambahkan pada file `db/schema.ts`:

```typescript
// 1. Tabel Master Periode Kabinet
export const cabinetPeriods = mysqlTable('cabinet_periods', {
  id: serial('id').primaryKey(),
  yearRange: varchar('year_range', { length: 20 }).notNull().unique(), // e.g. '2023/2024'
  cabinetName: varchar('cabinet_name', { length: 100 }).notNull(), // e.g. 'Kabinet Inovasi'
  chairpersonName: varchar('chairperson_name', { length: 100 }).notNull(),
  logoUrl: varchar('logo_url', { length: 255 }),
  visionMission: text('vision_mission'),
  isCurrent: boolean('is_current').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabel Timeline Milestone Sejarah
export const historyMilestones = mysqlTable('history_milestones', {
  id: serial('id').primaryKey(),
  periodId: int('period_id').notNull(),
  eventDate: varchar('event_date', { length: 50 }).notNull(),
  title: varchar('title', { length: 150 }).notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url', { length: 255 }),
  impactTag: varchar('impact_tag', { length: 100 }), // e.g. '1,000+ Peserta'
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxPeriodId: index('idx_milestones_period_id').on(table.periodId),
}));

// 3. Tabel Jajaran Alumni & BPH Demisioner
export const alumniBoard = mysqlTable('alumni_board', {
  id: serial('id').primaryKey(),
  periodId: int('period_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  roleName: varchar('role_name', { length: 100 }).notNull(), // e.g. 'Ketua Umum', 'Sekretaris Umum'
  currentCompany: varchar('current_company', { length: 150 }), // e.g. 'Senior Auditor di KAP PwC'
  photoUrl: varchar('photo_url', { length: 255 }),
  quote: text('quote'),
  sortOrder: int('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  idxAlumniPeriodId: index('idx_alumni_period_id').on(table.periodId),
}));
```

---

## 🛠️ 4. Perancangan Endpoint API

### Public & Member Endpoints
1. **`GET /api/hall-of-fame/periods`**
   - Mengambil seluruh daftar periode kabinet yang terdaftar untuk dropdown filter.
2. **`GET /api/hall-of-fame/details?periodId={id}`**
   - Mengambil detail periode kabinet, jajaran BPH demisioner, serta timeline milestone sejarah untuk periode terpilih.

### Admin CMS Management Endpoints
1. **`POST /api/admin/hall-of-fame/periods`** — Menambah/mengedit data periode kabinet baru.
2. **`POST /api/admin/hall-of-fame/milestones`** — Menambah node timeline sejarah proker akbar.
3. **`POST /api/admin/hall-of-fame/alumni`** — Menambah/mengedit data BPH demisioner.

---

## 🗓️ 5. Rencana Eksekusi & Tahapan Pengembangan

| Tahap | Aktivitas | File Terkait / Output |
| :--- | :--- | :--- |
| **Tahap 1** | Skema Database & Migrasi | Update `db/schema.ts` & file seeder awal |
| **Tahap 2** | API Routes & Services | `src/app/api/hall-of-fame/route.ts` |
| **Tahap 3** | Komponen UI Timeline & Legacy Wall | `src/components/member/HallOfFameView.tsx` |
| **Tahap 4** | Halaman Portal & Integrasi Navigasi | `src/app/portal/hall-of-fame/page.tsx` & Header Link |
| **Tahap 5** | Admin CMS Module | Modul Pengelolaan Hall of Fame di Admin CMS |

---

*Dokumen ini siap dijadikan acuan saat pengembangan fitur Hall of Fame & History Timeline dimulai.*
