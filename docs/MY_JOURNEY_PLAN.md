# Dokumentasi Perencanaan Fitur: "My IAI Muda Journey" (Jejak Perjalananku)

Fitur **"My IAI Muda Journey"** adalah modul cerita perjalanan personal interaktif (ala *Spotify Wrapped*) yang dirancang untuk seluruh anggota dan pengurus IAI Muda Wilayah DKI Jakarta. Fitur ini menganalisis riwayat keanggotaan secara otomatis dari database dan menyajikannya dalam bentuk slide animasi serta kartu resume yang dapat dibagikan (*shareable card*) ke LinkedIn / Instagram.

---

## 🎯 Tujuan & Nilai Tambah Fitur

1. **Personalized Member Appreciation**: Memberikan apresiasi personal yang berkesan atas waktu, loyalitas, dan dedikasi pengurus.
2. **Organic Social Media Branding**: Memudahkan pengurus mengunggah kartu *journey* mereka ke LinkedIn / Instagram saat masa demisioner atau ulang tahun kepengurusan, sehingga mempromosikan citra IAI Muda DKI Jakarta secara organik.
3. **100% Automated (Zero Admin Overhead)**: Data dihitung otomatis oleh sistem dari tabel `members`, `generations`, `event_committees`, `rsvps`, dan `events`.

---

## 📐 Arsitektur & Logika Sistem

### 1. Nomenklatur Jabatan Organisasi
- **Badan Pengurus Harian (BPH)**: Ketua Umum, Wakil Ketua Umum, Sekretaris, Bendahara.
- **Koordinator Bidang**: Pemimpin divisi (misal: *Koordinator Bidang Edukasi & Sertifikasi*, *Koordinator Bidang Humas*).
- **Sub-Koordinator / Staf**: Anggota pelaksana divisi.

### 2. Smart Narrative Engine (Logika Narasi Otomatis)
Sistem membandingkan data `position` dan `division` antar generasi pada tabel `members`:
- **Pola Promosi**: *Staf ➡️ Koordinator Bidang / BPH*
  > *Narasi*: "Perjalananmu dimulai dari Staf dan sukses dipercaya memimpin sebagai Koordinator Bidang. Lompatan kepemimpinan yang menginspirasi!"
- **Pola Loyalitas Staf**: *Staf ➡️ Staf (2+ Periode)*
  > *Narasi*: "Dua periode penuh dedikasi! Terima kasih atas loyalitas dan konsistensimu memperkuat IAI Muda DKI Jakarta."
- **Pola Rotasi Divisi**: *Staf Divisi A ➡️ Staf Divisi B*
  > *Narasi*: "Berbekal pengalaman di Divisi A, kamu terus memperluas kontribusimu di Divisi B. Pengurus serba bisa!"

---

## 🛠️ Komponen Teknis

### 1. API Endpoint (`app/api/member/journey/route.ts`)
- **HTTP Method**: `GET`
- **Autentikasi**: Memerlukan Session User yang valid.
- **Output JSON**:
  ```json
  {
    "totalServiceTime": "1 Tahun 6 Bulan",
    "generationsCount": 2,
    "careerTrajectory": [
      { "genName": "Generasi ke-1", "years": "2024-2025", "role": "Staf Bidang Edukasi" },
      { "genName": "Generasi ke-2", "years": "2025-2026", "cabinet": "Kabinet Akselerasi", "role": "Koordinator Bidang Edukasi" }
    ],
    "committeeHighlights": [
      { "eventTitle": "Musyawarah Wilayah I", "role": "Ketua Panitia" },
      { "eventTitle": "National Accounting Summit", "role": "Divisi Acara" }
    ],
    "narrativeText": "Pesan apresiasi personal...",
    "badges": ["Veteran Member", "Executive BPH", "Loyal Contributor"]
  }
  ```

### 2. Komponen Frontend UI
- **`src/components/member/MemberJourneyModal.tsx`**:
  - Modal interaktif dengan Framer Motion (Slide 1: Pengabdian, Slide 2: Trajektori Karir, Slide 3: Kepanitiaan, Slide 4: Shareable Card).
- **`src/components/member/MemberProfileView.tsx`**:
  - Banner pemantik: `"✨ Lihat Rekam Perjalananku (My IAI Muda Journey)"`.

---

## 📅 Rencana Pelaksanaan & Pengujian

- [ ] Membuat API `/api/member/journey`
- [ ] Buat komponen Modal `MemberJourneyModal.tsx`
- [ ] Pasang trigger banner di profil member
- [ ] Verifikasi `npx tsc --noEmit`
- [ ] Testing skenario 1 Gen, Multi-Gen Promosi, dan Multi-Gen Staf
