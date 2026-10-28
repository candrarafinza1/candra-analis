# Candra Analis

Belajar dan analisis saham syariah untuk pemula Indonesia.

Candra Analis adalah platform belajar dan penyaji data. Kami tidak memberi ajakan membeli atau menjual saham. Semua status syariah mengacu pada Daftar Efek Syariah (DES) yang ditetapkan OJK.

## Isi saat ini (Fase 1, versi 0.1)

| Halaman | Isi |
|---|---|
| `index.html` | Beranda, jalur belajar, ringkasan alat |
| `belajar.html`, `pelajaran.html` | Delapan pelajaran (enam dasar, dua praktik), modul PDF, dan rujukan resmi |
| `peringkat.html` | Sepuluh saham syariah teratas menurut laba, dividend yield, pertumbuhan pendapatan, atau ROE |
| `radar.html` | Radar Risiko: tanda masalah pada saham yang dipegang, lengkap dengan bukti |
| `asisten.html`, `api/tanya.mjs` | Asisten AI (Google Gemini versi gratis). Aktif setelah `GEMINI_API_KEY` dipasang di Vercel |

**Catatan penting:** `data/emiten.js` masih berisi **data contoh dengan kode fiktif** (CA01–CA14). Setiap halaman yang memakainya menampilkan pita "Data contoh". Pita ini harus tetap ada sampai data sungguhan dipasang.

## Struktur

```
index.html, belajar.html, pelajaran.html, peringkat.html, radar.html
assets/   styles.css, app.js, logo.svg
data/     modul.js (kurikulum), emiten.js (data emiten), rujukan.js (sumber belajar)
assets/modul/  modul-candra-analis.pdf (dibuat dari data/modul.js)
tools/    buat-modul-pdf.py
tests/    cek.mjs (pemeriksaan QA tanpa dependensi)
vercel.json   header keamanan & URL bersih
```

Website statis murni: tanpa proses build, tanpa biaya server. Cukup dibuka lewat Vercel.

## Menjalankan di komputer

```
python3 -m http.server 8000
python3 tools/buat-modul-pdf.py   # setiap kali kurikulum berubah
node tests/cek.mjs
```

## Tim

Perusahaan ini dijalankan tim AI dengan CEO **Bima**. Karyawan melapor ke Bima; Bima menyelesaikan masalah teknis dan hanya membawa keputusan penting ke pemilik.

| Nama | Peran | Tanggung jawab di repo ini |
|---|---|---|
| Raka | Riset Pasar & Tren | Pantauan berita, aksi korporasi, regulasi OJK/BEI |
| Hana | Analis Syariah & Kepatuhan | DES OJK, aturan bahasa (tidak ada ajakan beli/jual), penafian |
| Fajar | Data Engineer | Mengisi `data/emiten.js` dari laporan keuangan BEI & DES OJK |
| Galih | Analis Saham | Rumus peringkat dan aturan Radar Risiko di `assets/app.js` |
| Sari | Konten Edukasi | Kurikulum di `data/modul.js` |
| Laras | Guru & Kurator Belajar | Modul PDF (`tools/buat-modul-pdf.py`), pelajaran praktik, rujukan resmi di `data/rujukan.js` |
| Dewi | Desainer UI & Animasi | `assets/styles.css`, animasi beranda |
| Arif | Engineer Web & AI | Halaman, logika, dan Asisten AI (Fase 2) |
| Nina | QA & Pemantau Error | `tests/cek.mjs`, pemeriksaan tampilan desktop & HP |
| Tegar | Keamanan | Header keamanan di `vercel.json`, perlindungan data |
| Kirana | Tim Kreatif | Usulan tampilan, fitur, dan animasi di `IDE.md`, mengikuti tren |
| Yoga | Deploy & Rilis | Alur `.github/workflows/periksa.yml`, rilis ke Vercel, rollback |

## Aturan rilis

1. Setiap perubahan harus lolos `node tests/cek.mjs`.
2. Bahasa ajakan ("pasti naik", "buruan jual", "rekomendasi beli", dan sejenisnya) ditolak otomatis kecuali dikutip sebagai contoh yang harus diwaspadai.
3. Jika rilis bermasalah, kembalikan ke versi sebelumnya lewat menu **Instant Rollback** di Vercel.

## Rencana

- **Fase 1 (sekarang):** beranda, kurikulum dasar, peringkat, Radar Risiko, semuanya dengan data contoh.
- **Fase 1b:** data sungguhan dari laporan keuangan BEI dan DES OJK periode terbaru, diperbarui terjadwal.
- **Fase 2:** Asisten AI untuk menjawab pertanyaan dan membantu membaca laporan keuangan; simulasi portofolio tanpa uang sungguhan.
- **Fase 3:** akun pengguna dan notifikasi Radar Risiko.
