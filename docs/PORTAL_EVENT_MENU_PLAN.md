# Rencana Peran Menu Event di Portal Anggota

> **Status:** Draft — Menunggu Kick-off Diskusi  
> **Tujuan:** Mendefinisikan peran, fitur, dan perilaku menu "Event" di Portal Anggota IAI Muda Jakarta.

> **Dokumen Rujukan:**
> - [`portal-anggota-planning.md`](../portal-anggota-planning.md) — konteks Portal Anggota secara keseluruhan
> - [`EVENT_REGISTRATION_GOOGLE_FORM_PLAN.md`](./EVENT_REGISTRATION_GOOGLE_FORM_PLAN.md) — plan pendaftaran event publik via Google Form

---

## 1. Latar Belakang

Portal Anggota IAI Muda Jakarta (`/member/*`) adalah area **eksklusif untuk pengurus aktif, demisioner, dan alumni** — **bukan** untuk peserta event umum. Saat ini, di dashboard anggota sudah ada komponen `UpcomingEvents.tsx` yang menampilkan daftar event publik dengan link `registrationUrl` (Google Form).

**Pertanyaan kunci:** Kalau pengurus adalah penyelenggara event, lalu apa peran menu "Event" di Portal Anggota?

Plan ini adalah **placeholder** untuk mendiskusikan dan memutuskan:
- Peran menu Event di Portal (panel manajemen, RSVP internal, atau info center?)
- Fitur apa saja yang relevan untuk pengurus
- Timeline implementasi (post-MVP portal?)

---

## 2. Tujuan (Placeholder)

Tujuan akhir akan difinalisasi setelah diskusi. Sementara, beberapa kemungkinan tujuan:

- Memberikan **toolkit internal** bagi pengurus untuk mengelola event yang ditugaskan
- Mempermudah **koordinasi kepanitiaan** antar divisi
- Mempertahankan **jejak historis** event (materi, notulensi, peserta)
- Mempercepat **onboarding pengurus baru** lewat akses dokumen paska-event

---

## 3. Tiga Opsi Peran Menu Event di Portal

Berikut tiga opsi yang perlu dipertimbangkan. Keputusan akhir menunggu diskusi dengan stakeholders.

### Opsi A1: Panel Manajemen Event untuk Pengurus

Menu Event di portal = **dashboard panitia** bagi pengurus yang sedang mengelola event.

**Fitur potensial:**
- 📋 Daftar event yang ditugaskan ke pengurus tersebut
- 📤 Upload materi (slide, notulensi, sertifikat, foto)
- 📊 Lihat ringkasan pendaftar (via import Google Sheets, atau integrasi Google Forms API)
- ✏️ Edit info event (synced dengan admin CMS)
- 📢 Kirim pengumuman ke peserta
- 👥 Lihat komite kepanitiaan

**Cocok untuk:** pengurus Divisi Acara / Kominfo yang banyak mengelola event publik.

**Trade-off:**
- ✅ Value tinggi untuk pengurus produktif
- ❌ Butuh schema baru (`event_committees`, `event_materials`)
- ❌ Butuh peran/permission khusus (siapa yang boleh upload materi?)

---

### Opsi A2: Event Internal Organisasi (RSVP)

Menu Event = tempat pengurus **RSVP untuk event internal** organisasi (bukan event publik).

**Contoh event internal:**
- Rapat pleno pengurus
- Training keorganisasian
- Gathering alumni
- Coordination meeting antar divisi

**Fitur potensial:**
- 📅 Daftar event internal (terpisah dari event publik)
- ✅ RSVP kehadiran
- 📥 Download materi paska-rapat
- 📝 Notulensi (restricted access)

**Cocok untuk:** meningkatkan koordinasi internal organisasi.

**Trade-off:**
- ✅ Meningkatkan engagement pengurus
- ❌ Butuh event_type baru (public vs internal)
- ❌ Tabel `event_rsvps` atau reuse `event_registrations` dengan flag internal

---

### Opsi A3: Info Center (Read-Only)

Menu Event = halaman informasi read-only untuk pengurus, **mirip publik** tapi dengan extra fitur promosi.

**Fitur potensial:**
- 📃 Lihat daftar event publik
- 🔖 Bookmark event yang menarik
- 📤 Share event ke WA/Instagram (template pesan)
- 📊 Statistik event (jumlah pendaftar, dsb)

**Cocok untuk:** membantu pengurus mensosialisasikan event ke jaringan mereka.

**Trade-off:**
- ✅ Paling ringan untuk diimplementasikan
- ❌ Value tambah minimal dibanding halaman publik

---

## 4. Rekomendasi Awal: A1 + A2 (Kombinasi)

Untuk IAI Muda Jakarta, kombinasi A1 + A2 paling relevan karena:

| Aspek | A1 (Manajemen) | A2 (RSVP Internal) | A3 (Info) |
|---|---|---|---|
| **Value untuk pengurus** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Effort implementasi** | ⭐⭐⭐⭐ (tinggi) | ⭐⭐⭐ (sedang) | ⭐ (ringan) |
| **Sesuai konteks IAI Muda** | ✅ Sangat sesuai | ✅ Sesuai | ⚠️ Bisa publik |

**Struktur menu yang diusulkan:**

```
📅 Event (sidebar)
│
├── 🎯 Event yang Saya Kelola (A1)
│   ├── Daftar event yang ditugaskan
│   ├── Upload materi / notulensi
│   └── Lihat ringkasan pendaftar
│
├── 📋 Event Internal (A2)
│   ├── Daftar event khusus pengurus
│   ├── RSVP kehadiran
│   └── Download materi paska-event
│
└── 📢 Event Publik (read-only)
    ├── Lihat event publik
    └── Share toolkit
```

---

## 5. Kandidat Skema Database (Untuk A1 + A2)

> **Catatan:** Bagian ini hanya **konseptual**. Implementasi penuh menunggu keputusan final.

### Tabel Baru: `event_committees` (untuk A1)

```typescript
export const eventCommittees = pgTable('event_committees', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 100 }), // 'ketua_panitia', 'acara', 'humasi', dll
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  uniqCommittee: uniqueIndex('uniq_event_member_role').on(t.eventId, t.memberId, t.role),
}));
```

### Tabel Baru: `event_materials` (untuk A1)

```typescript
export const eventMaterials = pgTable('event_materials', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  fileType: varchar('file_type', { length: 50 }), // 'slide', 'notulensi', 'sertifikat', 'foto'
  uploadedBy: integer('uploaded_by').references(() => members.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Update Tabel `events` (untuk A2)

```typescript
// Tambah kolom opsional
eventType: varchar('event_type', { length: 20 }).default('public').notNull(),
// 'public' | 'internal' — internal = hanya untuk pengurus
```

### Tabel Baru: `event_rsvps` (untuk A2)

```typescript
export const eventRsvps = pgTable('event_rsvps', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('attending').notNull(),
  // 'attending' | 'not_attending' | 'maybe'
  respondedAt: timestamp('responded_at').defaultNow().notNull(),
}, (t) => ({
  uniqRsvp: uniqueIndex('uniq_event_member').on(t.eventId, t.memberId),
}));
```

---

## 6. Roadmap (Tentatif — Menunggu Persetujuan)

| Fase | Task | Estimasi | Prioritas |
|------|------|----------|-----------|
| **1. Diskusi & Finalisasi** | Tentukan kombinasi peran final (A1, A2, A3, atau campuran) | 1 hari | HIGH |
| **2. Schema** | Tambah tabel/kolom sesuai pilihan | 0.5–1 hari | HIGH |
| **3. API** | CRUD endpoint untuk komite, materi, RSVP | 1–2 hari | MEDIUM |
| **4. UI Portal** | Halaman-halaman menu Event di `/member/*` | 2–3 hari | MEDIUM |
| **5. Integrasi Admin** | Tambah field assignment panitia di Admin CMS | 1 hari | LOW |
| **6. Polish & Testing** | Validasi permission, error handling | 1 hari | MEDIUM |

**Total estimasi: 1–2 minggu** (tergantung kombinasi fitur final)

---

## 7. Open Questions untuk Diskusi

1. **Kombinasi fitur:** A1 + A2 sekaligus, atau salah satu dulu?
2. **Permission:** siapa yang boleh upload materi? Hanya admin, atau panitia juga?
3. **Event internal:** apakah hanya pengurus yang bisa lihat, atau ada level visibility lain?
4. **Notifikasi:** perlu email/WhatsApp notification untuk RSVP reminder?
5. **Timeline:** post-MVP portal anggota, atau bisa paralel dengan event publik?

---

## 8. Referensi

- [`portal-anggota-planning.md`](../portal-anggota-planning.md) — struktur Portal Anggota keseluruhan
- [`EVENT_REGISTRATION_GOOGLE_FORM_PLAN.md`](./EVENT_REGISTRATION_GOOGLE_FORM_PLAN.md) — plan pendaftaran event publik
- `src/components/member/dashboard/UpcomingEvents.tsx` — komponen yang menampilkan event di dashboard anggota
- `app/portal/` — struktur direktori Portal Anggota

---

## 9. Changelog

| Tanggal | Perubahan |
|---------|-----------|
| 23 Juli 2026 | Draft awal: pemisahan peran event publik vs portal, 3 opsi (A1/A2/A3) |

---

**Status:** ⏳ Draft — Menunggu Kick-off Diskusi  
**Next Step:** Diskusi dengan stakeholder (pengurus aktif) untuk finalisasi peran menu Event di Portal
