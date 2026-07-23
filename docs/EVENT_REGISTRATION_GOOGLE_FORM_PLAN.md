# Rencana Implementasi: Pendaftaran Acara via Google Form

> **Status:** Draft  
> **Tujuan:** Mengadopsi Google Form sebagai mekanisme pendaftaran acara IAI Muda Jakarta, dengan integrasi link pendaftaran per-event pada website.

---

## 1. Latar Belakang

Saat ini, halaman publik website IAI Muda Jakarta menampilkan daftar acara, namun tombol "Daftar Sekarang" masih membuka **modal form internal** (`EventsList.tsx`) yang hanya mensimulasikan proses pendaftaran tanpa menyimpan data ke backend. Panitia kegiatan sebenarnya ingin menggunakan **Google Form** sebagai kanal pendaftaran resmi.

Database sudah menyediakan kolom `registrationUrl` pada tabel `events`, tetapi kolom tersebut belum dimanfaatkan secara maksimal di beberapa titik UI.

---

## 2. Tujuan

1. Mengaktifkan kolom `registrationUrl` agar tiap acara dapat memiliki link Google Form sendiri.
2. Mengarahkan pengunjung website langsung ke Google Form saat menekan tombol "Daftar Sekarang".
3. Memberikan pengalaman yang konsisten baik di **homepage publik**, **halaman acara**, maupun **member dashboard**.
4. Memungkinkan admin mengelola link pendaftaran melalui panel admin.
5. Menjaga fleksibilitas: acara boleh punya Google Form, tanpa form, atau menggunakan form internal sebagai fallback.

---

## 3. Mekanisme Utama

### 3.1 Data Model

Tabel `events` sudah memiliki kolom:

```ts
registrationUrl: varchar('registration_url', { length: 500 })
```

Kolom ini menjadi **sumber kebenaran** link pendaftaran untuk masing-masing acara.

### 3.2 Alur Pengguna

#### A. Pengunjung Umum (Public Site)

| Kondisi | Perilaku Tombol "Daftar Sekarang" |
|---------|-----------------------------------|
| Event memiliki `registrationUrl` | Buka Google Form di tab baru (`target="_blank"`) |
| Event tidak memiliki `registrationUrl` dan status `upcoming`/`ongoing` | Tampilkan modal form internal sebagai fallback atau tampilkan status "Link pendaftaran menyusul" |
| Event status `completed` | Tombol disabled: "Pendaftaran Ditutup" |

#### B. Anggota Terdaftar (Member Dashboard)

Komponen `UpcomingEvents.tsx` sudah menggunakan `<Link href={event.registrationUrl}>`. Perlu memastikan:
- Link eksternal dibuka di tab baru.
- Jika tidak ada `registrationUrl`, tombol menampilkan "Lihat Detail" dan tidak mengarah ke `#`.

#### C. Sorotan Acara di Homepage

Tombol "Daftar Sekarang Secara Gratis" pada *featured event* spotlight saat ini hanya berpindah tab ke halaman Acara. Direkomendasikan agar langsung mengarah ke `registrationUrl` acara yang sedang di-highlight.

---

## 4. Implementasi Teknis

### 4.1 Komponen yang Perlu Diubah

| File | Perubahan |
|------|-----------|
| `src/components/EventsList.tsx` | Ganti modal internal dengan redirect ke `registrationUrl` bila tersedia. Pertahankan fallback modal jika URL kosong. |
| `src/components/member/dashboard/UpcomingEvents.tsx` | Pastikan link eksternal dibuka di tab baru; perbaiki fallback jika `registrationUrl` kosong. |
| `app/HomeClient.tsx` | Pada *featured event spotlight*, ubah tombol "Daftar Sekarang Secara Gratis" agar mengarah langsung ke `registrationUrl`. |
| `src/components/AdminCMS.tsx` *(atau komponen form event di admin)* | Tambahkan input field "Link Google Form" yang terhubung ke `registrationUrl` saat create/update event. |
| `app/api/events/route.ts` | Tambahkan validasi URL sederhana untuk `registrationUrl` (opsional tapi direkomendasikan). |
| `app/api/events/[id]/route.ts` | Pastikan field `registrationUrl` tetap terupdate melalui endpoint PUT. |

### 4.2 Perilaku Tombol Detail

```tsx
// Pseudocode untuk EventsList.tsx
const handleRegisterClick = (event: Event) => {
  if (event.registrationUrl) {
    window.open(event.registrationUrl, '_blank', 'noopener,noreferrer');
  } else {
    setRegisteringEvent(event); // fallback modal internal
  }
};
```

### 4.3 Validasi URL di API

Tambahkan validasi opsional agar admin tidak salah memasukkan link:

```ts
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
```

Jika `registrationUrl` diisi, harus lolos validasi format URL dasar.

---

## 5. Fitur Tambahan (Opsional)

### 5.1 Prefill Data Member ke Google Form

Jika user sudah login sebagai member, kita bisa mengisi otomatis Google Form dengan data mereka melalui query parameter. Format umum Google Form:

```
https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.123=NAMA&entry.456=EMAIL
```

**Catatan:** Setiap Google Form memiliki `entry.ID` yang berbeda-beda. Fitur ini membutuhkan:
- Mapping entry ID per form, atau
- Kesepakatan format form yang seragam.

**Rekomendasi:** Implementasikan di iterasi kedua setelah mekanisme redirect dasar berjalan stabil.

### 5.2 Tracking Registrasi

Jika di masa depan ingin menyimpan siapa saja yang sudah mendaftar di database internal, bisa menambahkan tabel `event_registrations`. Namun untuk saat ini, sumber data peserta tetap berada di Google Sheets hasil export Google Form.

---

## 6. Tahapan Pengerjaan

### Fase 1: Redirect Dasar
- [ ] Update `EventsList.tsx`: tombol "Daftar Sekarang" redirect ke `registrationUrl` jika ada.
- [ ] Update `UpcomingEvents.tsx`: buka link eksternal di tab baru.
- [ ] Update `HomeClient.tsx`: spotlight CTA langsung ke `registrationUrl`.

### Fase 2: Admin Panel
- [ ] Tambah input "Link Google Form" pada form create/edit event di admin.
- [ ] Pastikan field `registrationUrl` tersimpan melalui API.

### Fase 3: Validasi & Polish
- [ ] Tambah validasi URL di API `POST /api/events` dan `PUT /api/events/[id]`.
- [ ] Handle edge case: `registrationUrl` kosong, event completed, dan link tidak valid.
- [ ] Uji end-to-end dari publik site, member dashboard, dan admin panel.

### Fase 4: Enhancement (Opsional)
- [ ] Riset dan implementasikan prefill data member ke Google Form.
- [ ] Pertimbangkan penambahan tabel `event_registrations` untuk tracking internal.

---

## 7. Pertimbangan Keamanan

1. **External Link:** Selalu buka Google Form dengan `target="_blank"` dan tambahkan atribut `rel="noopener noreferrer"` untuk mencegah tabnabbing.
2. **URL Validation:** Pastikan admin hanya bisa menyimpan URL valid di kolom `registrationUrl`.
3. **Sanitasi:** Jangan biarkan nilai `registrationUrl` kosong mengarahkan pengguna ke halaman tidak valid (`href="#"`).

---

## 8. Keuntungan Solusi Ini

- **Tidak perlu membangun backend pendaftaran baru.**
- **Panitia tetap menggunakan Google Form** yang sudah familiar dan terintegrasi dengan Google Sheets.
- **Fleksibel per acara:** tiap kegiatan bisa punya form berbeda atau tidak pakai form sama sekali.
- **Cepat diimplementasikan** karena tidak memerlukan perubahan skema database.
- **Pengalaman pengguna tetap mulus** dari homepage hingga dashboard anggota.

---

## 9. Kesimpulan

Mekanisme yang paling praktis adalah **memanfaatkan kolom `registrationUrl` yang sudah ada**, lalu mengarahkan pengguna langsung ke Google Form saat tombol daftar ditekan. Admin mengelola link tersebut dari panel admin. Pendekatan ini minim perubahan, cepat, dan sesuai dengan kebutuhan operasional IAI Muda Jakarta saat ini.
