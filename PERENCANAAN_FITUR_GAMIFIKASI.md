# 🏆 Perencanaan Fitur: Gamifikasi & Badge Apresiasi Keaktifan (Member Recognition)
**Platform Portal Internal IAI Muda DKI Jakarta**

Dokumen ini berisi rancangan lengkap konsep, skema database, kriteria penilaian, antarmuka pengguna (UI/UX), serta alur kerja teknis untuk fitur **Gamifikasi & Badge Apresiasi Keaktifan**.

---

## 🎯 1. Latar Belakang & Tujuan Fitur

### Problem Statement
Dalam organisasi kepemudaan dan profesi, salah satu tantangan terbesar adalah *pengurus ghosting*, penurunan motivasi di tengah periode kepengurusan, atau kurangnya apresiasi terhadap pengurus yang berkontribusi secara konsisten.

### Goal & Solution
Fitur **Gamifikasi & Badge Apresiasi Keaktifan** bertujuan untuk:
1. **Meningkatkan Engagement**: Memberikan dorongan positif (*positive reinforcement*) berbasis poin keaktifan dan lencana (*achievement badges*).
2. **Apresiasi Otomatis & Transparan**: Setiap kontribusi pengurus (kehadiran acara, keaktifan berdiskusi, penyelesaian modul onboarding, partisipasi panitia proker) langsung diapresiasi oleh sistem.
3. **Memperkuat Profil Pengurus**: Lencana keaktifan tampil di profil dan Direktori Anggota, sehingga pengurus dapat memamerkan rekam jejak kontribusi positif mereka di IAI Muda Jakarta.

---

## 🎖️ 2. Katalog Badge & Kriteria Penilaian

Sistem lencana dibagi menjadi 2 kategori utama: **Badge Otomatis (System-Triggered)** dan **Badge Khusus (Admin/HR Granted)**.

### A. Badge Otomatis (*System-Triggered Badges*)
Diberikan secara otomatis oleh sistem saat pengurus mencapai *milestone* tertentu:

| Icon | Nama Badge | Kode Internal | Kriteria Otomatis Penilaian | Warna / Styling Class |
| :---: | :--- | :--- | :--- | :--- |
| 🏆 | **Top Contributor** | `top_contributor` | Menulis minimal **10 Post** atau **25 Komentar** di Ruang Komunitas (*Feed*). | Gold (`bg-amber-100 text-amber-800 border-amber-300`) |
| 🎟️ | **100% Event Attendance** | `event_attendance_100` | Menghadiri (*RSVP Attending*) minimal **5 Event Resmi** IAI Muda tanpa absen. | Emerald (`bg-emerald-100 text-emerald-800 border-emerald-300`) |
| 💚 | **HR Green Flag** | `hr_green_flag` | Mempertahankan status keaktifan HR **"Hijau"** selama 3 bulan berturut-turut. | Green (`bg-green-100 text-green-800 border-green-300`) |
| 📚 | **Onboarding Champion** | `onboarding_champion` | Mengunduh / membaca seluruh modul wajib pengurus di Onboarding Hub. | Blue (`bg-blue-100 text-blue-800 border-blue-300`) |
| 🚀 | **Proker Champion** | `proker_champion` | Terdaftar sebagai panitia/PIC (*Event Committee*) di minimal **3 Program Kerja**. | Purple (`bg-purple-100 text-purple-800 border-purple-300`) |
| 🌟 | **Early Bird RSVP** | `early_bird_rsvp` | Melakukan RSVP acara dalam 24 jam pertama setelah acara dipublikasikan. | Sky (`bg-sky-100 text-sky-800 border-sky-300`) |

---

### B. Badge Spesial (*Admin & HR Granted Badges*)
Diberikan secara manual oleh Admin/Pengurus Harian/HR Command Center untuk apresiasi khusus:

| Icon | Nama Badge | Kode Internal | Kriteria Pemberian Manual | Warna / Styling Class |
| :---: | :--- | :--- | :--- | :--- |
| 🎓 | **Alumni Mentor** | `alumni_mentor` | Diberikan kepada alumni yang aktif mengisi sesi *sharing*, narasumber, atau mentor. | Rose (`bg-rose-100 text-rose-800 border-rose-300`) |
| ⭐ | **Member of the Month** | `member_of_the_month` | Diberikan oleh HR/Ketua kepada pengurus teladan terbaik setiap bulannya. | Indigo (`bg-indigo-100 text-indigo-800 border-indigo-300`) |
| 🛡️ | **Executive Leader** | `executive_leader` | Diberikan untuk BPH (Badan Pengurus Harian) & Koordinator Bidang. | Slate (`bg-slate-800 text-white border-slate-700`) |

---

## 🗄️ 3. Perancangan Database (Drizzle ORM Schema)

Perubahan skema database yang akan ditambahkan pada file `db/schema.ts`:

```typescript
// 1. Tabel Master Lencana
export const badges = mysqlTable('badges', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(), // e.g. 'top_contributor'
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  icon: varchar('icon', { length: 50 }).default('Award').notNull(), // Lucide icon name
  category: mysqlEnum('category', ['system', 'special', 'achievement']).default('system').notNull(),
  badgeClass: varchar('badge_class', { length: 255 }).default('bg-amber-100 text-amber-800').notNull(),
  xpBonus: int('xp_bonus').default(100).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Tabel Lencana Anggota (Penerima Badge)
export const memberBadges = mysqlTable('member_badges', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull(),
  badgeId: int('badge_id').notNull(),
  awardedAt: timestamp('awarded_at').defaultNow().notNull(),
  awardedBy: int('awarded_by'), // NULL jika otomatis dari sistem, atau userId admin
  notes: text('notes'),
}, (table) => ({
  uniqMemberBadge: uniqueIndex('uniq_member_badge').on(table.memberId, table.badgeId),
  idxMemberId: index('idx_member_badges_member_id').on(table.memberId),
}));

// 3. Tabel Skor Poin & Level Keaktifan
export const memberGamification = mysqlTable('member_gamification', {
  id: serial('id').primaryKey(),
  memberId: int('member_id').notNull().unique(),
  totalXp: int('total_xp').default(0).notNull(),
  currentLevel: varchar('current_level', { length: 50 }).default('Pengurus Muda').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## 🛠️ 4. Endpoint API Baru & Integrasi Logika

### Endpoint Anggota (Portal Member)
1. **`GET /api/member/badges`**
   - Mengambil seluruh daftar badge yang diperoleh oleh pengurus yang sedang login.
   - Menghitung persentase progres menuju badge berikutnya (contoh: `progress: 70%` untuk badge Top Contributor).
2. **`GET /api/member/directory`** *(Update Endpoint Eksisting)*
   - Menambahkan relasi data `badges` pada respons JSON agar badge anggota tampil di kartu direktori.

### Endpoint Admin / HR
1. **`POST /api/admin/badges/award`**
   - Menyerahkan badge manual (seperti *Member of the Month* atau *Alumni Mentor*) kepada ID anggota tertentu.
2. **`DELETE /api/admin/badges/revoke`**
   - Mencabut badge jika ada kekeliruan penyerahan.

---

## 🎨 5. Tampilan Antarmuka (UI Components)

Fitur ini akan diintegrasikan pada 3 lokasi utama di Portal:

### 1. Direktori Anggota (`app/portal/directory/page.tsx` & `MemberDirectory.tsx`)
- Menampilkan deretan **Badge Icons** mini berbentuk *pill* di bawah nama/divisi anggota.
- Efek **Tooltip**: Saat kursor diarahkan ke badge, akan muncul nama badge & deskripsi pencapaiannya.

### 2. Kartu Profil Pengurus (`app/portal/profile/page.tsx`)
- Menambahkan tab baru: **"Lencana & Prestasi (Badges)"**.
- **Koleksi Badge**: Grid visual berisi lencana yang sudah terbuka (*unlocked*) dan lencana yang belum terbuka (*locked* dengan efek transparan/grayscale).
- **Progres Bar Keaktifan**: Menampilkan total XP dan batas poin untuk naik level berikutnya.

### 3. Dashboard Member (`app/portal/dashboard/page.tsx`)
- Widget ringkasan **"Prestasi Terakhir"** yang menampilkan badge terbaru yang baru diraih beserta notifikasi apresiasi.

---

## 🗓️ 6. Tahapan Rencana Eksekusi (Roadmap)

| Tahap | Aktivitas | Output / File Terkait |
| :--- | :--- | :--- |
| **Tahap 1** | Skema Database & Seeder Master Badge | Update `db/schema.ts`, buat seeder data badge standar |
| **Tahap 2** | Pengembangan Backend API & Trigger Checker | Endpoint `/api/member/badges` & auto-award logic |
| **Tahap 3** | Integrasi UI di Direktori Anggota | Update `MemberDirectory.tsx` dengan badge tooltip |
| **Tahap 4** | Integrasi UI Halaman Profil & Dashboard | Halaman profil member & widget apresiasi di Dashboard |
| **Tahap 5** | Verifikasi & Testing | Uji coba otomatisasi pemicu & tampilan di mobile/desktop |

---

## 💬 7. Catatan Review untuk Pengguna

Mohon kaji poin-poin berikut sebelum implementasi dimulai:
1. **Istilah Badge**: Apakah nama-nama badge di atas sudah sesuai dengan selera dan budaya IAI Muda DKI Jakarta?
2. **Kriteria Angka**: Apakah syarat angka (misal: 10 post, 5 event, 3 proker) sudah ideal atau perlu disesuaikan?

*Dokumen ini siap dijadikan acuan saat pengembangan dimulai.*
