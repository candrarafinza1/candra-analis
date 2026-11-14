# Bank Ide Kreatif Candra Analis

Diisi oleh **Kirana** (tim kreatif). Bima memilih usulan yang masuk BACKLOG.md.

Format tiap usulan:
- **Judul** — kategori (tampilan / fitur / animasi), usaha (kecil / sedang / besar)
- Masalah atau peluang:
- Ide:
- Acuan tren:
- Dampak bagi pemula:
- Status: usulan / dipilih / dikerjakan / ditolak (alasan)

Syarat semua usulan: tanpa biaya, ringan di HP murah, menghormati `prefers-reduced-motion`,
bisa dipakai dengan keyboard, dan tanpa bahasa ajakan beli/jual.

## Audit kreatif pertama — 28 Okt 2026, 15.15 WIB (Kirana)

Cara audit: keenam halaman (beranda, belajar, pelajaran, peringkat, radar, asisten) dibuka di lebar
1280px dan 390px. Tidak ada scroll horizontal di tingkat halaman. Temuan utama:
- Tabel Peringkat di 390px terpotong: kolom Sektor dan angka baru terlihat bila tabel digeser ke samping.
  Pemula di HP bisa mengira tabel hanya berisi kode dan nama.
- Empat tombol pilihan Peringkat di 390px menumpuk ke bawah, satu per baris, sehingga tabel baru
  terlihat setelah layar kedua. Menu atas juga pecah menjadi dua baris.
- Istilah seperti ROE, DER, laba diatribusikan, dan DES muncul di Peringkat dan Radar tanpa penjelasan
  di tempat. Pemula harus pindah ke halaman Belajar.
- Radar Risiko sebelum memilih saham terlihat kosong (hanya satu kotak pilihan).
- Animasi bulan & lilin di beranda sudah halus dan sudah menghormati `prefers-reduced-motion`.

Acuan tren 2026 yang dipakai:
- Desain fintech 2026 menekankan bahasa sederhana, penjelasan istilah di tempat (progressive
  disclosure), dan tampilan "mobile-first" berbasis kartu, bukan tabel lebar
  ([yellowslice](https://www.yellowslice.in/blog/fintech-ux-design-trends-you-must-know),
  [vezadigital](https://vezadigital.com/post/fintech-web-design-trends),
  [gapsystudio](https://gapsystudio.com/blog/fintech-app-ux)).
- Animasi web 2026 bergeser ke CSS murni: View Transitions antarhalaman dan animasi berbasis scroll
  tanpa pustaka JavaScript ([codercops](https://blog.codercops.com/blog/css-view-transitions-scroll-animations-2026)).

## Usulan

### 1. Tabel Peringkat menjadi kartu di HP ★ paling berdampak
- **Kategori:** tampilan — usaha **kecil–sedang**
- Masalah atau peluang: di 390px tabel Peringkat terpotong; angka yang justru jadi inti halaman tersembunyi di balik geser samping.
- Ide: di bawah lebar ±600px, tiap baris tabel tampil sebagai kartu: nomor urut + kode besar, nama perusahaan, lalu 2–3 angka utama berlabel (misalnya "Laba 2025", "Pertumbuhan laba", "Sektor") dan tautan sumber. Di desktop tabel tetap seperti sekarang. Cukup CSS (`display:grid` per baris + label dari atribut `data-label`), tanpa pustaka.
- Acuan tren: aplikasi investasi 2026 menampilkan daftar saham sebagai kartu ringkas di HP, bukan tabel lebar.
- Dampak bagi pemula: sebagian besar pemula membuka dari HP; semua angka langsung terbaca tanpa harus tahu bahwa tabel bisa digeser.
- Status: **selesai** (28 Okt 16.15, Dewi). Ditinjau Kirana 28 Okt 18.35 (lihat "Tinjauan Kirana" di bawah).

### 2. Tombol pilihan & menu ringkas di HP
- **Kategori:** tampilan — usaha **kecil**
- Masalah atau peluang: empat tombol pilihan Peringkat menumpuk satu per baris di 390px; menu atas pecah dua baris.
- Ide: tombol pilihan jadi satu baris yang bisa digeser (`overflow-x:auto` di dalam wadahnya sendiri, dengan `scroll-snap`) atau kisi 2×2; menu atas memakai jarak dan ukuran huruf yang lebih rapat agar muat satu baris.
- Acuan tren: "chip" filter satu baris yang umum di aplikasi keuangan dan e-commerce.
- Dampak bagi pemula: isi utama (tabel) terlihat di layar pertama.
- Status: **selesai** (28 Okt 18.35, Dewi) — kisi 2×2 + menu satu baris; kartu pertama naik ±190px. Sisa: kotak keterangan data masih panjang (tugas lanjutan Dewi).

### 3. Kamus istilah di tempat (ketuk istilah → penjelasan singkat) ★ paling berdampak
- **Kategori:** fitur — usaha **sedang**
- Masalah atau peluang: ROE, DER, laba diatribusikan, DES, dan JII muncul di Peringkat, Radar, dan pelajaran tanpa penjelasan di tempat.
- Ide: satu berkas `data/istilah.js` (istilah → penjelasan 1–2 kalimat + tautan ke pelajaran terkait). Istilah yang dikenali di halaman diberi garis bawah putus-putus; diketuk/di-fokus dengan keyboard → muncul kotak kecil penjelasan (elemen `<button>` + kotak `role="tooltip"`, tutup dengan Esc). Isi penjelasan ditinjau Sari & Laras, istilah syariah oleh Hana.
- Acuan tren: "progressive disclosure" dan penjelas jargon di aplikasi fintech 2026.
- Dampak bagi pemula: memahami angka tanpa meninggalkan halaman; menurunkan rasa takut terhadap istilah.
- Status: **selesai** (28 Okt 17.30, Arif) — 15 istilah di `data/istilah.js`, tayang di Peringkat, Radar, dan pelajaran. Kirana meninjau.

### 4. Penanda kemajuan belajar
- **Kategori:** fitur — usaha **kecil–sedang**
- Masalah atau peluang: pemula tidak tahu sudah sampai pelajaran mana.
- Ide: tombol "Tandai selesai" di akhir pelajaran; halaman Belajar menampilkan "3 dari 8 pelajaran selesai" dan tanda centang di daftar. Disimpan di `localStorage` perangkat (dibungkus try/catch, tanpa akun, tanpa server, tidak ada data pengguna yang dikirim). Cocok digabung dengan kuis Laras.
- Acuan tren: "gamifikasi ringan" (progres, bukan poin/hadiah) di aplikasi edukasi keuangan.
- Dampak bagi pemula: motivasi menyelesaikan jalur belajar.
- Status: dipilih Bima 29 Okt 18.20, masuk BACKLOG.md.

### 5. Perpindahan halaman yang halus (View Transitions)
- **Kategori:** animasi — usaha **kecil**
- Masalah atau peluang: perpindahan antarhalaman terasa "berkedip".
- Ide: tambah `@view-transition { navigation: auto; }` dan nama transisi untuk header, hanya di dalam `@media (prefers-reduced-motion: no-preference)`. Tanpa JavaScript; browser yang belum mendukung cukup berpindah seperti biasa.
- Acuan tren: View Transitions lintas halaman menjadi standar animasi web 2026.
- Dampak bagi pemula: situs terasa seperti aplikasi, tanpa menambah berat halaman.
- Status: dipilih Bima 29 Okt 18.20, masuk BACKLOG.md.

### 6. Radar Risiko: batang perbandingan 2024 vs 2025 yang tumbuh
- **Kategori:** animasi — usaha **sedang**
- Masalah atau peluang: hasil Radar berupa teks; sebelum memilih saham halaman terlihat kosong.
- Ide: (a) sebelum memilih, tampilkan contoh cara membaca hasil (ikon lampu hijau/kuning/merah + artinya); (b) setelah memilih, laba dan pendapatan 2024 vs 2025 tampil sebagai dua batang horizontal yang "tumbuh" sekali (CSS `transform: scaleX`, 0,6 detik), dengan angka dan sumber tetap tertulis sebagai teks. Tanpa animasi bila `prefers-reduced-motion`.
- Acuan tren: visualisasi data mikro di aplikasi keuangan 2026.
- Dampak bagi pemula: perubahan naik/turun langsung terlihat, tetap berbasis data bersumber.
- Status: dipilih Bima 30 Okt 13.10 untuk Dewi; selesai 30 Okt 15.30 (label batang cukup tahun saja agar muat di 390px). Ditinjau Kirana 30 Okt 16.10: baik.

## Tinjauan Kirana — 28 Okt 2026, 18.35 WIB

Kartu Peringkat di HP (hasil Dewi, usulan #1), dicek di 390px dan 1280px:
- Bagus: kode besar, nama, sektor, "Laba 2025" paling menonjol, angka lain berlabel. Angka turun ditandai warna
  merah **dan** tanda minus, jadi tetap terbaca tanpa warna. Tidak ada scroll horizontal; desktop tetap tabel.
- Perbaikan langsung (Dewi, kecil): semua tautan kartu bertuliskan "Sumber" sehingga pembaca layar mendengar
  "Sumber" berulang-ulang. Kini tiap tautan punya label "Sumber data KODE (tab baru)".
- Masih kurang: empat tombol pilihan menumpuk satu per baris, sehingga kartu pertama baru terlihat setelah
  menggulir. Diselesaikan lewat usulan #2 (dipilih Bima).
- Catatan: tiap kartu ±275px, 10 kartu cukup panjang. Belum perlu diubah; dinilai lagi setelah usulan #2.

Kotak istilah (hasil Arif, usulan #3), dicek di Peringkat dan pelajaran:
- Kotak tetap di dalam layar 390px, bisa ditutup Esc atau ketuk di luar, tautan "Pelajari lebih lanjut" jelas.
- Istilah bergaris di dalam kalimat tingginya ±22px (kecil untuk jari), tetapi wajar untuk teks dalam kalimat dan
  ada baris "Bingung istilahnya?" sebagai jalan lain. Tidak diubah.

## Tinjauan Kirana — 29 Okt 2026, 20.20 WIB

Profil emiten `emiten.html` di HP (dicek TLKM, AADI, dan daftar 31 emiten di 390px dan 1280px):
- Bagus: status syariah dengan baris DES paling atas, kalimat "bukan berarti disarankan untuk dibeli" ikut tampil,
  angka dolar AS diberi keterangan, Radar Risiko memakai warna **dan** judul teks. Tanpa scroll horizontal, tanpa galat JS.
- Perbaikan langsung (Dewi, kecil): empat ubin angka menumpuk satu kolom (±440px) sehingga tabel dan Radar jauh
  di bawah. Di bawah 600px kini kisi 2×2 (angka 1,15rem, tetap muat "US$4,91 miliar"); halaman profil TLKM
  memendek dari 2420px ke 2145px di 390px. Desktop tidak berubah.
- Catatan: label baris tabel "Liabilitas (akhir tahun)" pecah dua baris di 390px. Masih terbaca, tidak diubah.

Penanda kemajuan & perpindahan halaman (hasil Arif & Dewi, usulan #4 dan #5):
- Tombol "Tandai selesai" tinggi 48px, setelah diketuk berubah jadi "✓ Sudah selesai" dengan `aria-pressed="true"`.
  Jelas untuk pembaca layar. Tidak ada perbaikan.
- Perpindahan halaman 0,2 detik terasa halus dan tidak mengganggu; mati bila gerak dikurangi. Tidak ada perbaikan.

Metodologi di HP:
- Halaman panjang (±5.000px di 390px) tanpa daftar isi. Dewi menambah kotak "Isi halaman" (6 tautan ke tiap bagian)
  dan merapatkan judul bagian di HP.

### 7. Profil emiten: ringkasan "posisi di Peringkat"
- **Kategori:** fitur — usaha **kecil**
- Masalah atau peluang: dari profil, pemula tidak tahu emiten ini ada di urutan berapa di Peringkat.
- Ide: satu baris di bawah ubin, misalnya "Urutan 5 dari 24 untuk pertumbuhan laba" (dihitung dengan rumus Peringkat
  yang sama), dengan tautan ke Peringkat. Emiten yang tidak ikut Peringkat diberi alasannya (periksa ulang / dolar AS).
- Acuan tren: konteks "relatif terhadap rekan" di aplikasi data saham.
- Dampak bagi pemula: angka satu emiten jadi punya pembanding. Tetap data, bukan saran.
- Status: dipilih Bima 29 Okt 20.20, dikerjakan Arif 29 Okt 21.30 (tayang). Ditinjau Kirana 30 Okt 09.10: baik.

### 8. Metodologi: penanda bagian yang sedang dibaca
- **Kategori:** tampilan — usaha **kecil**
- Ide: di desktop (≥900px), kotak "Isi halaman" menempel di samping (sticky) dan menebalkan bagian yang sedang dibaca.
  Di HP tetap di atas. Tanpa pustaka.
- Dampak bagi pemula: tidak tersesat di halaman panjang.
- Status: dipilih Bima 29 Okt 20.20, dikerjakan Dewi 30 Okt 07.45 (tayang). Ditinjau Kirana 30 Okt 09.10: baik.

### 9. Beranda: "Lanjutkan belajar"
- **Kategori:** fitur — usaha **kecil**
- Ide: bila penanda kemajuan menyimpan pelajaran selesai, beranda menampilkan tombol "Lanjutkan: pelajaran berikutnya".
  Memakai data yang sama di peramban (try/catch), tanpa akun.
- Dampak bagi pemula: kembali ke jalur belajar dalam satu ketukan.
- Status: dipilih Bima 30 Okt 07.10, dikerjakan Arif 30 Okt 08.30 (tayang). Ditinjau Kirana 30 Okt 09.10: baik.

## Tinjauan Kirana — 30 Okt 2026, 09.10 WIB

Hasil #7, #8, #9 dicek di 390px dan 1280px (tanpa scroll horizontal, tanpa galat JS):
- #7 Posisi di Peringkat (profil MYOR & TLKM): dua baris urutan jelas, ada kalimat "gambaran data, bukan saran
  membeli atau menjual" dan tautan ke Peringkat. Tidak ada perbaikan.
- #8 Daftar isi Metodologi (1280px): setelah menggulir, bagian yang dibaca ditandai (`aria-current`). Di HP tetap di atas.
  Tidak ada perbaikan.
- #9 Lanjutkan belajar (beranda 390px, 2 pelajaran selesai): kotak tampil di 572px dari atas (masuk layar pertama),
  teks "2 dari 8 pelajaran selesai" + tombol "Lanjutkan belajar: Pelajaran 3" (tinggi 69px), bisa dicapai dengan Tab.
  Tidak ada perbaikan.

### 10. Profil emiten: batang pembanding laba 9 bulan
- **Kategori:** tampilan — usaha **kecil**
- Masalah atau peluang: laba Januari–September kini terisi untuk 9 emiten, tetapi hanya tampil sebagai satu kalimat angka.
- Ide: dua batang horizontal sederhana (2025 vs 2026) dari CSS saja, panjang sebanding angka, label angka tetap
  tertulis (tidak bergantung warna). Hanya muncul bila kedua angka ada dan positif; rugi tetap kalimat.
- Acuan tren: grafik mini "year-on-year" di aplikasi data saham, versi tanpa pustaka.
- Dampak bagi pemula: naik/turun langsung terlihat. Tetap data, bukan saran. Ringan di HP murah (tanpa JS tambahan).
- Status: dipilih Bima 30 Okt 09.10 untuk Dewi, dikerjakan Dewi 30 Okt 09.15 (tayang; batang abu-abu 2025, hijau/merah 2026, kolom angka sejajar). Ditinjau Kirana 30 Okt 16.10: baik; angka naik kini diberi tanda "+".

### 11. Peringkat: saring per sektor
- **Kategori:** fitur — usaha **kecil**
- Masalah atau peluang: 31 emiten dari banyak sektor; pemula ingin membandingkan emiten yang sejenis.
- Ide: satu `<select>` "Semua sektor / Barang konsumen primer / ..." di atas tabel/kartu; urutan dihitung ulang di
  dalam sektor itu dengan rumus yang sama. Tanpa simpanan, dapat diakses keyboard.
- Dampak bagi pemula: pembanding yang adil (bank dengan bank, tambang dengan tambang).
- Status: dipilih Bima 30 Okt 09.10 untuk Arif, dikerjakan Arif 30 Okt 10.15 (tayang; 9 sektor, urutan dihitung ulang dengan peserta() yang sama, pesan ramah bila sektor kosong). Ditinjau Kirana 30 Okt 16.10: baik.

### 12. Belajar: perkiraan waktu baca tiap pelajaran
- **Kategori:** konten/tampilan — usaha **kecil**
- Ide: "± 6 menit baca" di kartu pelajaran, dihitung dari jumlah kata di `data/modul.js` (±200 kata/menit).
- Dampak bagi pemula: tahu berapa lama waktu yang dibutuhkan sebelum mulai.
- Status: dipilih Bima 30 Okt 13.10 untuk Arif, dikerjakan Arif 30 Okt 14.20 (tayang). Hasil hitung: 1–2 menit per pelajaran (118–253 kata), jauh di bawah perkiraan lama 7–20 menit yang ditulis tangan; perkiraan lama dihapus agar angka bisa diperiksa. Ditinjau Kirana 30 Okt 16.10: baik.

## Tinjauan Kirana — 30 Okt 2026, 16.10 WIB

Hasil #10, #11, #12, dan #6 dicek di 390px dan 1280px (tanpa scroll horizontal, tanpa galat JS):
- #10 Batang laba 9 bulan (profil MYOR, HEAL, TPIA): batang dan angka tampil. **Temuan:** kenaikan tertulis "31,4%"
  tanpa tanda, sedangkan penurunan "−14,8%"; pemula bisa ragu apakah itu naik. Diperbaiki langsung oleh Dewi:
  semua angka perubahan (laba, pendapatan, 9 bulan; di Peringkat, Radar, dan profil) kini memakai "+" bila naik.
  ROE tetap tanpa tanda karena bukan perubahan. Nina menambah cek.
- #11 Saring sektor (Peringkat): 9 sektor + "Semua sektor", tinggi 48px, bisa dipakai dengan panah keyboard,
  keterangan jumlah emiten dibacakan pembaca layar. Tidak ada perbaikan.
- #12 Waktu baca (Belajar): "Waktu baca ± 1/2 menit" di 8 kartu. Tidak ada perbaikan.
- #6 Radar (AADI dll.): kotak "Cara membaca hasil Radar" muncul sebelum memilih, batang 2024 vs 2025 rapi di 390px,
  label tidak meluap. Tidak ada perbaikan.


## Tinjauan & usulan Kirana — 1 Nov 2026, 07.10 WIB

Tinjauan tanda "+" (tugas 30 Okt 16.10), dicek di 390px dan 1280px, tanpa scroll horizontal:
- Peringkat (390 & 1280): angka naik tertulis "+6,6%", "+22,3%", dst. Sesuai.
- Radar (ISAT, 390): "+38,2%" pada laba 9 bulan. Sesuai.
- Profil ISAT (390): "+12,2%", "+1,1%", "+38,2%". Tidak ada angka naik tanpa tanda. Tidak ada perbaikan.

Usulan minggu ini (3 usulan baru):

### 13. Mode gelap mengikuti pengaturan HP ★ paling berdampak
- **Mode gelap otomatis** — tampilan, usaha sedang
- Masalah atau peluang: website selalu terang. Banyak pemula membaca di HP malam hari dengan mode gelap aktif;
  halaman putih terasa silau dan tidak konsisten dengan aplikasi lain di HP mereka.
- Ide: warna utama dijadikan variabel CSS di `:root`, lalu diganti di `@media (prefers-color-scheme: dark)`.
  Tanpa tombol dan tanpa simpanan; mengikuti pengaturan HP/komputer. Warna lampu Radar (hijau/kuning/merah) dan
  batang tetap kontras minimal 4,5:1. CSS saja, tanpa pustaka.
- Acuan tren: hampir semua aplikasi investasi dan belajar kini mengikuti mode gelap sistem; `prefers-color-scheme`
  didukung semua peramban modern.
- Dampak bagi pemula: nyaman dibaca malam hari, mata tidak cepat lelah, website terasa modern.
- Status: dipilih Bima 1 Nov 07.10 untuk Dewi; selesai 1 Nov 08.10 (mengikuti pengaturan perangkat, tanpa tombol). Ditinjau Kirana 1 Nov 08.10 lewat tangkapan layar: baik; tombol terpilih diberi garis aksen. Tinjauan di HP sungguhan menyusul setelah tayang.

### 14. Profil emiten: bandingkan dengan emiten lain
- **Bandingkan dua emiten** — fitur, usaha sedang
- Masalah atau peluang: pemula sering bertanya "lebih besar mana labanya, A atau B?" dan harus membuka dua profil
  bergantian.
- Ide: di profil, `<select>` "Bandingkan dengan…" (daftar 31 emiten). Tabel dua kolom: laba, pendapatan, ROE, DER,
  laba 9 bulan, dengan sumber masing-masing. Emiten berlaporan dolar AS tidak dikonversi (aturan Galih); bila mata uang
  berbeda, tampil catatan "tidak sebanding langsung". Tanpa kata "lebih baik", hanya angka.
- Acuan tren: fitur "compare" di aplikasi saham dan situs data keuangan.
- Dampak bagi pemula: belajar membaca angka dengan membandingkan, tanpa diarahkan memilih.
- Status: dipilih Bima 1 Nov 16.10 untuk Arif; selesai 1 Nov 16.10 (bagian "Bandingkan dengan emiten lain" di profil, sebelum Radar Risiko: laba & pendapatan 2025, ROE, DER, laba Jan–Sep 2026, baris DES; catatan mata uang beda dan laba bertanda; tanpa simpanan). Dewi: dicek 390px & 1280px terang/gelap, tabel muat tanpa geser. Tinjauan Kirana di HP sungguhan menyusul.

### 15. Beranda: "Istilah hari ini"
- **Istilah hari ini** — fitur, usaha kecil
- Masalah atau peluang: kamus istilah (`data/istilah.js`) hanya terlihat bila pengguna mengetuk istilah di halaman.
- Ide: kotak kecil di beranda menampilkan satu istilah dari kamus yang berganti tiap hari (dipilih dari tanggal,
  tanpa simpanan), dengan tautan ke pelajaran terkait bila ada. Teks diambil dari kamus yang sudah ditinjau Sari,
  Laras, dan Hana.
- Acuan tren: kartu "kata hari ini" di aplikasi belajar bahasa dan literasi keuangan.
- Dampak bagi pemula: menambah satu istilah setiap kunjungan, alasan untuk kembali belajar.
- Status: dipilih Bima 1 Nov 13.10 untuk Arif; selesai 1 Nov 13.10 (kotak di antara hero dan "Jalur belajar", dipilih dari tanggal perangkat, tanpa simpanan; tautan ke pelajaran terkait bila ada). Ditinjau Kirana 1 Nov 13.10 lewat tangkapan layar 390px & 1280px, terang & gelap: baik.

## Tinjauan Kirana — 1 Nov 2026, 13.10 WIB

Halaman Kabar emiten (tugas 1 Nov 09.10), dicek lewat tangkapan layar 390px & 1280px, terang & gelap:
- 390px: judul, catatan "Kabar bukan saran membeli atau menjual", dan saringan jenis muat di layar pertama; kartu kabar
  pertama mulai ±650px dari atas. Tanggal dan label jenis sebaris, kode emiten tebal. Tanpa scroll horizontal.
- 1280px & mode gelap: kontras label jenis dan teks kartu terbaca baik. Urutan terbaru di atas sesuai (CPIN 31 Okt paling atas).
- "Kabar terbaru" di profil (CPIN, 390px): tampil di bawah angka utama, tautan sumber jelas. Tidak ada perbaikan.

Kotak "Istilah hari ini" (#15) di beranda: garis kiri warna bulan membedakannya dari panel lain; di 390px tinggi ±360px,
tidak mendorong "Jalur belajar" terlalu jauh. Baik.

### 16. Beranda: "Kabar terbaru" (3 kabar)
- **Kabar terbaru di beranda** — fitur, usaha kecil
- Masalah atau peluang: halaman Kabar emiten hanya terlihat lewat tautan di kaki halaman; pengunjung beranda tidak tahu
  ada laporan 9 bulan baru.
- Ide: di bawah panel "Alat bantu analisis", daftar 3 kabar terbaru dari `data/kabar.js` (tanggal, kode, ringkasan,
  tautan sumber) + tautan "Semua kabar". Memakai fungsi tampilan kartu yang sama dengan halaman Kabar. Tanpa simpanan.
- Acuan tren: kolom "terbaru" di aplikasi berita pasar dan beranda aplikasi investasi.
- Dampak bagi pemula: tahu ada data baru tanpa mencari, dan terbiasa membaca kabar beserta sumbernya.
- Batasan: tetap memuat catatan "Kabar bukan saran membeli atau menjual".
- Status: dipilih Bima 1 Nov 13.10 untuk Arif + Dewi; selesai 1 Nov 14.10 (3 kabar terbaru di bawah "Alat bantu analisis", kartu sama dengan halaman Kabar, catatan bukan saran, tautan "Semua kabar"; tersembunyi tanpa JavaScript). Ditinjau Kirana 1 Nov 14.10 lewat tangkapan layar 390px & 1280px, terang & gelap: baik.

## Tinjauan & usulan Kirana — 2 Nov 2026, 07.14 WIB

"Bandingkan dengan emiten lain" (tugas 1 Nov 16.10), dicek bersama Dewi lewat tangkapan layar profil TLKM vs TPIA,
390px & 1280px, terang & gelap:
- Daftar pilihan 31 emiten memakai `<select>` bawaan HP, jadi panjang daftar tidak masalah. Tabel dua kolom muat di 390px
  tanpa scroll horizontal; mode gelap terbaca baik. Label "Laba Jan–Sep 2026 (perubahan dari 2025)" turun menjadi 4 baris
  di 390px, masih terbaca.
- Temuan: catatan "Laba salah satu emiten sedang dicek ulang…" tidak menyebut emiten mana → jadi usulan #18, langsung
  dikerjakan Arif sesi ini.

### 17. Peringkat & beranda: "Musim laporan 9 bulan" ★ paling berdampak
- **Penanda kemajuan laporan Januari–September 2026** — fitur, usaha kecil
- Masalah atau peluang: laporan 9 bulan masuk satu per satu (kini 14 dari 31). Pemula tidak tahu emiten mana yang
  angkanya sudah baru dan mana yang belum, sehingga bisa membandingkan angka yang belum lengkap.
- Ide: satu baris di halaman Peringkat (dan Radar): "Laporan Januari–September 2026 sudah masuk untuk 14 dari 31 emiten",
  dengan batang kemajuan CSS dan `<details>` berisi daftar kode yang sudah dan belum. Dihitung otomatis dari `laba9b`,
  tanpa simpanan, angka selalu tertulis (tidak hanya warna).
- Acuan tren: penanda "musim laporan" di aplikasi pasar modal dan pelacak kemajuan di aplikasi belajar.
- Dampak bagi pemula: paham bahwa data diperbarui bertahap dan tahu kapan perbandingan 9 bulan sudah adil.
- Batasan: tanpa kata ajakan; ringan (teks + satu batang CSS); hormati `prefers-reduced-motion` bila batang diberi animasi.
- Status: dipilih Bima 2 Nov 07.14; selesai 2 Nov 08.10 di Peringkat & Radar (Arif + Dewi, Nina 7 cek). Bagian beranda selesai 2 Nov 09.10 (Arif: satu baris di panel Peringkat beranda, menaut ke Peringkat).

### 18. Bandingkan: sebut kode emiten pada catatan "dicek ulang"
- **Catatan bertanda menyebut nama** — perbaikan tampilan, usaha kecil
- Masalah: catatan menulis "salah satu emiten", pemula harus menebak profil mana yang perlu dibaca.
- Ide: tulis kode emitennya ("Laba TPIA sedang dicek ulang… Baca catatannya di profil TPIA").
- Dampak bagi pemula: langsung tahu catatan mana yang penting.
- Status: dipilih Bima 2 Nov 07.14; selesai 2 Nov 07.14 oleh Arif (dicek 390px & 1280px, tanpa galat JS).

### 19. Kabar emiten: label "Baru" untuk kabar 3 hari terakhir
- **Label teks "Baru"** — tampilan, usaha kecil
- Masalah atau peluang: di musim laporan kabar bertambah tiap hari; kabar terbaru sulit dibedakan dari kabar lama.
- Ide: kabar bertanggal ≤3 hari dari tanggal perangkat diberi label teks "Baru" (bukan warna saja) di halaman Kabar,
  beranda, dan profil. Tanpa simpanan, tanpa animasi kedip.
- Acuan tren: label "Baru" di aplikasi berita dan kotak masuk.
- Dampak bagi pemula: cepat melihat apa yang berubah sejak kunjungan terakhir.
- Batasan: label dibacakan pembaca layar; tidak memakai kata ajakan.
- Status: dipilih Bima 2 Nov 13.19 untuk Arif + Dewi; selesai 2 Nov 13.19 (label teks berbingkai warna aksen sebelum tanggal, di Kabar, beranda, dan profil). Ditinjau Kirana lewat tangkapan layar 390px terang & gelap: terbaca jelas dan beda dari label jenis kabar.

## Tinjauan Kirana — 2 Nov 2026, 18.10 WIB

Kotak "Musim laporan 9 bulan" (tugas 2 Nov 08.10), dicek lewat tangkapan layar Peringkat, Radar, dan beranda,
390px & 1280px, terang & gelap (kini 17 dari 31 emiten):
- Kalimat utama dan angka tebal terbaca jelas di kedua mode; batang kemajuan kontras cukup, angka tetap tertulis.
- Tinggi kotak tertutup: 282px di 390px, 166px di 1280px. Saat "Lihat daftar kode" dibuka di 390px: 465px; daftar
  17 "sudah masuk" dan 14 "belum masuk" terbaca, kode dipisah koma, tanpa scroll horizontal (lebar halaman tetap 390px).
- Baris beranda (46px) satu kalimat + tautan "Lihat di Peringkat", terbaca baik.
- Tanpa galat JS di 12 kombinasi halaman/lebar/mode. Tidak ada perbaikan yang perlu dikerjakan sekarang.
- Catatan untuk nanti: setelah musim laporan selesai (semua 31 masuk atau akhir November), kotak ini sebaiknya diringkas
  atau disembunyikan agar tabel Peringkat naik kembali di HP.

## Tinjauan & usulan Kirana — 3 Nov 2026, 07.09 WIB

Halaman Kabar (kini 25 kabar), dicek bersama Dewi lewat tangkapan layar 390px & 1280px, terang & gelap:
- Saringan jenis, label "Baru", dan catatan "Kabar bukan saran membeli atau menjual" terbaca jelas di kedua mode;
  tanpa scroll horizontal dan tanpa galat JS.
- Halaman makin panjang: 8.340px di 390px (±9 layar HP) dan 5.343px di 1280px. Kabar laporan 9 bulan akan terus
  bertambah sampai akhir November (sisa 10 emiten).

### 20. Kabar emiten: tampilkan 10 kabar dulu, lalu "Tampilkan lebih banyak"
- Masalah: di HP pemula harus menggulir ±9 layar untuk melihat kabar lama; makin panjang setiap ada laporan baru.
- Ide: tampilkan 10 kabar terbaru, lalu tombol "Tampilkan 10 kabar lagi (n tersisa)". Saringan jenis tetap bekerja
  pada semua kabar. Tanpa simpanan, tanpa pustaka, tombol bisa dipakai keyboard dan jumlah kabar dibacakan pembaca layar.
- Acuan: pola "load more" di aplikasi berita & investasi (lebih ramah HP daripada nomor halaman).
- Dampak bagi pemula: halaman lebih pendek, kabar terbaru tetap di atas.
- Usaha: kecil (Arif; Dewi untuk tampilan tombol).
- Status: dipilih Bima 3 Nov 07.09 untuk Arif + Dewi, masuk BACKLOG.md. Selesai 3 Nov 08.09 (tayang): 10 kabar dulu, tombol "Tampilkan 10 kabar lagi (n tersisa)"; halaman di 390px kini 4.224px (sebelumnya 8.360px). Ditinjau Kirana 3 Nov 09.10 (browser tim, 390px gelap & 1280px terang, tombol ditekan dengan Enter): tombol berbingkai aksen terbaca jelas di mode gelap, 10 kabar tambahan muncul, fokus pindah ke kabar pertama yang baru, tanpa scroll horizontal. Baik. Tinjauan di HP sungguhan tetap belum bisa dilakukan tim.

## Tinjauan Kirana — 3 Nov 2026, 14.20 WIB
Baris "Dividen tunai tahun buku 2025" di profil, dicek lewat browser tim (UNTR & INDF di 390px gelap dan 1280px terang; TLKM sebagai contoh emiten tanpa angka dividen):
- Angka tebal, tautan sumber, dan catatan "tidak menjamin dividen tahun berikutnya" terbaca jelas di kedua mode; angka ribuan (Rp1.663) tampil dengan titik; tanpa scroll horizontal dan tanpa galat JS.
- Kata "Dividen" sudah bergaris putus-putus (kamus) dan kini menjelaskan arti "tahun buku 2025" serta dividen interim.
- Emiten tanpa angka dividen (kini 23 dari 31) tidak menampilkan baris apa pun. Ini sudah tepat untuk saat ini: menulis "belum ada data" di 23 profil justru bisa terbaca seolah emiten tidak membagikan dividen. Usulan ditunda sampai DPS lebih lengkap; tidak ada perbaikan.

## Usulan Kirana — 4 Nov 2026, 13.09 WIB

Profil INTP dicek bersama Dewi lewat tangkapan layar 390px mode gelap (setelah catatan diringkas Sari): terbaca baik,
tanpa scroll horizontal, tanpa galat JS. Halaman profil kini sekitar 5.150px di 390px (±6–7 layar HP) karena bertambah
bagian Bandingkan, Radar, catatan laba 9 bulan, dividen, Kabar, dan Sumber.

### 21. Profil emiten: baris "Lompat ke" di bawah judul
- **Navigasi singkat di halaman panjang** — tampilan, usaha kecil
- Masalah: di HP pemula harus menggulir ±6 layar untuk sampai ke Radar Risiko atau Sumber data di profil.
- Ide: satu baris tautan biasa di bawah nama emiten: "Lompat ke: Angka utama · Radar Risiko · Kabar · Sumber data",
  menuju judul bagian yang sudah ada (tautan jangkar). Bukan menu melayang, tanpa pustaka, tanpa simpanan.
- Acuan tren: "jump links" di halaman produk dan artikel panjang di aplikasi investasi & berita.
- Dampak bagi pemula: langsung sampai ke bagian yang dicari; Sumber data lebih mudah ditemukan.
- Batasan: tautan bisa dipakai keyboard; gulir halus hanya bila `prefers-reduced-motion` tidak aktif; tanpa kata ajakan.
- Usaha: kecil (Arif; Dewi untuk tampilan). Nina menambah cek bahwa setiap jangkar punya tujuan.
- Status: dipilih Bima 4 Nov 14.11 untuk Arif + Dewi; selesai 4 Nov 14.11: "Lompat ke: Angka utama · Bandingkan · Radar Risiko · Kabar · Sumber data" di atas kotak status syariah; tautan Kabar hanya muncul bila emiten punya kabar; gulir halus hanya bila `prefers-reduced-motion` tidak aktif. Nina: cek 2h (+uji negatif). Ditinjau Kirana lewat tangkapan layar (INTP 390px gelap, 1280px terang): tautan membungkus rapi di HP, terbaca jelas, Enter pada "Sumber data" menuju bagiannya; tanpa scroll horizontal, tanpa galat JS. Tinjauan di HP sungguhan menyusul.

## Usulan Kirana — 5 Nov 2026, 07.09 WIB

Kamus kini 22 istilah (terbaru: "Laporan ditelaah terbatas"), tetapi pemula hanya bisa melihatnya satu per hari di
beranda atau saat kata itu kebetulan muncul di halaman. Tidak ada tempat untuk membaca semuanya sekaligus.

### 22. Belajar: bagian "Kamus istilah" berisi semua istilah ★ paling berdampak
- **Glosarium satu tempat** — fitur, usaha kecil
- Masalah: istilah seperti "laba periode berjalan" atau "ditelaah terbatas" sering muncul di berita musim laporan,
  tetapi pemula tidak tahu di mana mencarinya di Candra Analis.
- Ide: bagian "Kamus istilah" di akhir halaman Belajar, dibuat dari `data/istilah.js` yang sama (tanpa salinan teks):
  daftar `<dl>` urut abjad, tiap istilah dengan arti dan tautan "Pelajari di: Pelajaran n" bila ada. Kotak cari
  sederhana (`<input type="search">` berlabel) menyaring daftar saat mengetik, jumlah hasil dibacakan pembaca layar.
- Acuan tren: halaman glosarium di aplikasi edukasi investasi dan pusat bantuan bank digital.
- Dampak bagi pemula: semua istilah bisa dibaca dan dicari kapan saja; kamus yang sudah ditinjau Sari, Laras, dan Hana
  jadi lebih bermanfaat.
- Batasan: tanpa pustaka, tanpa simpanan, tanpa animasi; tetap terbaca tanpa JavaScript (pesan singkat + tautan ke
  pelajaran); dapat dipakai keyboard; tanpa kata ajakan.
- Usaha: kecil (Arif; Dewi untuk tampilan). Nina menambah cek bahwa jumlah istilah di bagian ini sama dengan kamus.
- Status: dipilih Bima 5 Nov 07.09 untuk Arif + Dewi; selesai 5 Nov 07.09 (bagian "Kamus istilah" di Belajar, 22 istilah urut abjad, kotak cari berlabel, jumlah hasil dibacakan pembaca layar, pesan bila tidak ada yang cocok). Nina: cek baru + uji negatif. Ditinjau Kirana lewat tangkapan layar 390px gelap & terang, 1280px: terbaca baik, tanpa scroll horizontal, tanpa galat JS. Tinjauan di HP sungguhan menyusul.

## Usulan Kirana — 5 Nov 2026, 13.08 WIB

Kamus kini 27 istilah (terbaru: "Kuartal (triwulan)"). Kotak istilah di tempat hanya menaut ke pelajaran, belum ke
bagian "Kamus istilah" di Belajar, sehingga pemula yang ingin membaca istilah lain yang mirip harus mencari sendiri.

### 23. Kotak istilah: tautan "Lihat semua istilah" ke Kamus di Belajar
- **Penghubung kamus** — fitur, usaha kecil
- Masalah: setelah membaca satu istilah (mis. "Laba 9 bulan"), pemula sering butuh istilah terkait ("Kuartal",
  "Laba periode berjalan"), tetapi kotak istilah tidak menunjukkan bahwa ada kamus lengkap.
- Ide: di bawah tautan "Pelajari lebih lanjut", tambah tautan kecil "Lihat semua istilah" menuju
  `belajar.html#kamus` (id bagian Kamus yang sudah ada, atau ditambah bila belum). Tidak tampil saat pemula sudah
  berada di halaman Belajar.
- Acuan tren: tooltip glosarium di aplikasi edukasi keuangan yang menaut ke pusat glosarium.
- Dampak bagi pemula: dari satu istilah langsung bisa menjelajah semua istilah yang sudah ditinjau tim.
- Batasan: tanpa pustaka, tanpa simpanan, tanpa animasi; tautan biasa sehingga bisa dipakai keyboard; urutan Tab tetap
  wajar (tombol → tautan pelajaran → tautan kamus); tanpa kata ajakan.
- Usaha: kecil (Arif). Nina menambah cek tautan jangkar (`#kamus` harus ada di belajar.html).
- Status: dipilih Bima 5 Nov 13.08 untuk Arif; selesai 5 Nov 13.08 (tautan "Lihat semua istilah" di bawah tautan pelajaran, tidak tampil di Belajar). Nina: cek 2i. Ditinjau Kirana lewat tangkapan layar Peringkat 390px gelap: terbaca jelas, tanpa scroll horizontal. Tinjauan di HP sungguhan menyusul.
- Tinjauan Kirana 7 Nov 13.08: dua istilah baru ("Harga saham", "Laporan keuangan tahunan") tertandai di pelajaran pada 390px dan 1280px tanpa scroll horizontal. "Harga saham" kini tertandai di banyak pelajaran; karena tiap istilah hanya ditandai sekali per halaman, halaman tidak terlihat ramai. Tidak ada temuan baru.

### 24. Metodologi: tandai istilah kamus seperti halaman lain
- **Kamus di semua halaman** — fitur, usaha kecil
- Masalah: halaman Metodologi memuat banyak istilah teknis (DES, ROE, DER, liabilitas, ekuitas, neraca, dana syirkah
  temporer, divestasi), tetapi halaman ini belum memuat `data/istilah.js`, jadi istilahnya tidak bisa diketuk seperti di
  Peringkat, Radar, dan pelajaran. Pemula yang ingin memeriksa cara hitung justru paling butuh penjelasan istilah.
- Ide: muat kamus di Metodologi dan tandai istilah di isi utama (tiap istilah sekali, seperti halaman lain).
- Acuan tren: glosarium yang konsisten di seluruh situs pada aplikasi edukasi keuangan.
- Dampak bagi pemula: halaman "cara kami mengolah data" jadi bisa dipahami tanpa membuka tab lain.
- Batasan: tanpa pustaka baru, tanpa simpanan, tanpa animasi baru; tombol istilah sudah bisa dipakai keyboard dan
  menghormati `prefers-reduced-motion`; tanpa kata ajakan.
- Usaha: kecil (Arif + Dewi). Nina menambah cek.
- Status: diusulkan Kirana 7 Nov 14.09; dipilih Bima 7 Nov 14.09 untuk Arif + Dewi, masuk BACKLOG.md. **Selesai 7 Nov 15.11**: 20 istilah ditandai di artikel Metodologi (judul, tautan, daftar isi dilewati). Kirana meninjau: kotak istilah tampil baik di 390px.

## Usulan Kirana — 9 Nov 2026, 07.09 WIB (minggu baru)

Minggu ini Kirana menyisir hal-hal kecil yang dialami pemula di luar halaman utama: alamat yang salah, membaca
pelajaran di kertas, dan pergantian Daftar Efek Syariah yang akan datang.

### 25. Halaman "tidak ditemukan" (404) yang ramah ★ paling berdampak
- **Jalan keluar dari tautan salah** — tampilan, usaha kecil
- Masalah: tautan yang salah ketik atau tautan lama (dibagikan di grup chat) berakhir di halaman 404 bawaan Vercel
  berbahasa Inggris, tanpa menu dan tanpa jalan kembali. Pemula mengira situsnya rusak.
- Ide: `404.html` berbahasa Indonesia dengan kepala & kaki halaman yang sama, satu kalimat penjelasan, dan 4 tautan
  pilihan (Beranda, Belajar, Profil semua emiten, Peringkat & Radar). Semua rujukan memakai alamat absolut (`/...`)
  agar tetap rapi di alamat bertingkat. Tanpa JavaScript, `noindex`.
- Acuan tren: halaman 404 yang membantu (bukan sekadar lucu) di aplikasi bank digital dan situs edukasi.
- Dampak bagi pemula: tidak tersesat; selalu ada jalan ke pelajaran atau data.
- Batasan: tanpa pustaka, tanpa animasi, tanpa simpanan; ringan; tanpa kata ajakan.
- Usaha: kecil (Dewi tampilan, Arif berkas). Nina menambah cek.
- Status: dipilih Bima 9 Nov 07.09 untuk Dewi + Arif; **selesai 9 Nov 07.09** (`404.html`, kartu tautan dengan token
  warna yang sama, dicek 390px & 1280px terang/gelap tanpa scroll horizontal). Nina: cek alamat absolut, tautan wajib,
  noindex, tanpa skrip + uji negatif. Tinjauan di situs langsung menyusul (tim belum bisa membuka situs).

### 26. Pelajaran rapi saat dicetak
- **Cetak satu pelajaran** — tampilan, usaha kecil
- Masalah: sebagian pemula belajar dari kertas atau menyimpan sebagai PDF lewat "Cetak" di peramban. Kini menu, tombol
  kuis, dan kaki halaman ikut tercetak dan latar gelap menghabiskan tinta.
- Ide: `@media print` di `assets/styles.css`: sembunyikan menu, tombol "Tandai selesai", kuis interaktif, dan tautan
  "Sebelumnya/Berikutnya"; teks hitam di latar putih; alamat sumber ditulis setelah tautan. Penafian tetap tercetak.
- Acuan tren: tampilan cetak di situs dokumentasi dan pusat edukasi keuangan.
- Dampak bagi pemula: satu pelajaran bisa dicetak 1–3 lembar rapi tanpa mengunduh modul PDF lengkap.
- Batasan: CSS saja, tanpa simpanan, tanpa kata ajakan.
- Usaha: kecil (Dewi). Nina menambah cek bahwa `@media print` ada dan penafian tidak disembunyikan.
- Status: diusulkan Kirana 9 Nov 07.09; dipilih Bima; **tayang 9 Nov 08.12** (Dewi, cek Nina). Kirana: tinjau hasil cetak di peramban HP bila sempat.

### 27. Beranda & Radar: catatan "DES baru berlaku 1 Desember"
- **Pengingat pergantian daftar** — fitur, usaha kecil
- Masalah: Daftar Efek Syariah periode II 2026 berlaku 1 Desember. Pemula tidak tahu bahwa status syariah bisa
  berubah dan kapan perlu memeriksa ulang.
- Ide: satu baris netral di beranda dan Radar: "Daftar Efek Syariah periode berikutnya berlaku 1 Desember 2026. Tim akan
  mencocokkan ulang status semua emiten setelah daftar terbit." Tanggal diambil dari satu tempat di `assets/app.js`;
  baris hilang sendiri setelah daftar baru dimuat ke data. Tautan ke pelajaran "Saham syariah dan Daftar Efek Syariah".
- Acuan tren: pengingat jadwal di aplikasi investasi (tanpa notifikasi, tanpa akun).
- Dampak bagi pemula: paham bahwa status syariah ditinjau berkala dan kapan perlu memeriksa saham yang dipegang.
- Batasan: tanpa simpanan, tanpa animasi, tanpa kata ajakan; tanggal harus bersumber dari keterangan resmi OJK
  (Hana memastikan sebelum tayang).
- Usaha: kecil (Arif). Nina menambah cek.
- Status: diusulkan Kirana 9 Nov 07.09; masuk BACKLOG.md, menunggu Hana memastikan tanggal berlaku dari sumber resmi.

### 28. Radar & Bandingkan: ketik kode untuk memilih emiten ★ paling berdampak
- **Pilihan emiten yang cepat di HP** — fitur, usaha kecil–sedang
- Masalah: pilihan emiten di Radar Risiko dan Bandingkan adalah daftar panjang (32 emiten). Di HP pemula harus
  menggulir daftar untuk mencari satu kode, padahal biasanya mereka sudah tahu kodenya (mis. dari berita).
- Ide: tambahkan kotak isian berlabel "Ketik kode atau nama emiten" dengan `<datalist>` bawaan peramban di atas pilihan
  yang ada. Saat isian cocok dengan satu kode, pilihan ikut berganti dan hasil tampil seperti biasa. Pilihan lama tetap ada
  (cadangan untuk peramban yang belum mendukung datalist). Bila tidak ada yang cocok: pesan singkat di elemen role=status.
- Acuan tren: kolom cari kode saham di aplikasi investasi dan pencarian ketik-langsung (search-as-you-type) di aplikasi belajar.
- Dampak bagi pemula: memilih emiten dalam 2–3 ketukan, tanpa menggulir daftar panjang.
- Batasan: elemen bawaan HTML, tanpa pustaka, tanpa simpanan; dapat dipakai keyboard; label jelas; tanpa kata ajakan.
- Usaha: kecil–sedang (Arif, Dewi merapikan tampilan 390px). Nina & Tegar menambah skenario di audit-aksesibel.
- Status: diusulkan Kirana 14 Nov 07.10; dipilih Bima 14 Nov 07.10 untuk Arif + Dewi, masuk BACKLOG.md; **selesai 14 Nov 08.10** (Arif + Dewi). Tinjauan Kirana: di 390px kotak isian selebar layar (358px, tinggi 48px), pesan status tepat di bawah isian, pilihan lama tetap di bawahnya dengan label "Atau pilih …"; mode gelap terbaca (teks pesan abu terang di latar gelap). Belum dicek di HP sungguhan (datalist tampil berbeda di tiap peramban).

### 29. Profil emiten: tombol "Salin tautan profil"
- **Berbagi tanpa ribet** — fitur, usaha kecil
- Masalah: pemula sering ingin mengirim profil satu emiten ke teman/grup belajar, tetapi di HP bilah alamat tersembunyi.
- Ide: tombol kecil di bawah judul profil: "Salin tautan profil". Memakai `navigator.clipboard` bila ada; bila tidak, alamat
  ditampilkan di kotak teks yang sudah terpilih. Pesan "Tautan disalin" di elemen role=status, hilang sendiri.
- Acuan tren: tombol salin/bagikan di halaman produk dan aplikasi edukasi.
- Dampak bagi pemula: mudah berbagi bahan belajar; yang dibagikan profil berisi sumber, bukan ajakan.
- Batasan: tanpa layanan pihak ketiga, tanpa simpanan; teks tombol tidak memuat ajakan beli/jual.
- Usaha: kecil (Arif). Nina menambah cek.
- Status: diusulkan Kirana 14 Nov 07.10. Dipilih Bima 08.10; **selesai 14 Nov 09.09** (Arif & Dewi). Tinjauan Kirana lewat tangkapan layar 390px & 1280px (terang/gelap, juga keadaan cadangan): tombol garis tepi tidak bersaing dengan judul, kotak alamat muat di 390px. Cek di HP sungguhan menunggu situs bisa dijangkau.

### 30. Peringkat (desktop): kepala tabel tetap terlihat saat digulir
- **Tabel panjang tetap terbaca** — tampilan, usaha kecil
- Masalah: di layar lebar tabel Peringkat memuat banyak baris; setelah digulir, pemula lupa kolom mana yang sedang dibaca.
- Ide: `position: sticky` pada kepala tabel di lebar ≥600px (di HP tabel sudah menjadi kartu berlabel, jadi tidak berubah).
  Latar kepala memakai token warna agar tetap kontras di mode gelap.
- Acuan tren: tabel data di dasbor dan situs pasar modal.
- Dampak bagi pemula: label kolom (Laba, ROE, DER, sumber) selalu terlihat.
- Batasan: CSS saja, tanpa animasi; cek 1280px dan 390px tanpa scroll horizontal; kontras ≥4,5:1.
- Usaha: kecil (Dewi).
- Status: diusulkan Kirana 14 Nov 07.10; dipilih Bima 14 Nov 13.09 untuk Dewi + Nina, masuk BACKLOG.md (catatan: wadah tabel kini `overflow-x: auto`, sticky perlu penyesuaian).

### Tinjauan Kirana, 9 Nov 10.09: hero & kartu beranda setelah teks diubah
- 390px: kalimat hero 5 baris, rata-rata ±37 huruf per baris (nyaman dibaca di HP); istilah bergaris tetap terbaca, tombol "Mulai belajar" & "Lihat peringkat saham" masih di layar pertama 390×844.
- 1280px: 4 baris, ±47 huruf per baris. Tanpa scroll horizontal di kedua lebar (juga Radar, Peringkat, profil ANTM).
- Tidak ada perbaikan baru.

### Tinjauan Kirana & Dewi, 10 Nov 14.16: halaman Kabar dalam mode gelap
- Tangkapan layar 390px & 1280px (mode gelap). Label "Baru" diuji dengan tanggal perangkat 5 Nov (kabar terbaru 4 Nov).
- Kontras terukur: label "Baru" 8,3:1; label jenis kabar 13,9:1; tautan sumber 8,6:1; tombol "Tampilkan 10 kabar lagi" 15,4:1, cincin fokus kuning jelas terlihat; kotak hijau penafian terbaca.
- Kotak saring "Semua jenis" ikut gelap. Tanpa scroll horizontal, tanpa galat JS di kedua lebar.
- Tidak ada perbaikan baru.

### Tinjauan Kirana & Dewi, 10 Nov 15.11: halaman Metodologi dalam mode gelap
- Tangkapan layar 390px & 1280px (mode gelap). Kontras teks di seluruh `main` diukur otomatis: terendah 8,32:1 (di atas batas 4,5:1).
- Daftar isi, tautan bergaris bawah, istilah bertitik (DES, OJK) terbaca jelas. Tanpa scroll horizontal di kedua lebar. Tidak ada perbaikan.

### Tinjauan Kirana & Dewi, 10 Nov 17.10: halaman Asisten AI dalam mode gelap
- Tangkapan layar 390px & 1280px. Dua keadaan diuji: "belum aktif" (seperti situs sekarang) dan aktif dengan pesan galat (jawaban /api/tanya ditiru, tanpa memanggil Gemini).
- Kontras teks di `main`: terendah 9,55:1 saat belum aktif; pesan galat merah 6,72:1 (gelap) dan 5,93:1 (terang). Tanpa scroll horizontal.
- Fokus keyboard: tombol contoh pertanyaan dan tombol kirim bergaris fokus kuning 3px; kolom tanya ditandai bingkai biru muda.
- Temuan diperbaiki: teks contoh "Tulis pertanyaan Anda" memakai abu bawaan browser, kontras hanya 3,64:1 di mode gelap. Kini memakai warna `--tinta-2`: 8,64:1 (gelap), 7,81:1 (terang). Nina: cek baru di tests/cek.mjs.

### Tinjauan Kirana & Dewi, 11 Nov 19.12: halaman Belajar & satu pelajaran dalam mode gelap
- Audit otomatis di 390px & 1280px, mode gelap dan terang: semua teks yang terlihat di seluruh halaman (bukan hanya `main`) plus teks contoh kolom isian, dengan kotak istilah terbuka; fokus keyboard dicek 6× Tab.
- Temuan 1 (berlaku di semua halaman): tautan "Langsung ke isi" (muncul saat Tab pertama) berlatar kuning bertinta `--tinta`, yang di mode gelap berubah terang → kontras 1,39:1. Kini bertinta `--malam` (tetap gelap di kedua mode).
- Temuan 2: teks contoh "Contoh: dividen" di kolom cari istilah Belajar 3,64:1 (abu bawaan browser). Aturan placeholder `--tinta-2` kini berlaku untuk semua input & textarea.
- Sesudah perbaikan: 0 temuan di kedua mode dan kedua lebar; cincin fokus kuning 3px pada tautan, tombol kuis, dan Tandai selesai; tanpa scroll horizontal; tanpa galat JS.
- Catatan: tinjauan Metodologi (10 Nov) hanya mengukur `main`, sehingga tautan "Langsung ke isi" terlewat. Audit berikutnya mengukur seluruh halaman.

### Audit kontras halaman lain (Dewi & Kirana, 12 Nov 10.08)
- Peringkat, Radar (hasil UNTR, INTP, TPIA, HEAL), profil ANTM & TPIA (dengan Bandingkan), Kabar, Metodologi, Asisten (pita "belum aktif", contoh jawaban, pesan galat); semua `<details>` dan kotak istilah terbuka; mode gelap & terang; 390px & 1280px.
- Hasil: 0 teks di bawah 4,5:1 (3:1 untuk teks besar), teks contoh kolom aman, tanpa scroll horizontal, tanpa galat JS. Uji balik tertangkap.
- Skrip bisa dipakai ulang: `tools/audit-kontras.js`. Berikutnya: beranda, Belajar, pelajaran, 404, dan garis fokus keyboard.
