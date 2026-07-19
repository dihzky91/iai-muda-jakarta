# Rencana Migrasi Arsitektur: Vite + Express ke Next.js (App Router)

Rencana ini dibuat untuk memandu proses refaktorisasi basis kode **IAI Muda Jakarta** dari arsitektur Single Page Application (SPA) berbasis Vite + Express (API terpisah) menjadi framework fullstack modern **Next.js (App Router)** dengan tetap menggunakan **Drizzle ORM** dan database TiDB MySQL.

---

## 1. Keuntungan Target Arsitektur
* **Direct Database Queries**: Komponen halaman publik dapat langsung memanggil Drizzle `db.select()` tanpa `fetch` API async, menghilangkan jeda loading / *layout shift* di browser.
* **SEO Out-of-the-box**: Server-Side Rendering (SSR) dinamis memastikan mesin pencari (Google, Bing) dapat merayapi data artikel, event, dan kepengurusan secara sempurna.
* **Rute Lebih Teratur**: Navigasi menggunakan rute asli web (`/`, `/event`, `/artikel`, `/admin`) alih-alih conditional rendering tab di `App.tsx`.

---

## 2. Struktur Direktori Target (Next.js App Router)

```text
iai-muda-jakarta/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout (memuat CSS global & font)
│   ├── page.tsx                   # Landing page (dulu bagian utama App.tsx)
│   ├── admin/
│   │   ├── page.tsx               # Dashboard Admin (dulu AdminCMS.tsx)
│   │   └── login/
│   │       └── page.tsx           # Form Login Admin
│   ├── api/                       # API Route Handlers
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── members/[id]/route.ts
│   │   ├── members/route.ts
│   │   ├── events/route.ts
│   │   └── settings/route.ts
│   └── globals.css                # CSS Global (pindahan dari index.css)
├── components/                    # Komponen UI (Client & Server Components)
│   ├── OrganizationalStructure.tsx
│   ├── EventList.tsx
│   ├── ArticleList.tsx
│   └── AdminCMS.tsx
├── db/                            # Konfigurasi Drizzle & Schema (dari src/db)
│   ├── index.ts
│   └── schema.ts
├── middleware.ts                  # Proteksi route admin via Next.js Middleware
├── package.json
└── next.config.ts
```

---

## 3. Langkah-Langkah Migrasi Detail

### Langkah 1: Inisialisasi & Dependensi
1. Hapus konfigurasi Vite (`vite.config.ts`, `index.html`) dan Express (`server.ts`).
2. Instal dependensi Next.js:
   ```bash
   npm install next react react-dom
   npm install -D @types/react @types/react-dom postcss tailwindcss
   ```
3. Sesuaikan skrip di `package.json`:
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "db:generate": "drizzle-kit generate",
     "db:push": "drizzle-kit push",
     "db:seed": "tsx db/seed.ts"
   }
   ```

### Langkah 2: Konfigurasi Database & Schema
1. Pindahkan folder `src/db/` ke `/db` di root direktori.
2. Di `db/index.ts`, pastikan koneksi TiDB menggunakan SSL `rejectUnauthorized: false` tetap dipertahankan seperti sebelumnya.
3. Update path impor skema di file migrasi dan `drizzle.config.ts` jika ada.

### Langkah 3: Migrasi Autentikasi (Middleware)
1. Ganti sistem session cookie Express dengan JWT Cookie yang dikelola di **Next.js Middleware**.
2. Buat file `middleware.ts` di root direktori:
   * Periksa keberadaan cookie `auth_token`.
   * Jika user mengakses `/admin` tanpa token valid, arahkan (redirect) secara otomatis ke `/admin/login`.
   * Jika token valid, lanjutkan request.

### Langkah 4: Migrasi API Route Handlers
Ubah handler endpoint Express di `server.ts` menjadi Route Handlers di Next.js:

* **Express**:
  ```ts
  app.get('/api/settings', async (req, res) => { ... })
  ```
* **Next.js (`app/api/settings/route.ts`)**:
  ```ts
  import { NextResponse } from 'next/server';
  import { db, schema } from '@/db';
  
  export async function GET() {
    try {
      const rows = await db.select().from(schema.settings).limit(1);
      return NextResponse.json({ success: true, data: rows[0] });
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
  }
  ```

### Langkah 5: Pemetaan Halaman Utama (`App.tsx`)
Pecah file tunggal `App.tsx` (Vite) menjadi rute Next.js yang sesungguhnya untuk navigasi yang lebih bersih:

1. **Halaman Publik Utama (`app/page.tsx`)**:
   * Ambil data `settings`, `pillars`, `events`, dan `members` langsung di server (SSR).
   * Render header, hero section, pilar visi-misi, dan footer secara dinamis.
2. **Tab Kepengurusan / Struktur**: Pindahkan logika ke halaman `/app/struktur/page.tsx` or render langsung sebagai *island component* di landing page menggunakan `use client` untuk tab saringan divisinya.
3. **Admin Dashboard (`app/admin/page.tsx`)**:
   * Tandai dengan `'use client'` di baris paling atas karena banyak interaksi state (CRUD forms).
   * Ambil data user dari state autentikasi client.

---

## 4. Penyesuaian Variabel Lingkungan (Env)
Ubah penamaan env agar kompatibel dengan Next.js:
* Variabel yang dibutuhkan di sisi client-side harus diberi awalan `NEXT_PUBLIC_` (misalnya: `NEXT_PUBLIC_APP_URL` menggantikan `APP_URL`).
* Kunci sensitif database seperti `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET` tetap dibaca di server saja tanpa awalan.

---

> [!IMPORTANT]
> **Catatan Penting untuk Eksekutor:**
> * Seluruh komponen visual dan animasi Tailwind yang sudah kita rapikan sebelumnya harus dipertahankan. Jangan mengubah style CSS yang sudah WOW dan premium.
> * Masalah sinkronisasi data yang sebelumnya memicu data kembali ke `defaults.ts` kini dapat diselesaikan dengan mem-pass data dari Server Component ke Client Component sebagai props initial value, sehingga tidak ada lagi double-fetch `useEffect` di client.
