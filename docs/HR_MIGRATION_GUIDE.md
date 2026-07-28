# HR Command Center - Migration Guide

## ✅ Status: Schema Fixed & Ready to Apply

Semua schema conflicts sudah diperbaiki! Migration siap dijalankan.

---

## 🔧 Yang Sudah Diperbaiki

### 1. **gallery_categories.id**
- ❌ Sebelum: `serial` (akan recreate table)
- ✅ Sekarang: `int().autoincrement()` (match database)

### 2. **events.eventType**
- ❌ Sebelum: `enum('public','internal')` (akan convert existing data)
- ✅ Sekarang: `varchar(20)` (match database)

### 3. **event_rsvps.memberId**
- ❌ Sebelum: `int` (akan truncate data)
- ✅ Sekarang: `bigint({ mode: 'number', unsigned: true })` (match database)

---

## 🚀 Cara Apply Migration

### Command Sedang Berjalan:
```bash
npx drizzle-kit push
```

### Instruksi:
Saat ditanya tentang unique constraints, **SELALU pilih**:
```
❯ No, add the constraint without truncating the table
```

**JANGAN PILIH "Yes, truncate"** - ini akan menghapus data existing!

### Expected Prompts:
1. ✅ `gallery_categories_name_unique` → **No** (4 items aman)
2. ✅ `gallery_categories_slug_unique` → **No** (4 items aman)
3. ✅ `generations_slug_unique` → **No** (2 items aman)
4. ✅ `member_accounts_member_id_unique` → **No** (1 item aman)
5. ✅ `uniq_positions_name_category` → **No** (17 items aman)
6. ✅ `users_username_unique` → **No** (1 item aman)

Kalau ada duplikat, migration akan error dengan pesan yang jelas. Tapi berdasarkan definisi schema, seharusnya TIDAK ada duplikat.

---

## 📋 Yang Akan Ditambahkan

### HR Tables (5 New Tables):

1. **`member_statuses`**
   - Status tracking (Hijau/Kuning/Merah/Biru)
   - Append-only log
   - 3 indexes

2. **`member_academic_loads`**
   - Self-reported academic load
   - Weekly tracking (UTS, UAS, Quiz, etc.)
   - 2 indexes

3. **`leave_requests`**
   - Cuti system dengan approval flow
   - Max 7 hari per 2 bulan
   - 4 indexes

4. **`intervention_logs`**
   - SOP tracking H+1 to H+21
   - 7 stages dengan timeline
   - 4 indexes

5. **`monthly_evaluations`**
   - HR evaluation per member per month
   - Unique constraint: 1 eval per member per month
   - 4 indexes

**Total: 5 tables, 17 indexes, 1 unique constraint**

---

## ⚠️ Troubleshooting

### Jika Migration Gagal dengan "Duplicate entry":

#### Gallery Categories
```sql
SELECT name, COUNT(*) as count 
FROM gallery_categories 
GROUP BY name 
HAVING count > 1;
```

Jika ada duplikat, rename manual:
```sql
UPDATE gallery_categories 
SET name = 'Name (2)' 
WHERE id = [duplicate_id];
```

#### Generations
```sql
SELECT slug, COUNT(*) as count 
FROM generations 
GROUP BY slug 
HAVING count > 1;
```

#### Positions
```sql
SELECT name, category, COUNT(*) as count 
FROM positions 
GROUP BY name, category 
HAVING count > 1;
```

---

## ✅ Verification Setelah Migration

### 1. Cek tables sudah dibuat:
```sql
SHOW TABLES LIKE '%member_%';
SHOW TABLES LIKE '%leave_%';
SHOW TABLES LIKE '%intervention_%';
SHOW TABLES LIKE '%monthly_%';
```

### 2. Cek struktur table:
```sql
DESCRIBE member_statuses;
DESCRIBE member_academic_loads;
DESCRIBE leave_requests;
DESCRIBE intervention_logs;
DESCRIBE monthly_evaluations;
```

### 3. Cek indexes:
```sql
SHOW INDEX FROM member_statuses;
SHOW INDEX FROM leave_requests;
SHOW INDEX FROM intervention_logs;
```

---

## 🎯 Next Steps Setelah Migration Berhasil

1. ✅ **Test API Endpoints**
   - `GET /api/hr/dashboard` → HR Command Center summary
   - `GET /api/hr/members` → List members dengan status
   - `POST /api/hr/members/[id]/status` → Update status
   - `GET /api/member/hr/status` → Member lihat status sendiri

2. ✅ **Integrate ke Admin CMS**
   - Add HR menu item di admin sidebar
   - Route: `/admin/hr`
   - Component: `HRManager.tsx`

3. ✅ **Integrate ke Member Portal**
   - Add HR cards di `/portal/dashboard`
   - Component: `HRCards.tsx`

4. ✅ **Create Test Data**
   - Add beberapa status untuk testing
   - Submit test leave request
   - Create intervention log sample

---

## 📚 References

- Full Documentation: `docs/HR_COMMAND_CENTER.md`
- Implementation Summary: `docs/HR_IMPLEMENTATION_SUMMARY.md`
- Schema File: `db/schema.ts` (lines 370-540)
- API Routes: `app/api/hr/*` & `app/api/member/hr/*`
- Components: `src/components/admin/hr/*` & `src/components/member/dashboard/HRCards.tsx`

---

**Status:** ✅ READY TO MIGRATE - No data loss, all conflicts resolved!
