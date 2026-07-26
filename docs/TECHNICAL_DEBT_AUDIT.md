# Audit Efisiensi Kode — Status & Sisa Pekerjaan

**Tanggal audit:** 26 Juli 2026
**Cakupan:** seluruh repo (`app/`, `src/`, `lib/`, `db/`)
**Status:** 15 dari 16 temuan selesai. Sisanya menunggu keputusan, bukan menunggu waktu.

Dokumen ini dipakai untuk melacak apa yang sudah dibereskan dan apa yang belum.
Bagian [Belum Selesai](#belum-selesai) dan [Menunggu Keputusan](#menunggu-keputusan)
adalah backlog yang bisa langsung diambil kapan saja.

---

## Ringkasan Angka

| Ukuran | Sebelum | Sesudah |
|---|---|---|
| Connection pool MySQL | 2 (ganda) | 1 |
| Query homepage | 7 berurutan | 7 paralel + ISR 5 menit |
| `as any` di kode | 29 | **0** |
| `: any` total | 112 | 35 (32 di antaranya `catch`) |
| Route API pakai `getUserFromRequest` manual | 34 | 3 (sengaja) |
| Blok `try/catch` di `app/api` | 54 | 7 (sengaja) |
| Library bcrypt | 2 | 1 |
| `<img>` tanpa optimasi | 11 | 2 (sengaja) |
| `MembersManager.tsx` | 1400 baris | 899 baris |
| Index DB pada kolom FK/filter | 2 tabel | 6 tabel |

---

## Selesai

Sembilan commit, dari `c81cbe1` sampai `c1efaec`, plus pemecahan `MembersManager`.

### 1. Connection pool DB ganda — `c81cbe1`
`lib/db.ts` dan `db/index.ts` masing-masing memanggil `mysql.createPool()`, jadi satu
proses membuka dua pool dan memakai dua kali jatah koneksi TiDB. Sekarang `db/index.ts`
hanya me-re-export. Ditambah penjaga `globalThis` supaya hot-reload dev tidak menumpuk
pool baru.

### 2. Waterfall query homepage — `c81cbe1`
Tujuh query independen dijalankan satu per satu. Satu query cold ke TiDB terukur
**2302 ms**, jadi waterfall-nya mendominasi TTFB. Sekarang `Promise.all`, dan
`fetchWithRetry` membungkus ketujuhnya (sebelumnya hanya `settings`).

**Perubahan perilaku:** `force-dynamic` → `revalidate = 300`. Edit dari CMS baru tampil
maksimal 5 menit kemudian. Untuk instan, panggil `revalidatePath('/')` dari route
handler CMS setelah simpan. Untuk membatalkan, kembalikan `app/page.tsx` ke
`export const dynamic = 'force-dynamic'` — paralelisasinya tetap jalan.

### 3. Filter di memori, bukan di SQL — `c81cbe1`, `b206ddc`
`GET /api/member/events` dan `GET /api/events` menarik seluruh tabel lalu memfilter di
JS. Sekarang jadi klausa `WHERE`. RSVP anggota digabung lewat `LEFT JOIN` — dua query
plus `Map` di JS jadi satu query.

### 4. Loop fetch berurutan — `c81cbe1`
Impor CSV, tulis-ulang riwayat, dan hapus massal masing-masing mengirim satu request
per item secara berantai. Sekarang lewat `runWithConcurrency` dengan batas 5 — dipilih
menyesuaikan pool server, bukan tak terbatas.

### 5. Index DB — `c81cbe1`
Hanya `event_rsvps` dan `event_committees` yang punya index. 7 index baru pada
`members`, `positions`, `events`, `event_materials`. **Sudah diterapkan ke database
produksi** lewat `db/migrations/add_performance_indexes.ts` (aditif, idempoten,
mencocokkan kombinasi kolom bukan nama). `ANALYZE TABLE` dijalankan setelahnya.

### 6. Query builder digandakan — `0000452`, `b206ddc`
Blok `.select({15 kolom}).leftJoin()` ditulis **empat kali**. Sekarang satu di
`lib/members.ts`. Tiga `as any` yang dipakai membungkam TypeScript ikut hilang.

> **Bug yang ketemu:** cabang non-admin `GET /api/members` memanggil `.where()` dua kali.
> Di Drizzle panggilan kedua **menimpa** yang pertama (diverifikasi lewat `.toSQL()`),
> jadi filter `show_public` lenyap saat `?generationId=` dipakai. Belum pernah bocor —
> semua 40 anggota `show_public = 1` — tapi akan aktif begitu ada yang disembunyikan.

### 7. Props server disalin ke state — `0000452`
`HomeClient` menyalin 7 props ke `useState` lalu menyinkronkan lewat 7 `useEffect` yang
isinya cuma `setState(prop)`. Tidak ada yang dimutasi di klien, jadi itu hanya render
kedua tanpa manfaat. Ikut dibuang: konstanta mati `isLoading`/`hasDbError` beserta 5
cabang skeleton yang tidak pernah tereksekusi.

### 8. Dua library bcrypt — `97afd66`
`bcrypt` (native) di 4 berkas, `bcryptjs` di `lib/auth.ts`. Disatukan ke `bcryptjs`
(murni JS, tidak perlu kompilasi saat deploy). Cost factor diseragamkan ke 12.

**Tradeoff:** `bcryptjs` ~2,4× lebih lambat — hash cost 12 terukur **594 ms** vs ~250 ms
native. Kena di jalur login saja. Kalau target deploy aman untuk modul native dan
latensi login lebih penting, arah sebaliknya juga sah.

**Terverifikasi:** hash `$2b$` lama tetap terbaca, `$2a$` juga. Tidak ada password
yang perlu direset.

### 9. Dependency mati — `97afd66`
`@google/genai` nol referensi. Dihapus bersama `GEMINI_API_KEY` di `.env.example`.

### 10. Fetch daftar penuh untuk satu boolean — `feb8018`
Halaman detail event memanggil `/api/member/events/managed` (seluruh event yang
dikelola beserta panitia dan materinya) hanya untuk mencari satu baris. Sekarang info
kepanitiaan ikut di response detail: **2 request / 6 query → 1 request / 4 query
paralel**. Halaman kalender: dua request berantai jadi paralel lewat `allSettled`.

### 11. Keamanan — `19ae778`
Tiga masalah:

- **Cookie admin dan member bernama sama** (`auth_token`). Login portal menimpa sesi
  admin, dan gate `proxy.ts` tidak bisa membedakan tipe — sesi member lolos pemeriksaan
  `/admin`. Sekarang `admin_token` dan `member_token` terpisah.
- **`/portal/*` tidak ada di matcher middleware.** Proteksinya cuma `useEffect` yang
  jalan setelah shell terkirim. Sekarang masuk matcher.
- **Token JWT disalin ke `localStorage`** padahal cookie-nya sudah `httpOnly` —
  meniadakan gunanya. Salinan dihapus; 7 pemanggil beralih ke cookie.

**Konsekuensi:** semua sesi lama terputus. Admin dan anggota perlu login ulang sekali.

Terverifikasi terhadap server berjalan: isolasi antar-area (`member_token` ditolak di
`/admin`, `admin_token` ditolak di `/portal`, `auth_token` lama ditolak di keduanya) dan
API tetap menolak cookie palsu.

### 12. Gambar tanpa optimasi — `577bb4f`
8 gambar dari pipeline upload sendiri dikonversi ke `next/image`.
`res.cloudinary.com` ditambahkan ke `remotePatterns` — tanpa itu 40 gambar akan mati,
karena `next/image` menolak host tak terdaftar dengan HTTP 400, bukan melewatkannya.

Terukur pada gambar nyata: **354 kB asli → 37 kB di w=640 → 8 kB di w=256.**

### 13. Boilerplate route — `faca30e`, `b206ddc`
`lib/api.ts` dengan `publicRoute` / `adminRoute` / `memberRoute` / `memberRouteRaw`,
plus helper `ok` / `done` / `fail`. Status dan bentuk respons **sengaja dipertahankan**
— menyeragamkannya adalah perubahan kontrak untuk frontend.

**Terverifikasi:** 78 kombinasi endpoint × method diprobe sebelum dan sesudah,
hasilnya identik.

### 14. Tipe `any` — `d5515a7`
`as any` 29 → 0. Diperbaiki, bukan sekadar dicast: `Event` kehilangan `generationId`
yang ada di tabel, `icon: any` → `LucideIcon` di 5 komponen, `serialize` jadi generik,
`admin/page.tsx` 7 lambda identik jadi satu `makeSetter<K>` bertipe.

> **Bug yang ketemu:** `db.insert()` pada driver mysql2 mengembalikan **tuple**
> `[ResultSetHeader, FieldPacket[]]`, jadi `(result as any).insertId` selalu `undefined`.
> Setiap endpoint create mengembalikan `id: undefined`, dan `resolvePositionId()` gagal
> menautkan jabatan baru — anggota tersimpan dengan `position_id` NULL sampai
> disimpan ulang. Diperbaiki dengan helper `insertedId()`, diverifikasi lewat transaksi
> yang di-rollback.

### 15. Artefak ter-commit — `97afd66`
`tsconfig.tsbuildinfo` (213 kB), `lint-output.txt` (kosong), `query` (berisi teks
`MySQL`) dilepas dari git tracking.

### 16. `MembersManager.tsx` 1400 baris — *belum di-commit*
Dipecah menurut jenis pekerjaan:

| Berkas | Baris | Isi |
|---|---|---|
| `MembersManager.tsx` | 899 | orkestrasi: filter, aksi massal, drawer |
| `admin/members/MemberFormFields.tsx` | 309 | JSX form tiga langkah |
| `admin/members/csv.ts` | 181 | parsing CSV — fungsi murni |
| `hooks/useMemberAccounts.ts` | 155 | status akun portal + aksinya |
| `lib/concurrency.ts` | 33 | `runWithConcurrency` |

**Terverifikasi:** parser lama dijalankan berdampingan dengan yang baru pada 11 bentuk
masukan — hasil identik di semuanya.

### Bonus: bug SEO — `c1efaec`
`HomeClient` menulis `rel=canonical` per tab ke `/struktur`, `/acara`, `/kalender`,
`/galeri`, `/artikel`. **Kelimanya 404** — halaman memberitahu mesin pencari bahwa
alamat resminya adalah URL yang tidak ada. Metadata juga ditulis dari klien setelah
hidrasi, yang tidak pernah dibaca crawler. Sekarang dari `generateMetadata()` di layout,
canonical menunjuk `/`.

---

## Belum Selesai

### #11 — Arsitektur `'use client'` menyeluruh

**Status:** menunggu keputusanmu. Bukan pekerjaan yang bisa dimulai tanpa jawaban.

72 dari 76 komponen `.tsx` bertanda `'use client'`. Halaman publik adalah satu komponen
klien raksasa dengan `currentTab` di state; enam "halaman" berbagi URL `/`:

```
HomeClient                  538 baris   (setelah #7 dan perbaikan SEO)
OrganizationalStructure     603
CalendarGrid                346
GallerySection              262
EventsList                  250
ArticlesSection             174
                          ─────
                          2.173 baris, semuanya 'use client'
```

Browser mengunduh kode keenamnya sebelum menampilkan satu pun. Ini juga yang membatasi
hasil #12: HTML awal berisi **nol** tag `<img>`, karena semua komponen bergambar ada di
tab yang baru dirender setelah diklik. Tidak ada preload, tidak ada prioritas LCP.

**Keputusan yang dibutuhkan:**

1. **URL per tab — mau atau tidak?** Memecah jadi route asli membuat `/struktur`,
   `/acara`, dst. benar-benar ada, dan bisa ditautkan langsung. Kalau URL tidak boleh
   berubah, hampir semua manfaat #11 hilang.
2. **Navigasi tab jadi pindah halaman?** Sekarang klik tab instan tanpa muat ulang.
   Dengan route asli, jadi navigasi sungguhan — `Header` yang menerima `setCurrentTab`
   perlu diganti `<Link>`.
3. **Sekaligus atau bertahap?** Bisa dicicil: server component untuk komponen statis
   dulu, baru pecah routing.

**Kalau dijalankan, rencananya berisi:** peta tab → route, daftar komponen yang bisa
jadi server component vs yang wajib klien, penanganan `Header` dan state tab, strategi
metadata per route, serta urutan langkah yang tiap tahapnya bisa di-build dan
diverifikasi terpisah.

---

## Menunggu Keputusan

Enam item kecil. Semuanya sudah dianalisis; tinggal dieksekusi setelah kamu putuskan.

### A. Baris `positions` yatim di produksi
Sisa dari bug `insertId` (#14). Satu baris jabatan tidak dirujuk siapa pun, dan satu
anggota punya `position_id` NULL:

```
id=476290  sort_order=100  "Wakil Ketua"  [Badan Pengurus Harian (BPH)]
anggota dengan position_id NULL: 1
```

Perlu dilihat anggota mana yang seharusnya menunjuk ke sana — tidak boleh ditebak untuk
data produksi. **Butuh:** konfirmasi dari kamu soal pemetaan yang benar.

### B. Gambar OG hilang
`og-image.png` yang dirujuk metadata mengembalikan **404** secara lokal; direktori
`public/` hanya berisi `uploads/`. Artinya pratinjau tautan di WhatsApp/LinkedIn
kemungkinan tampil tanpa gambar. Domain produksi tidak terjangkau dari sesi audit, jadi
kondisi di sana **belum terpastikan**. **Butuh:** cek produksi; kalau memang hilang,
ini butuh file gambar, bukan perubahan kode.

### C. `positions.name` tanpa unique constraint
Dua request bersamaan dengan nama jabatan sama bisa membuat baris kembar — risiko yang
naik setelah impor CSV dibatch (#4). Dampaknya kosmetik: tiap anggota tetap menunjuk
`positionId` masing-masing. **Butuh:** cek duplikat yang sudah ada dulu, karena
menambah unique index akan gagal kalau ada.

### D. Index redundan
Aman dihapus, tapi DDL ke produksi:

- `events.idx_events_event_type` — kini prefix dari `idx_events_type_date`
- `event_rsvps.fk_2` — duplikat `idx_event_rsvps_member_id`
- `members.id`, `events.id`, `positions.id` — duplikat PRIMARY, efek samping tipe
  `serial` Drizzle

### E. `SkeletonLoader.tsx` jadi yatim
Tidak dipakai siapa pun setelah cabang mati dibuang di #7. Komponennya sendiri wajar
dan mungkin berguna nanti. **Butuh:** keputusan hapus atau simpan.

### F. Subject commit dua commit lama
`feb8018` dan `0000452` subject-nya terambil dari baris body, bukan judul. Kosmetik.
Memperbaikinya berarti menulis ulang riwayat.

---

## Belum Terverifikasi

Dua hal yang perlu dicoba manual sebelum dianggap aman.

### 1. Login end-to-end
Cookie dan hashing berubah di #8 dan #11, tapi **login sukses belum pernah diuji** —
tidak ada kredensial saat audit.

Yang sudah terbukti: hash lama terbaca, gate menolak dengan benar, logout mengeluarkan
nama dan atribut cookie yang tepat, login dengan kredensial salah membalas 401 (bukan
500).

**Cara menutup:** login sekali sebagai admin dan sekali sebagai anggota portal setelah
deploy. Ingat semua sesi lama terputus, jadi ini memang harus dilakukan.

### 2. Cabang panitia di detail event
`event_committees`, `event_materials`, dan `event_rsvps` **semuanya kosong** (0 baris),
jadi panel panitia, daftar materi, dan tombol upload tidak pernah dirender dengan data
nyata.

**Cara menutup:** tugaskan satu anggota sebagai panitia sebuah event, lalu buka
halaman detailnya.

### 3. Tampilan form setelah #16
Pemecahan `MembersManager` diverifikasi lewat tipe, build, dan uji parser CSV. Yang
belum: bahwa form tiga langkah dan dialog akun masih dirender sama persis.

**Cara menutup:** buka CMS, coba tambah pengurus dan panel akun portal.

---

## Catatan Perilaku yang Berubah

Ringkasan hal-hal yang **tidak** netral, untuk rujukan cepat:

| Perubahan | Dampak |
|---|---|
| ISR 5 menit di homepage | Edit CMS tampil maksimal 5 menit kemudian |
| Cookie sesi dipisah | Semua sesi lama terputus, perlu login ulang sekali |
| `bcryptjs` menggantikan `bcrypt` | Verifikasi login ~600 ms (dari ~250 ms) |
| `attendees` & `materials` cek auth lebih dulu | ID tidak valid tanpa sesi → 401 (dari 400) |
| Metadata dari server | Meta per tab hilang; canonical selalu `/` |

---

## Konvensi yang Dipakai

Berguna kalau ada yang melanjutkan:

- **Route API** pakai wrapper di `lib/api.ts`, bukan `getUserFromRequest` manual.
  Tiga pengecualian sengaja: `auth/me` (bentuk sendiri), `calendar/events` dan
  `members` (route publik dengan cek auth kondisional).
- **`insertId`** selalu lewat `insertedId()` dari `lib/db.ts`. Jangan akses
  `result.insertId` — itu `undefined`.
- **Password** selalu lewat `hashPassword`/`comparePassword` di `lib/auth.ts`.
- **Nama cookie** dari `lib/cookies.ts`, bukan `lib/auth.ts` — `proxy.ts` mengimpornya,
  dan `lib/auth.ts` menarik `jsonwebtoken` ke bundle middleware.
- **`next/image`** hanya untuk gambar dari pipeline upload sendiri. URL bebas yang
  diketik admin tetap `<img>`, karena `next/image` gagal keras untuk host di luar
  allowlist. Tiga lokasi sudah diberi komentar alasannya.
