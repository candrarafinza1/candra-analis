# Daftar Tugas Candra Analis

Urutan = prioritas. Ambil tugas teratas yang belum `[x]` dan tidak `[macet]`.
Format: `- [ ] Karyawan: tugas` · selesai: `[x]` · macet: `[macet: alasan]`

## Menunggu keputusan Rafinza
- (kosong) Rafinza sedang ke luar kota mulai 28 Okt dan hanya memantau. Bima memegang perusahaan. Hanya masalah berat yang diemailkan.

## Sedang dikerjakan / berikutnya
- [macet: lingkungan kerja tim tidak bisa membuka candra-analis.vercel.app (diblokir proxy, 28 Okt 13.10). Catatan: ada push ke main pukul 11.06, setelah key dipasang 11.05, jadi deploy otomatis kemungkinan sudah membawa key. Rafinza bisa cek sendiri dengan membuka /api/tanya: harus tampil {"aktif":true}] Nina: **Cek Asisten AI live.** Rafinza memasang `GEMINI_API_KEY` di Vercel pukul 11.05 tanggal 28 Okt. Pastikan halaman Asisten AI tidak lagi menampilkan "belum aktif" dan bisa menjawab. Bila masih belum aktif, kemungkinan belum di-Redeploy, atau key terpasang di project Vercel yang salah (ada dua project: `candra-analis-id` dan `candra-analis-595u`). Ini butuh tindakan Rafinza di Vercel: kirim satu email singkat berisi langkah Redeploy.
- [ ] Fajar: **Data asli batch 1.** Kumpulkan data emiten besar yang terbukti tercatat di DES periode I 2026 (KEP-21/D.04/2026, berlaku 1 Juni 2026). Verifikasi tiap kode dengan mengutip barisnya dari https://idx.id/media/nbkfn2sd/des-mei-2026.pdf. Sudah terverifikasi verbatim: TLKM (580), ANTM (76), ICBP (241), UNTR (199), KLBF (413), ADRO (11). Kandidat berikutnya: INDF, UNVR, AADI, PTBA, ITMG, CPIN, JPFA, SMGR, INTP, EXCL, ISAT, AKRA, PGAS, MDKA, BRIS, MYOR, TPIA, MAPI, ACES, HRUM, MBMA, CTRA, BSDE, SIDO, MIKA, HEAL. Tulis ke `data/emiten-asli.js` (skema di file itu). **Progres 28 Okt 13.20:** 15 emiten sudah ada di `data/emiten-asli.js` (TLKM, KLBF, ICBP, ANTM, UNTR, INDF, UNVR, PTBA, MYOR, SIDO, CPIN, JPFA, INTP, SMGR, AKRA); baris DES 26 kandidat sudah dikutip dan dicek silang (INDF 243, UNVR 290, AADI 8, PTBA 50, ITMG 37, CPIN 220, JPFA 246, SMGR 136, INTP 108, EXCL 547, ISAT 556, AKRA 12, PGAS 46, MDKA 116, BRIS 3, MYOR 259, TPIA 147, MAPI 356, ACES 294, HRUM 33, MBMA 115, CTRA 457, BSDE 454, SIDO 432, MIKA 418, HEAL 410). **Progres 28 Okt 14.15:** liabilitas & ekuitas 2025 terisi untuk KLBF, ANTM, UNTR, CPIN, INTP, AKRA (tiap angka dicek: liabilitas + ekuitas = total aset); pendapatan 2024 AKRA terisi. JPFA & SMGR sengaja dibiarkan kosong karena angka di sumber berita tidak cocok dengan total aset (perlu laporan resmi; PDF resmi emiten diblokir proxy). ANTM: dua sumber beda angka laba (Rp7,92 T vs Rp7,21 T), dicatat. Yang masih kosong: liabilitas & ekuitas JPFA & SMGR, laba 2024 MYOR & AKRA, semua harga, sebagian besar DPS, laba 9 bulan 2026. Berikutnya: lengkapi kolom kosong itu, lalu MAPI, CTRA, BSDE, MIKA, HEAL, ACES, EXCL, ISAT. **Progres lama 28 Okt 10.20:** TLKM, KLBF, ICBP lengkap laba & pendapatan; ANTM perlu cek laba atribusi; UNTR (laba 2025 Rp14,8 T, pendapatan Rp131,3 T, angka 2024 belum ada) dan ADRO (laba 2025 US$447 juta, perlu dikonversi/diberi catatan mata uang) belum dimasukkan. Situs kontan.co.id, bisnis.com, dan idnfinancials sering menolak diakses: pakai investortrust.id, wartaekonomi.co.id, jawapos.com, katadata.co.id, atau laporan resmi emiten. Angka: laba bersih & pendapatan tahun buku 2024 dan 2025, laba 9 bulan 2025 vs 9 bulan 2026 bila sudah rilis, ROE, DER, dividen per saham tahun buku 2025, harga acuan + tanggalnya. Setiap angka wajib punya sumber.
- [x] Galih: (28 Okt 14.45) Sesuaikan rumus Peringkat dan aturan Radar Risiko ke skema data asli (laba tahunan & 9 bulan, bukan 4 kuartal). Tampilkan tautan sumber per emiten.
- [x] Yoga + Nina: (28 Okt 14.45, data contoh dihapus) Ganti `data/emiten.js` (contoh) dengan data asli setelah minimal 15 emiten lengkap. Hapus pita "Data contoh". Pemeriksaan `desBaris` dan `sumber` untuk `data/emiten-asli.js` sudah ditambahkan Nina di `tests/cek.mjs` (28 Okt 13.20).
- [x] Arif: **Asisten AI** (28 Okt, menunggu `GEMINI_API_KEY` di Vercel). Halaman `asisten.html` + fungsi serverless `api/tanya.js` (Vercel) yang memanggil Gemini dengan `GEMINI_API_KEY`. Prompt sistem: menjelaskan istilah, membantu membaca laporan keuangan, memakai data Candra Analis; dilarang memberi perintah beli/jual atau target harga. Batasi panjang pertanyaan dan jumlah permintaan per pengguna. Tanpa API key, tampilkan "belum aktif".
- [ ] Fajar: **Cek ulang angka bertanda.** SMGR: data 719,76 M → 190,84 M = −73,5%, tetapi judul sumber menyebut −76,8% (kemungkinan laba total vs laba entitas induk). ANTM, UNVR, INTP bertanda `periksaUlang: true` (tidak ikut Peringkat) sampai laba atribusinya dipastikan. Hapus tanda bila sudah pasti.
- [ ] Fajar: Tambah emiten syariah besar berikutnya (target 30): AADI, ITMG, EXCL, ISAT, PGAS, MDKA, BRIS, TPIA, MAPI, ACES, HRUM, MBMA, CTRA, BSDE, MIKA, HEAL — tetap wajib kutip baris DES.
- [ ] Kirana: **Audit kreatif pertama.** Buat `IDE.md`. Tinjau semua halaman (1280px & 390px) dan tren desain web serta aplikasi investasi/edukasi 2026. Tulis minimal 6 usulan: 2 tampilan, 2 fitur, 2 animasi, masing-masing dengan alasan, acuan tren, dan perkiraan usaha. Tandai 2 usulan paling berdampak untuk dipilih Bima.
- [ ] Hana: Halaman `metodologi.html`: sumber data, cara menghitung tiap angka, jadwal pembaruan DES, dan penafian.
- [ ] Dewi: Halaman profil emiten `emiten.html?kode=XXXX`: ringkasan usaha, angka utama, status syariah, Radar Risiko, sumber. Tautkan dari tabel Peringkat.
- [ ] Laras: Kuis singkat di akhir tiap pelajaran (3 soal) untuk mengecek pemahaman.
- [ ] Raka: Halaman "Kabar emiten": ringkasan aksi korporasi dan pengumuman penting emiten dalam data kita, dengan tautan sumber.
- [ ] Fajar: **Akhir November 2026**: OJK menerbitkan DES periode II 2026 (berlaku 1 Desember). Perbarui status syariah semua emiten; yang keluar dari DES dimunculkan di Radar Risiko.

## Selesai
- [x] Rafinza: memasang `GEMINI_API_KEY` di Vercel — 28 Okt 11.05
- [x] Dewi, Arif, Nina, Tegar, Yoga: Fase 1 (beranda, kurikulum, peringkat, Radar Risiko, QA, header keamanan) — 28 Okt 2026
- [x] Laras: dua pelajaran praktik, modul PDF, rujukan resmi — 28 Okt 2026

## Skema `data/emiten-asli.js`
```js
window.EMITEN_ASLI = [{
  kode: "TLKM", nama: "PT Telkom Indonesia (Persero) Tbk", sektor: "Infrastruktur",
  desBaris: 580, indeks: ["JII"],             // indeks hanya bila terverifikasi
  labaTahun: { 2024: 0, 2025: 0 },             // laba bersih diatribusikan, miliar Rp
  pendapatan: { 2024: 0, 2025: 0 },            // miliar Rp
  laba9b: { 2025: null, 2026: null },          // 9 bulan, miliar Rp, null bila belum rilis
  roe: 0, der: 0,                              // persen, kali — tahun buku 2025
  dps: 0,                                      // dividen per saham tahun buku 2025, Rp
  harga: { nilai: 0, tanggal: "2026-10-28" },
  sumber: [{ judul: "", url: "" }]
}];
```

## Catatan untuk Rafinza (tidak mendesak)
- Ada dua project Vercel dari repo yang sama (`candra-analis-id` dan `candra-analis-595u`). Setelah asisten terbukti aktif, salah satunya sebaiknya dihapus Rafinza agar build tidak dobel.
