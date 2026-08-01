# Perencanaan Redesain Statistik Hero & CMS Management "Jejaring HIMA"

**Status:** Planned  
**Tanggal:** 1 Agustus 2026  
**Target Komponen:** Hero Section, Admin CMS, Database Schema, & Navbar Navigation  

---

## 🎯 Ringkasan Tujuan

Meningkatkan efektivitas penyampaian informasi pada **Hero Section** IAI Muda DKI Jakarta dengan:
1. Mengubah tampilan statistik pasif menjadi **3 Card Stat Utama** modern yang ditenagai oleh icon `lucide-react`.
2. Menyediakan modul **CMS Kelola HIMA & Kemitraan** agar data jejaring Himpunan Mahasiswa Akuntansi (HIMA) dapat dikelola secara *real-time* oleh Admin.
3. Menampilkan menu **"Jejaring HIMA"** di bar navigasi utama (Navbar) untuk meningkatkan keterlihatan himpunan mahasiswa akuntansi yang berkolaborasi.

---

## 🛠️ Detail Rencana Implementasi

### Phase 1: Redesain Statistik Hero Section (3 Stat Utama)
- **Komponen Target:** `src/components/home/HeroSection.tsx` & `app/page.tsx`
- **Konsep Tampilan:**
  - Layout 3 Kolom Grid (Responsive 1-col di Mobile, 3-col di Desktop).
  - Tampilan Glassmorphism Card dengan pastel accent badge dan micro-hover animations.
- **Metrik statistik yang ditampilkan:**
  1. `Users` Icon -> **{memberCount}** | **Pengurus Aktif** *(Real-time DB query `members`)*
  2. `CalendarDays` Icon -> **{eventCount}+** | **Program & Kegiatan** *(Real-time DB query `events`)*
  3. `Handshake` Icon -> **{partnerCount}** | **HIMA Akuntansi** *(Real-time DB query `partners`)*

---

### Phase 2: Database Schema & API "Jejaring HIMA"
- **Database Table:** `partners` di `db/schema.ts`
  ```typescript
  export const partners = mysqlTable('partners', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(), // e.g. "HIMA Akuntansi Universitas Indonesia"
    university: varchar('university', { length: 255 }), // e.g. "Universitas Indonesia"
    logoUrl: varchar('logo_url', { length: 500 }),
    category: mysqlEnum('category', ['hima', 'organisasi', 'corporate', 'media']).default('hima').notNull(),
    websiteUrl: varchar('website_url', { length: 500 }),
    contactPerson: varchar('contact_person', { length: 255 }),
    sortOrder: int('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  });
  ```
- **API Endpoints:**
  - `GET /api/partners` -> Mengambil daftar HIMA & mitra aktif untuk publik / homepage.
  - `GET /api/admin/partners` -> CRUD endpoint untuk Admin CMS.
  - `POST /api/admin/partners` -> Tambah HIMA / mitra baru.
  - `PUT /api/admin/partners/[id]` -> Edit data & toggle status aktif.
  - `DELETE /api/admin/partners/[id]` -> Hapus data HIMA.

---

### Phase 3: Modul Admin CMS (`PartnersManager.tsx`)
- **Komponen Target:** `src/components/admin/PartnersManager.tsx`
- **Fitur CMS:**
  - Tabel kelola HIMA Akuntansi & kemitraan.
  - Form modal Tambah/Edit HIMA (Nama Himpunan, Nama Kampus, Logo Cloudinary/URL, Kategori, Website/IG).
  - Quick toggle `isActive` & pengurutan `sortOrder`.
  - Integrasi ke `AdminCMS.tsx` dan `app/admin/page.tsx`.

---

### Phase 4: Integrasi Navigasi Navbar & Halaman Jejaring HIMA
- **Komponen Target:** `src/components/Navbar.tsx` (atau Header utama)
- **Fitur:**
  - Penambahan menu **"Jejaring HIMA"** pada navigasi utama.
  - Halaman / Section Modal interaktif yang menampilkan grid logo Himpunan Mahasiswa Akuntansi mitra beserta informasi kampus dan media sosialnya.

---

## 📌 Checklist Pekerjaan

- [ ] Update `db/schema.ts` dengan tabel `partners`
- [ ] Buat API Handler `/api/partners` dan `/api/admin/partners`
- [ ] Buat Komponen CMS `PartnersManager.tsx` & daftarkan tab baru di Admin CMS
- [ ] Refactor `HeroSection.tsx` & `app/page.tsx` dengan 3 Card Icon Lucide (Stat: HIMA Akuntansi)
- [ ] Update Navbar Navigation dengan menu "Jejaring HIMA"
- [ ] Re-test build & verifikasi ketersediaan data real-time
