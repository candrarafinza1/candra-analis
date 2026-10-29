# Laporan Kerja Candra Analis

Satu entri per sesi kerja. Terbaru di bawah.

## 28 Okt 2026, 10.10 WIB — Bima
- Tayang di candra-analis.vercel.app: Fase 1 + modul PDF Laras.
- Rafinza (pemilik) menetapkan jam kerja (07–11, 13–22 WIB), aturan keputusan, dan meminta data asli emiten besar syariah serta Asisten AI.
- Fajar mulai verifikasi DES periode I 2026: TLKM, ANTM, ICBP, UNTR, KLBF, ADRO terkonfirmasi.

## 28 Okt 2026, 10.25 WIB — Fajar (via Bima)
- `data/emiten-asli.js` dibuat: TLKM, KLBF, ICBP, ANTM (data tahun buku 2024–2025, bersumber). Belum ditayangkan.
- Jadwal kerja otomatis aktif: setiap jam pukul 07–10 dan 13–21 WIB.
- Istirahat 11.00–13.00. Sesi berikutnya 13.05 WIB.

## 28 Okt 2026, 10.40 WIB — Arif, Dewi, Nina (via Bima)
- Asisten AI selesai: halaman `asisten.html` + fungsi `api/tanya.mjs`. Diuji 9 skenario (tanpa key, key ada, pertanyaan kosong/terlalu panjang, batas 6 pertanyaan per menit, kuota habis). Semua lolos.
- Menunggu Pak Rudi memasang `GEMINI_API_KEY` di Vercel.

## 28 Okt 2026, 11.05 WIB — Bima
- Rafinza memasang `GEMINI_API_KEY` di Vercel. Nina mengecek di sesi 13.05.
- Rafinza ke luar kota dan memberi mandat sementara ke Bima. Laporan malam 22.00 wajib membandingkan website versi pertama (commit 7836fd4, 28 Okt 09.25) dengan versi saat itu.
- Istirahat 11.00–13.00.

## 28 Okt 2026, 13.20 WIB — Fajar, Nina (via Bima)
- Nina: cek Asisten AI live **macet**, karena lingkungan kerja tim tidak bisa membuka vercel.app. Push pukul 11.06 (setelah key dipasang 11.05) seharusnya sudah memicu deploy ulang dengan key. Tidak diemailkan karena belum terbukti rusak.
- Fajar: `data/emiten-asli.js` bertambah 11 emiten menjadi 15 (UNTR, INDF, UNVR, PTBA, MYOR, SIDO, CPIN, JPFA, INTP, SMGR, AKRA). Tiap baris DES dikutip dari PDF DES Mei 2026 dan dicek silang. Angka yang tidak pasti dibiarkan kosong (null) dan diberi catatan (laba UNVR & INTP 2025 kemungkinan memuat keuntungan sekali-waktu, laba AKRA 2024 tidak konsisten antar-sumber).
- Nina: `tests/cek.mjs` kini memeriksa `desBaris` dan `sumber` di data asli. Semua pemeriksaan lolos. Data asli belum tampil di website.
- Masalah berat: tidak ada.

## 28 Okt 2026, 14.15 WIB — Fajar (via Bima)
- Neraca 31 Des 2025 (liabilitas & ekuitas) terisi untuk 6 emiten: KLBF, ANTM, UNTR, CPIN, INTP (siaran pers resmi Indocement), AKRA. Pendapatan 2024 AKRA terisi. Semua bersumber dan dicek liabilitas + ekuitas = total aset.
- JPFA & SMGR dibiarkan kosong: angka di berita tidak cocok dengan total asetnya. PDF laporan resmi emiten (unitedtractors.com, sig.id) diblokir proxy lingkungan kerja, jadi dicari lewat berita.
- ANTM: laba 2025 beda antar-sumber (Rp7,92 T vs Rp7,21 T), dicatat agar dicek sebelum masuk Peringkat.
- `node tests/cek.mjs` lolos. Tampilan tidak berubah (data asli belum ditayangkan).
- Masalah berat: tidak ada.

## 28 Okt 2026, 14.45 WIB — Galih, Yoga, Nina, Dewi (via Bima)
- **Data asli tayang.** Peringkat dan Radar Risiko kini memakai 15 emiten syariah asli (kode asli, baris DES, tautan sumber). Data contoh berkode fiktif (CA01–CA14) dihapus.
- Galih: kriteria Peringkat = laba 2025, pertumbuhan laba, pertumbuhan pendapatan, ROE (laba ÷ ekuitas). Radar: rugi, laba turun (>50% = merah), pendapatan turun, DER > 2, catatan data.
- Hana (aturan): ANTM, UNVR, INTP tidak ikut Peringkat sampai laba atribusinya dipastikan; tetap tampil di Radar dengan catatannya.
- Nina: tes diperbarui (minimal 15 emiten asli), tampilan dicek 1280px & 390px, tanpa galat. Temuan: SMGR −73,5% vs −76,8% di judul sumber → tugas cek ulang Fajar.
- Masalah berat: tidak ada.

## 28 Okt 2026, 15.10 WIB — Bima
- Karyawan ke-12 bergabung: **Kirana, tim kreatif** (permintaan Rafinza). Tugas: ide tampilan, fitur, dan animasi mengikuti tren, ditulis di `IDE.md`; Bima memilih, Dewi/Arif mengerjakan.
- Rafinza: Asisten AI masih "belum aktif" pukul 15.07, padahal sudah ada dua deploy setelah key dipasang. Dugaan: key tersimpan sebagai variabel umum akun Vercel, belum terhubung ke project. Menunggu Rafinza membuka /api/tanya untuk memastikan.

## 28 Okt 2026, 15.25 WIB — Kirana, Bima
- Kirana: audit kreatif pertama selesai. Enam halaman dicek di 1280px & 390px (tanpa scroll horizontal). 6 usulan ditulis di `IDE.md` (2 tampilan, 2 fitur, 2 animasi) dengan acuan tren 2026. Temuan utama: tabel Peringkat terpotong di HP, tombol pilihan menumpuk, istilah tanpa penjelasan di tempat.
- Bima memilih 2 usulan paling berdampak: tabel Peringkat jadi kartu di HP (Dewi) dan kamus istilah di tempat (Arif). Masuk BACKLOG.
- Asisten AI: sudah terbukti masih "belum aktif" (dilihat Rafinza 15.07) dan perbaikannya butuh akun Vercel → dicatat di "Menunggu keputusan Rafinza" dan diemailkan sekali (langkah cek & Redeploy).
- `node tests/cek.mjs` lolos. Tampilan website tidak berubah.

## 28 Okt 2026, 16.15 WIB — Dewi, Nina (via Bima)
- Dewi: tabel Peringkat kini tampil sebagai kartu di HP (di bawah 600px): nomor + kode besar, nama, sektor, angka utama besar, angka lain berlabel, tautan sumber. Desktop tetap tabel. Hanya CSS + label `data-label` di `assets/app.js`.
- Nina: dicek di 1280px & 390px, tanpa scroll horizontal dan tanpa galat. `node tests/cek.mjs` lolos.
- Kirana diberi tugas meninjau hasilnya. Berikutnya: Arif, kamus istilah di tempat.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 28 Okt 2026, 17.30 WIB — Arif, Nina (via Bima)
- Arif: **kamus istilah di tempat** tayang (usulan Kirana #3). 15 istilah di `data/istilah.js`; istilah bergaris putus-putus di Peringkat, Radar Risiko, dan halaman pelajaran. Ketuk/Enter membuka penjelasan singkat + tautan ke pelajaran terkait; Esc atau ketuk di luar menutup. Di Peringkat ada baris "Bingung istilahnya?" agar tetap terjangkau di HP.
- Nina: tes kini memeriksa kelengkapan kamus dan tautan pelajarannya. Dicek di 1280px & 390px: tanpa scroll horizontal, kotak tidak keluar layar, urutan Tab wajar. `node tests/cek.mjs` lolos.
- Berikutnya: Sari & Laras (dan Hana untuk istilah syariah) meninjau teks kamus; Kirana meninjau tampilannya.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 28 Okt 2026, 18.35 WIB — Kirana, Sari, Laras, Hana, Dewi, Nina (via Bima)
- Kirana: tinjauan kartu Peringkat & kotak istilah selesai (IDE.md). Kartu sudah baik; masalah yang tersisa: tombol pilihan menumpuk sehingga kartu pertama di bawah layar pertama → Bima memilih usulan #2 untuk Dewi.
- Dewi: tautan "Sumber" di Peringkat kini berlabel "Sumber data KODE (tab baru)" untuk pembaca layar.
- Sari & Laras & Hana: teks kamus istilah ditinjau; 4 penjelasan diperbaiki, JII70 ditambah (16 istilah). DES kini menegaskan bahwa masuk daftar bukan saran membeli.
- Dewi: usulan Kirana #2 tayang. Di HP, empat tombol pilihan Peringkat jadi kisi 2×2 dan menu atas muat satu baris; jarak judul dirapatkan.
- Dewi: kotak keterangan data di Peringkat & Radar diringkas; rincian sumber dan nomor KEP DES pindah ke "Tentang data ini" (tetap bisa dibuka, termasuk dengan keyboard). Hana: nama Daftar Efek Syariah OJK tetap tampil di kalimat inti. Kartu Peringkat pertama kini masuk layar pertama HP (mulai 725px dari 1029px sebelum sesi ini).
- Nina: 7 halaman dicek di 320/360/390/1280px, tanpa scroll horizontal dan tanpa galat. `node tests/cek.mjs` lolos.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).


## 28 Okt 2026, 19.50 WIB — Kirana, Fajar, Nina (via Bima)
- Kirana: Peringkat di HP ditinjau ulang setelah perubahan 18.35. Kartu pertama masuk layar pertama (725px di 390×844), tombol 2×2 cukup besar, "Tentang data ini" berfungsi. Tidak ada perbaikan baru.
- Fajar: 3 emiten syariah baru masuk data asli: MIKA (DES baris 418, dari laporan keuangan resmi 2025), CTRA (457), BSDE (454). Total 18 emiten. Neraca tiap emiten dicek: liabilitas + ekuitas = total aset.
- Fajar: SMGR ditandai periksaUlang (tidak ikut Peringkat) karena tiga sumber memberi angka laba diatribusikan berbeda; laporan resmi PDF tidak terbaca alat tim. Masalah ringan, lanjut.
- Nina: `node tests/cek.mjs` lolos (18 emiten). Peringkat dicek di 390px & 1280px tanpa scroll horizontal dan tanpa galat.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 28 Okt 2026, 20.35 WIB — Fajar, Hana, Nina (via Bima)
- Fajar: 5 emiten syariah baru masuk data asli: MAPI (DES baris 356), HEAL (410), ACES (294), ISAT (556), EXCL (547). Total 23 emiten. Semua laba = laba diatribusikan kepada pemilik entitas induk; neraca tiap emiten dicek: liabilitas + ekuitas = total aset. HEAL, ACES, ISAT dicek silang ke dua sumber.
- Fajar: MAPI ditandai periksaUlang (tidak ikut Peringkat) karena dua sumber beda angka laba 2025 (Rp2,23 T vs Rp2,33 T). EXCL mencatat rugi 2025; diberi catatan bahwa angka 2024 sebelum penggabungan XL–Smartfren. Masalah ringan, lanjut.
- Hana: kelima kode sudah dikutip barisnya dari DES periode I 2026 sebelumnya.
- Nina: `node tests/cek.mjs` lolos (23 emiten). Peringkat & Radar dicek di 390px & 1280px tanpa scroll horizontal dan tanpa galat.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 28 Okt 2026, 21.25 WIB — Fajar, Hana, Nina (via Bima)
- Fajar: BRIS (Bank Syariah Indonesia, DES baris 3) masuk data asli. Laba bersih 2025 Rp7,56 T (2024 Rp7,00 T), ekuitas Rp51,95 T; dua sumber (Emitennews, BCA Sekuritas) sama. Total 24 emiten.
- Hana & Fajar: karena bank syariah punya dana syirkah temporer Rp299,31 T di luar liabilitas, DER BRIS sengaja tidak dihitung agar Radar tidak salah menandai "utang tinggi". Pendapatan bank dikosongkan (sumber tidak memberi satu angka total). Cek: liabilitas + syirkah temporer + ekuitas = aset Rp456,19 T.
- Bima: sisa kandidat (AADI, ITMG, PGAS, MDKA, TPIA, HRUM, MBMA) melapor dalam dolar AS → tugas baru untuk Galih menentukan cara tampilnya dulu. Masalah ringan.
- Nina: `node tests/cek.mjs` lolos (24 emiten). Peringkat & Radar dicek di 390px & 1280px tanpa scroll horizontal dan tanpa galat.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 29 Okt 2026, 07.10 WIB — Fajar, Hana, Sari, Yoga, Nina (via Bima)
- Bima: email masuk kerja pagi terkirim ke Rafinza; 6 karyawan tanpa tugas (Sari, Arif, Nina, Tegar, Yoga, Kirana) diberi tugas pendukung di BACKLOG.md.
- Fajar: kolom kosong batch 1 dilengkapi. Laba 2024 MYOR Rp3,00 T (Fortune IDN, cocok dengan Investortrust & KabarBursa) dan AKRA Rp2,22 T (laba atribusi, Investortrust; cocok dengan kenaikan 11,12% di 2025). Neraca 2025 JPFA dan SMGR terisi; jumlah liabilitas + ekuitas sama dengan total aset. SMGR tetap periksaUlang karena angka labanya. Catatan JPFA yang tertukar teks SMGR dibersihkan.
- Hana & Sari: halaman Metodologi tayang (sumber data, rumus, aturan bank syariah, Radar Risiko, jadwal DES, batasan), bahasa ditinjau Sari. Yoga menautkannya dari kaki semua halaman.
- Nina: `node tests/cek.mjs` lolos (7 halaman, 24 emiten). Dicek di 1280/390/320px tanpa scroll horizontal dan tanpa galat JS.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 29 Okt 2026, 08.20 WIB — Fajar, Galih, Hana, Nina (via Bima)
- Fajar: cek ulang angka bertanda. ANTM laba atribusi 2025 Rp7,21 T (2024 Rp3,65 T) dari Katadata, dicek silang dengan dividen Rp5,04 T = 70% laba (Fortune IDN); Rp7,92 T di JawaPos ternyata laba total. INTP laba atribusi Rp2,24 T (2024 Rp2,00 T) dari BCA Sekuritas. Keduanya kini ikut Peringkat.
- Galih & Hana: UNVR tetap di luar Peringkat karena Rp3,79 T dari laba Rp7,64 T adalah keuntungan sekali-waktu penjualan bisnis es krim (Investortrust). Alasannya tampil di Radar. Tugas baru Galih: aturan tertulis untuk keuntungan sekali-waktu.
- Fajar: MAPI dan SMGR masih bertanda (sumber berbeda, laporan resmi belum terbaca). Laba 9 bulan 2026 emiten kita belum terbit saat dicek. Masalah ringan, lanjut.
- Bima: tugas Data asli batch 1 ditutup; harga & DPS dipindah ke tugas tersendiri karena belum ditampilkan.
- Nina: `node tests/cek.mjs` lolos (24 emiten). Peringkat & Radar dicek di 1280px & 390px tanpa scroll horizontal dan tanpa galat JS.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 29 Okt 2026, 09.40 WIB — Fajar, Galih, Hana, Nina (via Bima)
- Fajar: laba 9 bulan (Januari–September) 2026 dan pembanding 2025 masuk untuk 4 emiten yang sudah rilis: ANTM (Rp8,83 T vs Rp5,97 T, laba atribusi), UNTR (Rp4,47 T vs Rp11,48 T), ISAT (Rp4,92 T vs Rp3,56 T), UNVR (Rp4,20 T vs Rp3,33 T). Tiap angka bersumber; selisih antarsumber dicatat di `catatan9b`.
- Fajar: ANTM sengaja memakai laba atribusi, bukan Rp9,66 T (laba periode berjalan) yang ramai dikutip media. UNTR turun 61%, antara lain karena pos sekali-waktu Rp3,5 T (Kontan).
- Galih & Hana: Radar Risiko kini membandingkan laba 9 bulan 2026 vs 2025 (rugi/turun ≥50% = tinggi, turun = sedang, naik = info). Aturannya ditulis di halaman Metodologi. UNTR kini tampil dengan tanda tinggi.
- Nina: `node tests/cek.mjs` lolos (24 emiten). Radar dicek di 1280px & 390px tanpa scroll horizontal dan tanpa galat JS.
- Masalah ringan: 20 emiten lain belum rilis atau belum ditemukan sumbernya; dilanjutkan sesi berikutnya. Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).

## 29 Okt 2026, 10.30 WIB — Fajar, Galih, Nina (via Bima)
- Fajar: laba 9 bulan 2026 vs 2025 masuk untuk 2 emiten lagi (kini 6 dari 24): SIDO Rp619,1 M vs Rp818,54 M (turun 24%, laba atribusi, Databoks; IDX Channel sama) dan AKRA Rp2,21 T vs Rp1,65 T (naik 34%, laba atribusi, StockWatch & Kontan). Rp2,44 T AKRA di media adalah laba periode berjalan, sengaja tidak dipakai.
- Fajar: MAPI sudah rilis, tetapi tiga sumber memberi angka berbeda (Rp1,72 T / Rp2,0 T / Rp2,1 T) tanpa menyebut laba atribusi → belum dimasukkan. Emiten lain belum rilis saat dicek. Masalah ringan, lanjut sesi berikutnya.
- Galih: Radar Risiko otomatis membaca angka baru (SIDO tampil dengan tanda laba 9 bulan turun).
- Nina: `node tests/cek.mjs` lolos (24 emiten). Radar & Peringkat dicek di 1280px & 390px tanpa scroll horizontal dan tanpa galat JS.
- Masalah berat: tidak ada baru (Asisten AI tetap menunggu Rafinza di Vercel, sudah diemailkan, tidak diulang).
