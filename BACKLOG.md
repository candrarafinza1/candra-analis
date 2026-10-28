# Daftar Tugas Candra Analis

Urutan = prioritas. Ambil tugas teratas yang belum `[x]` dan tidak `[macet]`.
Format: `- [ ] Karyawan: tugas` · selesai: `[x]` · macet: `[macet: alasan]`

## Menunggu keputusan Rafinza
- **API key Asisten AI.** Fitur dibangun dengan layanan AI versi gratis (Google Gemini, ada batas harian). Rafinza perlu membuat API key sendiri dan memasangnya di Vercel sebagai `GEMINI_API_KEY`. Sambil menunggu, halaman asisten menampilkan "belum aktif".

## Sedang dikerjakan / berikutnya
- [ ] Fajar: **Data asli batch 1.** Kumpulkan data emiten besar yang terbukti tercatat di DES periode I 2026 (KEP-21/D.04/2026, berlaku 1 Juni 2026). Verifikasi tiap kode dengan mengutip barisnya dari https://idx.id/media/nbkfn2sd/des-mei-2026.pdf. Sudah terverifikasi verbatim: TLKM (580), ANTM (76), ICBP (241), UNTR (199), KLBF (413), ADRO (11). Kandidat berikutnya: INDF, UNVR, AADI, PTBA, ITMG, CPIN, JPFA, SMGR, INTP, EXCL, ISAT, AKRA, PGAS, MDKA, BRIS, MYOR, TPIA, MAPI, ACES, HRUM, MBMA, CTRA, BSDE, SIDO, MIKA, HEAL. Tulis ke `data/emiten-asli.js` (skema di file itu). **Progres 28 Okt 10.20:** TLKM, KLBF, ICBP lengkap laba & pendapatan; ANTM perlu cek laba atribusi; UNTR (laba 2025 Rp14,8 T, pendapatan Rp131,3 T, angka 2024 belum ada) dan ADRO (laba 2025 US$447 juta, perlu dikonversi/diberi catatan mata uang) belum dimasukkan. Situs kontan.co.id, bisnis.com, dan idnfinancials sering menolak diakses: pakai investortrust.id, wartaekonomi.co.id, jawapos.com, katadata.co.id, atau laporan resmi emiten. Angka: laba bersih & pendapatan tahun buku 2024 dan 2025, laba 9 bulan 2025 vs 9 bulan 2026 bila sudah rilis, ROE, DER, dividen per saham tahun buku 2025, harga acuan + tanggalnya. Setiap angka wajib punya sumber.
- [ ] Galih: Sesuaikan rumus Peringkat dan aturan Radar Risiko ke skema data asli (laba tahunan & 9 bulan, bukan 4 kuartal). Tampilkan tautan sumber per emiten.
- [ ] Yoga + Nina: Ganti `data/emiten.js` (contoh) dengan data asli setelah minimal 15 emiten lengkap. Hapus pita "Data contoh". Tambah pemeriksaan: setiap emiten wajib punya `desBaris` dan `sumber`.
- [x] Arif: **Asisten AI** (28 Okt, menunggu `GEMINI_API_KEY` di Vercel). Halaman `asisten.html` + fungsi serverless `api/tanya.js` (Vercel) yang memanggil Gemini dengan `GEMINI_API_KEY`. Prompt sistem: menjelaskan istilah, membantu membaca laporan keuangan, memakai data Candra Analis; dilarang memberi perintah beli/jual atau target harga. Batasi panjang pertanyaan dan jumlah permintaan per pengguna. Tanpa API key, tampilkan "belum aktif".
- [ ] Hana: Halaman `metodologi.html`: sumber data, cara menghitung tiap angka, jadwal pembaruan DES, dan penafian.
- [ ] Dewi: Halaman profil emiten `emiten.html?kode=XXXX`: ringkasan usaha, angka utama, status syariah, Radar Risiko, sumber. Tautkan dari tabel Peringkat.
- [ ] Laras: Kuis singkat di akhir tiap pelajaran (3 soal) untuk mengecek pemahaman.
- [ ] Raka: Halaman "Kabar emiten": ringkasan aksi korporasi dan pengumuman penting emiten dalam data kita, dengan tautan sumber.
- [ ] Fajar: **Akhir November 2026**: OJK menerbitkan DES periode II 2026 (berlaku 1 Desember). Perbarui status syariah semua emiten; yang keluar dari DES dimunculkan di Radar Risiko.

## Selesai
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
