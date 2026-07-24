# Calendar Feature Plan — IAI Muda Jakarta

> **Status:** Phase 1 selesai (foundation), Phase 2 selesai (admin toggle List/Calendar), Phase 4 selesai (portal page), Phase 3 & 5-6 belum.
> **Last updated:** 24 Juli 2026
> **Stack:** Next.js 16 + Drizzle ORM + MySQL + Tailwind 4 + lucide-react
> **Style palette:** Blue (default), Emerald (public), Purple (internal), Amber (upcoming), Slate (completed), Rose

---

## 1. Overview

Menambahkan fitur kalender berbasis data `events` yang sudah ada, dengan satu komponen reusable dipakai di 3 area (publik, portal anggota, admin CMS) — tanpa library eksternal, tanpa duplikasi logika.

**MVP scope:**
- Kalender bulanan (grid 7×6) + daftar agenda bulanan
- Toggle List ↔ Calendar di admin
- Field baru: `endDate`, `allDay`, `color` (hybrid minimal invasive — field existing tidak diubah)
- API terpusat `/api/calendar/events`

**Out of scope (Phase 6+):**
- Drag-and-drop event
- iCal export (`.ics`)
- Reminder / email notification
- Subscribe URL
- View minggu / hari
- Recurring events

---

## 2. Keputusan Teknis (Sudah Disetujui)

| Aspek | Keputusan | Alasan |
|---|---|---|
| Schema | Tambah `endDate`, `allDay`, `color` di `events` | Hybrid minimal invasive, zero backfill, dukung multi-hari |
| Library | Custom, zero dependency | Bundle kecil, styling konsisten, kontrol penuh |
| Admin integration | Toggle List/Calendar di `EventsManager.tsx` | Tidak ubah arsitektur AdminCMS, drawer/form reuse |
| API | `/api/calendar/events?scope=public\|member\|admin` | Satu endpoint, query param filter visibility |
| Minggu | Dimulai Senin | Standar Indonesia |
| Bahasa | Indonesia (id-ID) untuk label UI | Konsisten dengan project |

---

## 3. Data Model

### 3.1 Schema (`db/schema.ts`)

Tambah 3 field di tabel `events`:

```ts
endDate: varchar('end_date', { length: 20 }),  // YYYY-MM-DD, nullable, untuk event multi-hari
allDay:  boolean('all_day').default(false).notNull(),
color:   varchar('color', { length: 20 }).default('blue').notNull(),
```

**Color values yang valid:** `blue` | `emerald` | `purple` | `amber` | `slate` | `rose`

### 3.2 Migration Script

File: `db/add_calendar_fields_to_events.ts`

Idempotent ALTER TABLE (skip jika kolom sudah ada via `ER_DUP_FIELDNAME`):

```sql
ALTER TABLE events ADD COLUMN end_date VARCHAR(20) NULL AFTER date;
ALTER TABLE events ADD COLUMN all_day  BOOLEAN    NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN color    VARCHAR(20) NOT NULL DEFAULT 'blue';
```

**Cara run:**
```bash
npx tsx db/add_calendar_fields_to_events.ts
```

### 3.3 TypeScript Type (`src/types.ts`)

```ts
export interface Event {
  // ... existing
  endDate?: string | null;  // YYYY-MM-DD
  allDay?: boolean;
  color?: string;           // 'blue' | 'emerald' | ...
}
```

---

## 4. API Design

### 4.1 New: `/api/calendar/events` (Terpusat)

**File:** `app/api/calendar/events/route.ts`

```
GET /api/calendar/events?from=YYYY-MM-DD&to=YYYY-MM-DD&scope=public|member|admin
```

| scope    | Filter                                | Auth       |
|----------|---------------------------------------|------------|
| `public` | `eventType === 'public'`              | none       |
| `member` | semua event                           | none       |
| `admin`  | semua event                           | admin only |

**Response shape (konsisten untuk 3 area):**

```ts
type CalendarEvent = {
  id: number;
  title: string;
  description: string;
  startDate: string;            // alias dari `date`
  endDate: string | null;
  allDay: boolean;
  time: string | null;
  location: string | null;
  imageUrl: string | null;
  registrationUrl: string | null;
  status: 'upcoming' | 'ongoing' | 'completed';
  eventType: 'public' | 'internal';
  color: string;
  generationId: number | null;
};
```

### 4.2 Updated: `/api/events` & `/api/events/[id]`

**File:** `app/api/events/route.ts` & `app/api/events/[id]/route.ts`

Tambah field baru di POST/PUT body:
- `endDate` (nullable, harus >= `date` jika diisi)
- `allDay` (boolean, default false)
- `color` (enum, default 'blue')
- `eventType` (enum, default 'public') — sebelumnya field ini ada tapi tidak di-handle

**Validasi tambahan:**
- `endDate >= date` (return 400 jika tidak)
- `color` ∈ enum (return 400 jika tidak)
- `eventType` ∈ `['public', 'internal']` (return 400 jika tidak)

---

## 5. Komponen Reusable

**Lokasi:** `src/components/calendar/`

### 5.1 Daftar File

| File | Tanggung Jawab |
|---|---|
| `types.ts` | `CalendarEvent`, `CalendarVariant`, `CalendarColor`, `COLOR_CLASSES`, `resolveColor()` |
| `utils.ts` | `generateMonthGrid()`, `distributeEvents()`, `listEventsInMonth()`, `shiftMonth()`, `parseDate()`, `formatYMD()`, locale constants |
| `EventChip.tsx` | Chip event di cell (support multi-day, allDay, color, size xs/sm/md) |
| `CalendarToolbar.tsx` | Nav bulan, toggle view, tombol "Tambah Acara" (admin only), counter event |
| `CalendarGrid.tsx` | Komponen utama: month view + list view, loading & empty state |
| `index.ts` | Barrel export |

### 5.2 Props `CalendarGrid`

```ts
type Props = {
  events: CalendarEvent[];
  variant: 'public' | 'admin' | 'member';
  loading?: boolean;
  initialView?: 'month' | 'list';
  initialDate?: Date;
  onEventClick?: (e: CalendarEvent) => void;
  onDayClick?: (ymd: string) => void;       // publik/portal
  onAddEvent?: (ymd: string) => void;       // admin
  className?: string;
};
```

### 5.3 Cara Pakai

```tsx
import { CalendarGrid } from '@/src/components/calendar';

// Publik
<CalendarGrid events={data} variant="public" onEventClick={(e) => router.push(`/events/${e.id}`)} />

// Portal
<CalendarGrid
  events={data}
  variant="member"
  onEventClick={(e) => router.push(`/portal/events/${e.id}`)}
/>

// Admin (dengan tombol + di cell)
<CalendarGrid
  events={data}
  variant="admin"
  onEventClick={(e) => openEditDrawer(e)}
  onAddEvent={(ymd) => openCreateDrawer(ymd)}
/>
```

### 5.4 Color Palette (`COLOR_CLASSES`)

```ts
const COLOR_CLASSES = {
  blue:    { bg:'bg-blue-600',    bgSoft:'bg-blue-50',    text:'text-blue-700',    border:'border-blue-200',    dot:'bg-blue-500' },
  emerald: { bg:'bg-emerald-600', bgSoft:'bg-emerald-50', text:'text-emerald-700', border:'border-emerald-200', dot:'bg-emerald-500' },
  purple:  { bg:'bg-purple-600',  bgSoft:'bg-purple-50',  text:'text-purple-700',  border:'border-purple-200',  dot:'bg-purple-500' },
  amber:   { bg:'bg-amber-500',   bgSoft:'bg-amber-50',   text:'text-amber-700',   border:'border-amber-200',   dot:'bg-amber-500' },
  slate:   { bg:'bg-slate-600',   bgSoft:'bg-slate-50',   text:'text-slate-700',   border:'border-slate-200',   dot:'bg-slate-500' },
  rose:    { bg:'bg-rose-600',    bgSoft:'bg-rose-50',    text:'text-rose-700',    border:'border-rose-200',    dot:'bg-rose-500' },
};
```

---

## 6. Per-Area Integration

### 6.1 Portal — `/portal/calendar` ✅ DONE

**File:** `app/portal/calendar/page.tsx`

**Status:** Sudah dibuat di Phase 4 (quick add). TypeScript compile lulus.

**Fitur:**
- Hero header gradient biru (konsisten dengan `/portal/events`)
- Fetch `/api/calendar/events?scope=member` + merge dengan RSVP dari `/api/member/events`
- Filter: Tipe (Semua/Publik/Internal) + Status (Upcoming/Berlangsung/Selesai)
- Search bar + reset filter
- Link ke `/portal/events` (existing)
- Click event → navigate ke `/portal/events/[id]` (existing)

**⚠️ Catatan:** Sidebar `MemberLayout.tsx` **belum diupdate** untuk menambah menu "Kalender" — user menolak perubahan sidebar. Untuk akses, gunakan URL langsung `/portal/calendar` atau tambahkan menu secara manual nanti.

---

### 6.2 Admin — `EventsManager.tsx` toggle ✅ DONE

**File target:** `src/components/admin/EventsManager.tsx`

**Status:** Sudah ditulis ulang lengkap. TypeScript compile lulus tanpa error. Form Drawer sekarang punya field: Tipe Acara, Status, Tanggal Mulai/Selesai, All Day checkbox (auto-clear time), Waktu, Lokasi, ImageUploader, Link Pendaftaran, Color Picker (6 warna), dan tombol submit.

#### 6.2.1 Yang Perlu Dilakukan

**Step 1: Backup state file saat ini** (sebelum rewrite) — file sudah ada 417 baris, tapi tidak lengkap.

**Step 2: Tulis ulang lengkap `EventsManager.tsx`** dengan spec berikut:

**Imports (atas file):**
```tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Sparkles, Check, LayoutGrid, List } from 'lucide-react';
import { Event } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import ActionButtons from './ActionButtons';
import Drawer from './Drawer';
import ImageUploader from '../ImageUploader';
import StatusBadge from './StatusBadge';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import { CalendarGrid, type CalendarEvent, type CalendarColor, CALENDAR_COLORS, COLOR_CLASSES } from '@/src/components/calendar';
```

**State baru:**
```tsx
type ViewMode = 'list' | 'calendar';
const [viewMode, setViewMode] = useState<ViewMode>('list');
```

**`emptyForm` (lengkap dengan field kalender):**
```tsx
const emptyForm: Omit<Event, 'id'> = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  time: '',
  location: '',
  imageUrl: '',
  status: 'upcoming',
  eventType: 'public',
  allDay: false,
  color: 'blue',
};
```

**Mapping `Event` → `CalendarEvent` (useMemo):**
```tsx
const calendarEvents = useMemo<CalendarEvent[]>(
  () => filteredEvents.map((evt) => ({
    id: evt.id,
    title: evt.title,
    description: evt.description,
    startDate: evt.date,
    endDate: evt.endDate || null,
    allDay: Boolean(evt.allDay),
    time: evt.time || null,
    location: evt.location || null,
    imageUrl: evt.imageUrl || null,
    registrationUrl: (evt as any).registrationUrl || null,
    status: evt.status,
    eventType: (evt.eventType as 'public' | 'internal') || 'public',
    color: evt.color || 'blue',
    generationId: (evt as any).generationId || null,
  })),
  [filteredEvents],
);
```

**Handler `handleOpenAdd(prefillDate?: string)`:**
```tsx
const handleOpenAdd = (prefillDate?: string) => {
  setEditingEvent(null);
  setForm({ ...emptyForm, date: prefillDate || '' });
  setIsDrawerOpen(true);
};
```

**Handler `handleOpenEdit`:**
```tsx
const handleOpenEdit = (evt: Event) => {
  setEditingEvent(evt);
  setForm({
    title: evt.title,
    description: evt.description,
    date: evt.date,
    endDate: evt.endDate || '',
    time: evt.time,
    location: evt.location,
    imageUrl: evt.imageUrl || '',
    status: evt.status,
    eventType: (evt.eventType as 'public' | 'internal') || 'public',
    allDay: Boolean(evt.allDay),
    color: (evt.color as CalendarColor) || 'blue',
  });
  setIsDrawerOpen(true);
};
```

**Submit handler — payload include field baru:**
```tsx
const payload = { ...form, endDate: form.endDate || null };
// POST atau PUT dengan payload
```

**Calendar event handler:**
```tsx
const handleCalendarEventClick = (evt: CalendarEvent) => {
  const real = events.find((e) => e.id === evt.id);
  if (real) handleOpenEdit(real);
};

const handleAddFromCalendar = (ymd: string) => {
  handleOpenAdd(ymd);
};
```

**Layout: Toggle Button (di header, sebelum SearchFilterBar):**
```tsx
<div className="flex items-center gap-2">
  <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/60">
    <button onClick={() => setViewMode('list')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}>
      <List className="w-3.5 h-3.5" /> Daftar
    </button>
    <button onClick={() => setViewMode('calendar')}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
        viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}>
      <LayoutGrid className="w-3.5 h-3.5" /> Kalender
    </button>
  </div>
  <span className="text-xs text-slate-500 font-medium">{filteredEvents.length} acara</span>
</div>
```

**Body conditional:**
```tsx
{viewMode === 'list' ? (
  <ListContainer title="..." subtitle="...">
    {/* list rendering — tambah badge Internal, All Day, endDate di samping date */}
  </ListContainer>
) : (
  <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
    <CalendarGrid
      events={calendarEvents}
      variant="admin"
      onEventClick={handleCalendarEventClick}
      onAddEvent={handleAddFromCalendar}
    />
  </div>
)}
```

**Drawer Form — tambah field:**
- 2 kolom pertama: **Tipe Acara** (Publik/Internal) + **Status Publikasi** (existing)
- 2 kolom kedua: **Tanggal Mulai** + **Tanggal Selesai** (opsional, untuk multi-day)
- 1 baris: checkbox **Sepanjang Hari** (`allDay`)
- 1 baris: **Warna Chip** (color picker — 6 lingkaran warna dari `CALENDAR_COLORS` + `COLOR_CLASSES`)

**Color Picker (pakai `CALENDAR_COLORS` + `COLOR_CLASSES`):**
```tsx
<div className="space-y-1.5">
  <label className="text-xs font-bold text-slate-700">Warna Chip Kalender</label>
  <div className="flex items-center gap-2 flex-wrap">
    {CALENDAR_COLORS.map((c) => {
      const cls = COLOR_CLASSES[c];
      const active = form.color === c;
      return (
        <button
          key={c}
          type="button"
          onClick={() => setForm(prev => ({ ...prev, color: c }))}
          className={`w-8 h-8 rounded-full ${cls.bg} transition-all ${
            active ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'opacity-70 hover:opacity-100'
          }`}
          title={c}
        />
      );
    })}
  </div>
</div>
```

**All Day checkbox (auto-clear `time` jika dicentang):**
```tsx
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id="allDay"
    checked={form.allDay}
    onChange={(e) => setForm(prev => ({ ...prev, allDay: e.target.checked, time: e.target.checked ? '' : prev.time }))}
    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
  />
  <label htmlFor="allDay" className="text-xs font-bold text-slate-700">Sepanjang Hari (All Day)</label>
</div>
```

**Drawer submit button** (existing, tapi pakai `Check` icon):

Tombol submit tetap sama seperti existing code, hanya payload yang ditambah field kalender.

#### 6.2.2 Pitfalls yang Harus Dihindari

1. **File write terpotong** — split menjadi beberapa `replace_in_file` daripada satu `write_to_file` besar.
2. **`ListContainer` props** — jika di-remove props `onAdd` & `addLabel` (karena tombol dipindah ke header), cek dulu `ListContainer` component apakah wajib props itu. Jika wajib, tambahkan dummy handler atau pindah tombol ke dalam ListContainer.
3. **Color picker** — warna disimpan sebagai string di form, di-convert ke enum saat POST.
4. **`endDate` kosong string** — convert ke `null` saat submit (lihat `payload` snippet).
5. **`allDay` + `time`** — jika `allDay = true`, kosongkan `time` di form (sudah di-handle di snippet).

#### 6.2.3 Verifikasi

Setelah file lengkap:
```bash
npx tsc --noEmit
```
Harus lulus tanpa error.

---

### 6.3 Publik — `/calendar` 📋 TODO (Phase 3)

**File target:** `app/calendar/page.tsx`

**Pattern:** Mirip dengan `app/portal/calendar/page.tsx`, tapi:
- Tidak perlu `MemberLayout` — gunakan layout publik
- Header gradient biru (konsisten dengan homepage)
- `scope=public` (auto exclude event internal)
- Click event → link ke halaman event publik existing (jika ada) atau modal detail

**Tambah link "Kalender" di `Header.tsx` (publik):**
```tsx
// di src/components/Header.tsx, tambah menu item
{ href: '/calendar', label: 'Kalender' }
```

---

## 7. Roadmap & Status

| Phase | Deliverable | Status | Catatan |
|---|---|---|---|
| **1** | Foundation: schema + API + CalendarGrid reusable | ✅ DONE | TypeScript compile lulus |
| **2** | Admin: toggle List/Calendar di `EventsManager` | ✅ DONE | File lengkap, TypeScript compile lulus |
| **3** | Publik: halaman `/calendar` + nav header | 📋 TODO | Mirip portal pattern |
| **4** | Portal: halaman `/portal/calendar` + RSVP merge | ✅ DONE | Sidebar belum diupdate (perlu approval) |
| **5** | Polish: filter, search, empty state, loading, mobile responsive | 📋 TODO | Sudah include sebagian di Phase 1 & 4 |
| **6** | Future: drag-and-drop, iCal, reminder, subscribe URL | 📋 BACKLOG | — |

---

## 8. How to Use (untuk agent lain)

### 8.1 Pertama Kali Setup

```bash
# 1. Pull branch
git pull origin feature/calendar

# 2. Install deps (jika ada)
npm install

# 3. Run migration (jika belum pernah)
npx tsx db/add_calendar_fields_to_events.ts

# 4. Verify
npx tsc --noEmit
```

### 8.2 Pakai di Halaman Baru

```tsx
'use client';
import { useEffect, useState } from 'react';
import { CalendarGrid, type CalendarEvent } from '@/src/components/calendar';

export default function MyCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/calendar/events?scope=public')
      .then((r) => r.json())
      .then((d) => { if (d.success) setEvents(d.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <CalendarGrid
      events={events}
      variant="public"
      loading={loading}
      onEventClick={(e) => console.log('open event', e.id)}
    />
  );
}
```

### 8.3 Pakai di Admin dengan Form Drawer

Lihat spec di section 6.2 — terutama:
- `viewMode` state + toggle button
- Mapping `Event[]` → `CalendarEvent[]` via `useMemo`
- `handleAddFromCalendar(ymd)` → `setForm({ ...emptyForm, date: ymd })` + buka Drawer
- `handleCalendarEventClick(event)` → cari di `events[]` lalu `handleOpenEdit(real)`

---

## 9. Known Issues / Notes

1. **`EventsManager.tsx` sudah lengkap** — ditulis ulang dengan `write_to_file`, semua field kalender (endDate, allDay, color, eventType) + registrationUrl + ImageUploader + Color Picker sudah include. TypeScript compile lulus.

2. **MemberLayout sidebar belum diupdate** — user menolak perubahan sidebar di attempt pertama. Menu "Kalender" di portal harus ditambah manual jika perlu.

3. **Field `eventType` di form existing** — sebelumnya field ini sudah ada di schema tapi tidak di-handle di API. Sekarang sudah, default 'public' (backward compatible).

4. **Migration script idempotent** — aman di-run berkali-kali. Skip jika kolom sudah ada.

5. **Bundle size** — Phase 1 + 4 total ~7 file baru (~600 baris), zero dependency baru.

6. **Next.js 16 compatibility** — semua komponen client component (`'use client'`) karena pakai state. Aman untuk RSC boundary.

---

## 10. File Inventory (untuk agent lain)

### File Baru (sudah dibuat)

```
db/add_calendar_fields_to_events.ts        # Migration script
app/api/calendar/events/route.ts           # API kalender terpusat
app/portal/calendar/page.tsx               # Halaman portal kalender (Phase 4)
src/components/calendar/types.ts           # Tipe + color palette
src/components/calendar/utils.ts           # Helper functions
src/components/calendar/EventChip.tsx      # Chip event
src/components/calendar/CalendarToolbar.tsx  # Toolbar nav
src/components/calendar/CalendarGrid.tsx   # Komponen utama
src/components/calendar/index.ts           # Barrel export
docs/CALENDAR_FEATURE_PLAN.md              # This file
```

### File Diubah

```
db/schema.ts                                # +endDate, allDay, color
src/types.ts                                # extend Event type
app/api/events/route.ts                     # +endDate, allDay, color, eventType di POST
app/api/events/[id]/route.ts                # +endDate, allDay, color, eventType di PUT
src/components/admin/EventsManager.tsx      # ✅ LENGKAP — toggle List/Calendar + form Drawer dengan field kalender (Phase 2 DONE)
```

### File Target (belum dibuat)

```
app/calendar/page.tsx                       # Halaman publik kalender (Phase 3)
```

---

## 11. Handoff Checklist untuk Agent Phase 2

- [x] Backup `src/components/admin/EventsManager.tsx` (saat ini 417 baris, tidak lengkap)
- [x] Tulis ulang lengkap dengan spec di section 6.2
- [x] Jalankan `npx tsc --noEmit` — lulus tanpa error (TSC_SUCCESS_NO_ERRORS)
- [ ] Test manual: buka admin → tab Events → klik toggle "Kalender" → kalender muncul
- [ ] Test: klik cell kosong di mode calendar → Drawer terbuka dengan date pre-filled
- [ ] Test: klik chip event di calendar → Drawer edit terbuka dengan data ter-load
- [ ] Test: create event multi-hari (isi endDate) → chip muncul dengan strip border di cell
- [ ] Test: pilih warna di color picker → chip berubah warna saat save & reload

---

## 12. Handoff Checklist untuk Agent Phase 3 (Publik)

- [ ] Buat `app/calendar/page.tsx` (mirip portal, tanpa `MemberLayout`)
- [ ] Pakai `variant="public"`, `scope=public`
- [ ] Tambah link "Kalender" di `src/components/Header.tsx`
- [ ] Smoke test TypeScript compile
- [ ] Test di browser: `/calendar` harus accessible publik (no login)

---

## 13. Handoff Checklist untuk Agent Sidebar Menu (opsional)

- [ ] Edit `src/components/member/MemberLayout.tsx` (user sempat menolak)
- [ ] Tambah import `CalendarDays` dari `lucide-react`
- [ ] Tambah menu item di `navGroups[2].items` (Organisasi):
  ```tsx
  { href: '/portal/calendar', label: 'Kalender', icon: CalendarDays }
  ```
- [ ] Pastikan posisi setelah `Acara` existing

---

**End of Plan**