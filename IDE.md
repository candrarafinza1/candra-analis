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
- Selesai 14 Nov 14.09 (Dewi + Nina): menempel di ≥900px (wadah tidak menggulir ke samping lagi, nama emiten & sektor boleh turun baris). 601–899px tetap tabel geser tanpa sticky; HP tetap kartu.
- Tinjauan Kirana 14 Nov 14.09 (tangkapan layar 1280px terang & gelap, tab "Laba 2025 vs 2024" digulir 250px): kepala tabel terbaca di atas baris, tidak tembus, garis bawah terlihat. 900/1000/1280px: tabel muat di wadah untuk 4 dasar peringkat, tanpa scroll horizontal, tanpa galat JS. 390px tetap kartu.

### 31. Kuis: "Ulangi soal yang salah saja" ★ paling berdampak
- **Belajar dari kesalahan** — fitur, usaha kecil
- Masalah: setelah "Periksa jawaban", tombol "Ulangi kuis" mengosongkan semua soal. Pemula yang salah 1 dari 3 soal harus
  menjawab ulang soal yang sudah benar, lalu cepat bosan.
- Ide: bila ada jawaban salah, tampilkan tombol kedua "Ulangi soal yang salah". Soal yang sudah benar dilipat dengan tanda
  "Sudah benar", hanya soal yang salah dibuka kembali tanpa pilihan terpilih. Fokus keyboard pindah ke soal salah pertama.
  Hasil diumumkan di elemen role=status yang sudah ada.
- Acuan tren: tinjauan kesalahan di aplikasi belajar bahasa dan kuis latihan (latihan ulang hanya pada bagian yang belum dikuasai).
- Dampak bagi pemula: fokus pada konsep yang belum paham (mis. beda laba bersih dan laba diatribusikan), kuis terasa ringan.
- Batasan: tanpa simpanan, tanpa animasi; tombol asli "Ulangi kuis" tetap ada; dapat dipakai keyboard; tanpa kata ajakan.
- Usaha: kecil (Arif, Dewi merapikan tombol di 390px). Nina menambah keadaan baru di DOM tiruan dan audit-aksesibel.
- Status: diusulkan Kirana 16 Nov 07.10; dipilih Bima 16 Nov 07.10 untuk Arif + Dewi, masuk BACKLOG.md; selesai 16 Nov 08.09 (Kirana meninjau tangkapan 390/1280px: tombol berjajar rapi, lipatan "✓ Sudah benar." jelas).

### 32. Peringkat & Kabar di HP: tautan "Kembali ke atas"
- **Daftar panjang tidak melelahkan** — tampilan, usaha kecil
- Masalah: di 390px Peringkat tampil sebagai 32 kartu dan Kabar memuat banyak kabar; untuk mengganti tab atau menu,
  pemula harus menggulir jauh ke atas.
- Ide: tautan biasa `<a href="#isi">Kembali ke atas</a>` di akhir daftar (bukan tombol melayang). Gulir halus hanya bila
  `prefers-reduced-motion` tidak meminta gerak dikurangi.
- Acuan tren: tautan "ke atas" di akhir daftar panjang pada situs berita dan dokumentasi.
- Dampak bagi pemula: kembali ke tab dan menu dalam satu ketukan.
- Batasan: HTML/CSS saja, tanpa JavaScript baru; tidak menutupi isi; target sentuh ≥48px; fokus keyboard ikut pindah ke #isi.
- Usaha: kecil (Dewi). Nina menambah cek tautan menuju id yang ada.
- Status: diusulkan Kirana 16 Nov 07.10; dipilih Bima 16 Nov 08.09 untuk Dewi + Nina, masuk BACKLOG.md; selesai 16 Nov 09.09 (Kirana meninjau tangkapan 390px: tautan di tengah, panah ↑ tidak dibacakan, tidak menutupi isi).

### 33. Profil emiten: baris "Data terakhir diperbarui"
- **Pemula tahu seberapa baru angkanya** — fitur, usaha kecil
- Masalah: profil memuat angka tahunan dan 9 bulan dari sumber bertanggal berbeda; pemula tidak tahu apakah angka
  9 bulan 2026 sudah masuk atau belum.
- Ide: satu baris kecil di bawah judul profil: "Angka terbaru: laporan Januari–September 2026 (sumber bertanggal …)" atau
  "Laporan Januari–September 2026 belum masuk data". Tanggal diambil dari sumber yang sudah tercatat di data, bukan tanggal buatan.
- Acuan tren: penanda kesegaran data (data freshness) di dasbor dan aplikasi pasar.
- Dampak bagi pemula: tidak salah membaca angka lama sebagai angka baru.
- Batasan: tanpa tanggal karangan (bila sumber tidak bertanggal, baris tidak tampil); tanpa kata ajakan; Hana meninjau kalimat.
- Usaha: kecil (Arif). Nina menambah cek bahwa tanggal yang tampil ada di data sumber.
- Status: diusulkan Kirana 16 Nov 07.10; dipilih Bima 16 Nov 09.09 untuk Arif (+ Hana, Nina), masuk BACKLOG.md. **Selesai 16 Nov 10.08** (Arif, Hana, Nina); Kirana meninjau tangkapan layar 390px & 1280px: rapi, baris kecil tidak mendorong tombol salin keluar layar.

### Tinjauan Kirana, 20 Nov 10.xx: halaman Agenda setelah tayang
- Dicek lewat tangkapan layar lokal (situs tayang belum bisa dibuka alat tim): 390px & 1280px, 5 kartu dividen, tanpa scroll horizontal dan tanpa galat JS. Hitung mundur jelas ("Cum date 4 hari lagi").
- Temuan: di 390px halaman setinggi ±6.100px untuk 5 kartu, karena tiap kartu mengulang penjelasan yang sama untuk 4 tanggal (cum, ex, recording, pembayaran). Pemula perlu menggulir jauh untuk melihat kartu ke-3 dst. Dua usulan di bawah.

### 34. Agenda: penjelasan tanggal tidak diulang di setiap kartu ★ paling berdampak
- **Kartu lebih pendek, mudah dipindai di HP** — tampilan, usaha kecil
- Masalah: penjelasan cum/ex/recording/pembayaran (dan tahap IPO) yang sama tertulis di setiap kartu; 5 kartu = ±6.100px di 390px.
- Ide: kartu hanya menampilkan nama tanggal + tanggal + hitung mundur. Penjelasan dipindah ke satu kotak "Arti tanggal-tanggal ini" di atas daftar (elemen `<details>` bawaan, terbuka di kunjungan pertama), dan nama tanggal di kartu tetap bisa diketuk sebagai istilah (kamus istilah sudah memuat 12 istilah Agenda).
- Acuan tren: kartu ringkas + legenda bersama di kalender acara aplikasi investasi; pola "progressive disclosure".
- Dampak bagi pemula: melihat lebih banyak acara sekaligus tanpa kehilangan penjelasan.
- Batasan: tanpa pustaka baru, `<details>` bisa dibuka keyboard, tidak ada animasi wajib (hormati prefers-reduced-motion), teks penjelasan tidak berubah (sudah ditinjau Hana).
- Usaha: kecil (Dewi; Nina menyesuaikan cek 2f-4 dan menambah cek tinggi halaman).
- Status: diusulkan Kirana 20 Nov 10.xx; dipilih Bima 20 Nov 10.xx untuk Dewi, masuk BACKLOG.md. **Selesai 20 Nov 13.xx** (Dewi + Arif, cek Nina 2f-5): kotak terbuka di kunjungan pertama, tertutup sesudahnya; tinggi 390px ±6.100px → 5.094px saat tertutup.

### 35. Agenda: pilihan "Semua / IPO / Dividen" dan ringkasan "minggu ini"
- **Cepat menemukan acara yang dicari** — fitur, usaha kecil–sedang
- Masalah: saat acara bertambah (rutin harian Raka), daftar dividen bisa panjang dan IPO tenggelam di bawahnya.
- Ide: (a) tombol pilihan Semua / IPO / Dividen di atas daftar (tanpa muat ulang, alamat ikut berubah `?jenis=ipo` agar bisa dibagikan); (b) satu kalimat ringkasan di atas: "Minggu ini: 2 cum date, 1 pembayaran dividen, 0 IPO", dihitung dari data yang sama.
- Acuan tren: filter chip dan ringkasan pekan di aplikasi kalender pasar.
- Dampak bagi pemula: tahu sekilas apa yang terjadi minggu ini.
- Batasan: ringkasan hanya menghitung, tanpa kata ajakan. **Catatan:** pemberitahuan lewat email berlangganan TIDAK diusulkan sekarang karena butuh server pengirim email dan menyimpan alamat email pengguna (data pribadi); itu perlu keputusan Rafinza. Tombol "Tambahkan ke kalender" sudah menjadi pengingat tanpa data pribadi.
- Usaha: kecil–sedang (Arif + Dewi). Menunggu antrean setelah #34.
- Status: diusulkan Kirana 20 Nov 10.xx; dipilih Bima 20 Nov 13.xx untuk Dewi + Arif, masuk BACKLOG.md. **Selesai 20 Nov 14.xx** (Dewi + Arif, cek Nina 2f-6): kalimat "Minggu ini (20 Nov 2026 – 26 Nov 2026): 3 cum date, 2 ex date, 1 recording date, 0 tahap IPO." dan tombol Semua/IPO/Dividen (aria-pressed, ?jenis=ipo|dividen, tanpa simpanan); di 390px tiga tombol satu baris.

### Tinjauan Kirana, 20 Nov 14.xx: kartu Agenda ringkas + tombol pilihan (390px terang/gelap)
- Kotak "Arti tanggal-tanggal ini" tertutup di kunjungan kedua; tombol pilihan jelas mana yang aktif (terang: isi biru malam; gelap: garis aksen). Tanpa scroll horizontal.
- Halaman 390px setinggi 5.248px (kotak arti tertutup), kartu pertama mulai di 1.080px. Tiap kartu dividen masih ±700px: daftar sumber (3 tautan, ±200px) dan kalimat penjelasan berkas .ics (±100px) memakan hampir separuh kartu, dan kalimat .ics sama persis di setiap kartu. Usulan #36 di bawah.

### 36. Agenda: sumber per kartu di dalam <details> dan penjelasan .ics ditulis sekali ★ paling berdampak
- **Kartu dividen ±700px → perkiraan ±420px di 390px** — tampilan, usaha kecil
- Masalah: daftar sumber dan kalimat "Berkas .ics untuk aplikasi kalender…" memenuhi kartu; kalimat .ics diulang di tiap kartu.
- Ide: (a) daftar sumber dibungkus `<details>` "Sumber (3)" per kartu, sumber tetap satu ketukan (keyboard bisa membuka); (b) kalimat .ics pindah ke kotak "Arti tanggal-tanggal ini" (atau satu catatan di atas daftar), tombol kalender tetap di kartu.
- Acuan tren: progressive disclosure yang sama dengan #34.
- Dampak bagi pemula: 2–3 kartu terlihat sekaligus di HP; sumber tetap mudah dibuka.
- Batasan: sumber tidak boleh hilang dari halaman (aturan perusahaan: setiap angka bersumber); tanpa pustaka baru; hormati prefers-reduced-motion. Hana memastikan sumber tetap jelas untuk tiap angka.
- Usaha: kecil (Dewi; Nina menyesuaikan cek).
- Status: diusulkan Kirana 20 Nov 14.xx; dipilih Bima 20 Nov 14.xx untuk Dewi + Nina, masuk BACKLOG.md. **Selesai 20 Nov 15.xx** (Dewi + Nina, cek 2f-7 + 4 uji balik): sumber dilipat dalam "Sumber (n)", kalimat .ics jadi satu catatan di atas daftar (hanya bila ada tombol kalender). Kartu dividen 390px: 696px → 481px; 1280px: 451px → 372px.

### Tinjauan Kirana, 20 Nov 15.xx: hasil #36 dan tombol pilihan di 1280px (terang/gelap)
- Kartu kini 481px di 390px (perkiraan ±420px, sedikit lebih tinggi karena ringkasan "Sumber (n)" dibuat setinggi 44px agar mudah diketuk). Tanda +/− sama dengan kotak arti, jadi pola lipatan konsisten.
- 1280px: tombol Semua/IPO/Dividen rapi di satu baris kiri, kontras terang & gelap baik. Tanpa scroll horizontal.
- Usulan minggu 23–29 Nov di bawah (#37–#39).

### 37. Agenda: tautan langsung ke satu kartu + tombol "Salin tautan" ★ paling berdampak
- **Mudah berbagi satu jadwal** — fitur, usaha kecil
- Masalah: pengguna yang ingin mengirim jadwal TOTO ke teman hanya bisa membagikan seluruh halaman Agenda.
- Ide: tiap kartu diberi id (`#dividen-toto-2026-interim`, `#ipo-anda`), alamat dengan id itu menggulir & menyorot kartu sebentar; tombol kecil "Salin tautan" memakai pola yang sudah ada di profil emiten (Clipboard API, cadangan teks bila gagal).
- Acuan tren: tautan berbagi per item di aplikasi kalender & berita pasar.
- Dampak bagi pemula: berbagi jadwal yang tepat tanpa harus menjelaskan.
- Batasan: tanpa layanan pihak ketiga, tanpa data pribadi; sorotan dimatikan bila prefers-reduced-motion; tombol bisa dipakai keyboard.
- Usaha: kecil (Arif + Dewi; Nina menambah cek).
- Status: diusulkan Kirana 20 Nov 15.xx; dipilih Bima; **selesai 20 Nov 16.xx** (cek 2f-8). Tinjauan Kirana: kartu 390px 481→535px karena tombol Salin di baris sendiri → tugas lanjutan Dewi (satu baris aksi). **Selesai 20 Nov 17.xx** (Dewi + Kirana, cek 2f-9): kalender, Salin tautan, dan Sumber (n) dalam satu baris aksi flex-wrap; 390px kartu 535→483px, 1280px ketiganya sebaris (kartu 322px).

### 38. Agenda: contoh hitungan dividen di kartu ("bila punya 1 lot")
- **Angka dividen jadi nyata bagi pemula** — konten, usaha kecil
- Masalah: "Rp10 per saham" sulit dibayangkan; pelajaran praktik sudah punya contoh Rp40 × 200 lembar, tetapi kartu belum.
- Ide: satu baris netral di kartu: "Contoh: 1 lot (100 saham) × Rp10 = Rp1.000 sebelum pajak", dihitung dari `dps` yang sama, dengan tautan ke istilah "lot".
- Acuan tren: contoh hitungan singkat di aplikasi edukasi investasi.
- Dampak bagi pemula: paham besar dividen per lot tanpa kalkulator.
- Batasan: hanya contoh hitungan, bukan perkiraan keuntungan; tanpa kata ajakan (Hana meninjau); USD ditulis dalam US$ tanpa konversi kurs.
- Usaha: kecil (Dewi + Sari; Nina menambah cek).
- Status: diusulkan Kirana 20 Nov 15.xx; **dipilih Bima 20 Nov 17.xx**; **selesai 20 Nov 18.11** (Dewi + Sari, cek Nina 2f-10). Tinjauan Kirana 390px terang/gelap: rapi, tanpa perbaikan.

### 39. Beranda: pita "Agenda terdekat" menampilkan hitung mundur dengan istilah yang bisa diketuk
- **Istilah tanggal langsung terjelaskan di beranda** — tampilan, usaha kecil
- Masalah: pita beranda menyebut "Cum date" tetapi pemula yang belum membuka Agenda tidak tahu artinya.
- Ide: pasang penanda istilah (pola `pasangIstilah` yang sudah ada) pada nama tanggal di pita beranda, plus tautan "Arti tanggal" ke `agenda.html#arti-tanggal`.
- Acuan tren: tooltip istilah di aplikasi edukasi keuangan.
- Dampak bagi pemula: belajar istilah tepat saat melihatnya.
- Batasan: tanpa pustaka baru, bisa keyboard, ringan.
- Usaha: kecil (Dewi; Nina menyesuaikan cek).
- Status: diusulkan Kirana 20 Nov 15.xx; **dipilih Bima 20 Nov 18.11** (masuk BACKLOG.md); **selesai 20 Nov 19.xx** (Dewi + Nina, cek 2f-11). Tinjauan Kirana 390/1280px terang/gelap: tiga "Cum date" bergaris titik, kotak istilah terbuka lewat Enter, tautan "Semua agenda" & "Arti tanggal" sebaris; tanpa perbaikan.

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

### Audit kontras lanjutan + garis fokus keyboard (Dewi & Kirana, 17 Nov 08.xx)
- Ditambah ke `tools/audit-kontras.js`: beranda, Belajar, pelajaran dengan kuis terjawab benar (3/3) dan salah (0/3), 404. Hasil teks: 0 di bawah 4,5:1, tanpa scroll horizontal, tanpa galat JS.
- Cek baru garis fokus: Tab 10× per halaman (10 halaman), latar diambil dari titik tepat di luar garis. Temuan: di mode terang garis kuning bulan di atas kertas hanya 1,55:1 (di kartu putih 1,67:1), sulit terlihat oleh pengguna keyboard.
- Perbaikan Dewi: token `--fokus` (terang biru malam ≥10:1, gelap kuning bulan), garis kuning dipertahankan di bagian biru malam; menu atas di HP memakai garis di dalam tombol agar tidak menimpa tombol aktif yang putih. Kirana: tangkapan 390px & 1280px rapi, garis jelas tanpa menggeser tata letak.
- Berikutnya: Tab sampai habis di halaman interaktif, kotak tanya Asisten, menu aktif.

### Garis fokus: Tab sampai habis + kotak tanya Asisten (Dewi & Tegar, 17 Nov 09.09)
- `tools/audit-kontras.js` kini menekan Tab sampai fokus kembali ke elemen pertama atau keluar halaman (maks. 400×), bukan 10×. Keadaan baru: kotak istilah terbuka (Peringkat), hasil Radar UNTR, kuis terjawab. `AUDIT=fokus` menjalankan cek fokus saja.
- Hasil: 13 keadaan × gelap/terang × 390/1280px = 2.068 elemen terfokus dicek, 0 garis fokus di bawah 3:1. Menu aktif (tombol putih) lolos: di HP garis biru malam di dalam tombol, di desktop garis kuning di atas biru malam.
- Kotak tanya Asisten (tanda fokus = warna border 2px, outline dimatikan): dicek terhadap latar di sekitarnya dan terhadap border biasa (WCAG 2.4.13: berubah ≥3:1); lolos di kedua mode. Di lingkungan uji Asisten "belum aktif" sehingga kotak tanya dinonaktifkan; audit mengaktifkannya sementara agar ikut diperiksa.
- Uji balik baru UJI-FOKUS-BORDER (border fokus disamakan dengan border biasa) tertangkap di keempat kombinasi. Nina menambah cek statis yang sama di `tests/cek.mjs` (3 uji balik).
- Catatan: keadaan istilah terbuka dan kuis terjawab mulai Tab dari elemen itu sampai akhir halaman; bagian sebelumnya sudah tercakup di keadaan awal halaman yang sama.
- Berikutnya: elemen terfokus tidak tertutup elemen lengket (kepala tabel Peringkat, #30).

### Fokus tidak tertutup elemen lengket (Dewi & Nina, 17 Nov 10.08)
- `tools/audit-kontras.js` (`AUDIT=fokus`) kini juga menekan Tab maju lalu Shift+Tab mundur sampai habis di Peringkat, Peringkat dengan istilah terbuka, Metodologi (daftar isi lengket), Radar UNTR, profil ANTM, beranda; gelap/terang, 390/1280px (tinggi layar 700px). Tiap elemen terfokus dicek di 9 titik: tertutup elemen sticky/fixed atau di luar layar.
- Temuan nyata 1: di 1280px, Shift+Tab mundur di tabel Peringkat berhenti tepat di bawah kepala tabel lengket (#30), tautan kode & "Sumber" tertutup penuh. Diperbaiki: `scroll-margin-top: 4rem` untuk tautan/tombol baris (kepala ±42px).
- Temuan nyata 2: kotak istilah terbuka (melayang) menutupi "Tentang data ini" saat Tab berlanjut di 390px. Diperbaiki: kotak istilah ditutup saat fokus pindah keluar dari tombol istilah & kotaknya (Tab ke tautan di dalam kotak tetap bisa; Escape tetap mengembalikan fokus).
- Hasil setelah perbaikan: 0 temuan tertutup penuh, 0 tertutup sebagian. Uji balik UJI-TUTUP (lapisan fixed di atas halaman) tertangkap. Nina menambah cek statis di `tests/cek.mjs` (4 uji balik).
- Berikutnya: halaman Kabar, Belajar, pelajaran, Asisten, 404 dan tombol "Ke atas".

### Fokus tertutup di halaman lain + "Kembali ke atas" (Dewi & Nina, 17 Nov 13.09)
- Audit `AUDIT=fokus` kini mencakup Kabar, Belajar (Kamus istilah berupa daftar biasa, tanpa kotak melayang), pelajaran dengan kuis terjawab, Asisten (kotak tanya diaktifkan), 404; Tab maju & Shift+Tab, gelap/terang, 390/1280px. Hasil: 0 tertutup penuh.
- Catatan nyata (sebagian, 2.4.12): di Asisten 390px, Shift+Tab ke kotak tanya hanya menggulir kursor teks sehingga bagian atas kotak terpotong (3/9 titik). Diperbaiki: pendengar focus memanggil `scrollIntoView({block:"nearest"})` bila kotak tidak tampil utuh → 0 catatan.
- "Kembali ke atas" (Peringkat & Kabar): dari bawah halaman, Tab ke tautan lalu Enter → awal isi kembali di layar dan tidak tertutup elemen lengket. Uji balik UJI-KEATAS (tujuan diganti ke id yang tidak ada) tertangkap.
- Audit garis fokus: gulir halus di profil membuat select "Pilih emiten" sempat diukur di luar layar (temuan palsu 2,38:1). Gulir halus kini dimatikan selama audit; hasil 0 temuan.
- Kirana: tidak ada perubahan tampilan yang terlihat; perilaku kotak tanya lebih nyaman di HP.
- Berikutnya: zoom 200% dan layar pendek HP (papan ketik terbuka).

### Zoom 200% & layar pendek HP (Dewi & Nina, 17 Nov 14.10)
- Audit baru `AUDIT=zoom node tools/audit-kontras.js` (juga ikut di audit penuh): zoom 200% = jendela 640×450 piksel CSS (deviceScaleFactor 2) untuk Peringkat, profil ANTM, Asisten, pelajaran (kuis terjawab), Radar UNTR, beranda; HP pendek 390×600 untuk Peringkat, profil, Asisten, pelajaran. Gelap & terang, Tab maju & Shift+Tab.
- Hasil: 0 scroll horizontal, 0 fokus tertutup penuh, 0 sebagian, tanpa galat JS. Kepala tabel lengket tidak menghabiskan layar pendek.
- Papan ketik terbuka (390×360): kotak tanya Asisten dan kotak ketik Radar dicapai dengan Tab → tampil utuh dan tidak tertutup elemen lengket.
- Uji balik: UJI-LEBAR (elemen 900px), UJI-TUTUP (lapisan fixed), UJI-KETIK (lapisan menutup kotak tanya) semua tertangkap.
- Kirana: tidak ada perubahan tampilan; tangkapan layar Peringkat 640×450 rapi (tabel muat, tanpa geser).
- Berikutnya: jarak teks (WCAG 1.4.12) agar teks tidak terpotong saat pengguna memperbesar jarak baris/huruf.

### Audit jarak teks WCAG 1.4.12 (Dewi & Nina, 17 Nov 15.09)
- `AUDIT=jarak node tools/audit-kontras.js`: gaya jarak dipasang (line-height 1,5; jarak paragraf 2em; jarak huruf 0,12em; jarak kata 0,16em) di 12 keadaan (Peringkat kartu HP & tabel, kotak istilah terbuka, profil ANTM, Radar UNTR, pelajaran kuis terjawab, Asisten kosong & berisi jawaban, beranda, Kabar, Belajar, Metodologi, 404), gelap/terang, 390px & 1280px.
- Diperiksa: scroll horizontal, teks terpotong kotak ber-overflow hidden/clip, baris teks menumpuk (≥3px).
- Temuan nyata: menu atas di HP (≤600px) disetel `nowrap` → dengan jarak huruf lebar meluber 21px (scroll horizontal di semua halaman 390px). Diperbaiki: menu boleh turun baris bila tidak muat. Tampilan biasa tidak berubah (360/390/600/1280px tetap satu baris, tinggi kepala sama).
- Temuan palsu disaring: kotak istilah (position fixed) memang melayang menutupi teks di bawahnya; hanya dibandingkan dengan teksnya sendiri.
- Hasil sesudah perbaikan: 0 temuan, tanpa galat JS. Uji balik UJI-POTONG (judul tinggi tetap + overflow hidden) dan UJI-TUMPUK (judul tinggi tetap) tertangkap.
- Berikutnya: orientasi layar (WCAG 1.3.4) — HP mendatar 844×390 tanpa isi hilang.

### Audit orientasi layar (WCAG 1.3.4) — Dewi & Nina, 17 Nov 16.18
- `AUDIT=orientasi node tools/audit-kontras.js`: HP mendatar 844×390 dan tablet mendatar 1024×768, dibanding tegak (390×844 / 768×1024); Peringkat, profil ANTM, Radar UNTR, pelajaran kuis terjawab, Asisten, beranda; gelap & terang.
- Diperiksa: isi <main> yang terlihat saat mendatar ≥90% dari saat tegak (tidak terkunci orientasi), scroll horizontal, tinggi elemen lengket setelah digulir (maks separuh layar), fokus tertutup (Tab maju & mundur), kotak tanya Asisten tercapai Tab dan tampil utuh. Cek statis: tidak ada `screen.orientation.lock` / kunci orientasi.
- Hasil: 0 temuan, tanpa galat JS. Panjang isi sama persis mendatar/tegak; kepala lengket paling tinggi 42px (tablet Peringkat). Uji balik UJI-KUNCI (isi disembunyikan saat mendatar) dan UJI-LENGKET (kepala lengket 60% layar) tertangkap 4/4.
- Berikutnya: ukuran sasaran sentuh (WCAG 2.5.8) di 390px.

### Audit ukuran sasaran sentuh (WCAG 2.5.8) — Dewi & Nina, 17 Nov 17.09
- `AUDIT=sentuh node tools/audit-kontras.js`: HP 390×844 (sentuh), gelap & terang; Peringkat (+ kotak istilah terbuka), profil ANTM, Radar UNTR, pelajaran (sebelum & sesudah kuis), Asisten, beranda, Kabar, Belajar, Metodologi, 404.
- Aturan: tiap tautan/tombol/isian/summary minimal 24×24px, atau lingkaran 24px di tengahnya tidak menyentuh sasaran lain (pengecualian jarak). Tautan di dalam kalimat dikecualikan; kotak pilihan kuis diukur bersama label-nya.
- Temuan awal 14 (7 per mode): deretan "Bingung istilahnya? Ketuk: …" di Peringkat — tombol istilah tingginya 23px dan baris kedua menempel ke baris pertama; tautan "Pelajari lebih lanjut" di kotak istilah tingginya 21px tepat di bawah tombol pembukanya. Diperbaiki dengan padding 2px (kini 27px dan 25px), tampilan 390/1280px tetap rapi, tanpa scroll horizontal; audit jarak teks tetap 0 temuan.
- Hasil akhir: 0 temuan, tanpa galat JS. Uji balik UJI-SENTUH (dua tombol 12px berdempetan) tertangkap 2/2.
- Berikutnya: konten yang muncul saat diarahkan/difokus (WCAG 1.4.13) — kotak istilah.


### Audit konten saat diarahkan/difokus — WCAG 1.4.13 (Dewi & Nina, 17 Nov 18.10)
- Alat: `AUDIT=sorot node tools/audit-kontras.js` (juga ikut audit penuh). 10 halaman (Peringkat, profil ANTM, Radar UNTR, pelajaran dengan kuis terjawab, Asisten, beranda, Kabar, Belajar, Metodologi, 404) × 390/1280px × gelap/terang. Tiap elemen yang bisa difokus diarahkan penunjuk lalu difokus keyboard; konten baru yang tampil wajib: tertutup dengan Escape tanpa memindah penunjuk/fokus (kecuali bila tidak menutupi isi lain), tetap tampil saat penunjuk digeser ke atasnya, dan tidak hilang sendiri (ditunggu 3 detik).
- Kotak istilah (dibuka klik/Enter) diuji khusus: tetap tampil saat penunjuk di atas kotak, saat penunjuk pergi, dan setelah 3 detik; Escape menutup dari tombol maupun dari tautan di dalam kotak, dan fokus kembali ke tombol istilah. Lolos di semua keadaan.
- Temuan: tautan "Langsung ke isi" yang muncul saat difokus menutupi logo dan tidak bisa disembunyikan dengan Escape (40 temuan, satu per halaman per keadaan). Perbaikan: Escape kini menyembunyikannya tanpa memindah fokus (muncul lagi saat difokus berikutnya). Di 404.html (tanpa JavaScript) tautan itu ikut alur halaman saat difokus sehingga tidak menutupi apa pun.
- Hasil akhir: 0 temuan, tanpa galat JS. Uji balik UJI-SOROT (kotak hilang saat mouseout/blur, tanpa Escape) tertangkap 4/4, UJI-HILANG (kotak hilang sendiri setelah 1 detik) tertangkap 4/4.
- Catatan: tooltip bawaan peramban dari atribut `title` pada tombol istilah diatur peramban (di luar kendali situs), jadi tidak diaudit.
- Berikutnya: label dalam nama (WCAG 2.5.3) — nama aksesibel tombol/tautan wajib memuat teks yang terlihat.

### 17 Nov 19.12 — Dewi & Nina: audit label dalam nama (WCAG 2.5.3)
- `AUDIT=label node tools/audit-kontras.js`: 12 keadaan (Peringkat, istilah terbuka, profil ANTM, Radar UNTR, pelajaran sebelum/sesudah kuis, Asisten, beranda, Kabar, Belajar, Metodologi, 404) × gelap/terang × 390/1280px. Setiap tautan/tombol/isian/ringkasan yang punya teks terlihat dibandingkan dengan nama aksesibelnya (aria-labelledby → aria-label → isi); teks khusus pembaca layar tidak dihitung sebagai teks terlihat.
- Hasil: 2.424 elemen dicek, 0 temuan (nama selalu memuat teks terlihat; logo "Candra Analis, beranda", tautan "Sumber", tombol istilah, tautan sumber "(tab baru)" lolos).
- Saran WCAG (nama sebaiknya diawali teks terlihat): 144 tautan kode emiten bernama "Profil ANTM" padahal yang terlihat "ANTM". Diperbaiki menjadi "ANTM, profil emiten" agar perintah suara "klik ANTM" langsung cocok. Tampilan tidak berubah. Saran kini 0.
- Uji balik UJI-LABEL (tombol "Kirim" ber-aria-label "Tutup") tertangkap 4/4. Nina menambah cek statis di `tests/cek.mjs` (aria-label di app.js & HTML wajib memuat teksnya; tautan kode wajib diawali kode) + 5 uji balik.
- Berikutnya: pesan status (WCAG 4.1.3).

### 17 Nov 20.12 — Dewi & Nina: audit pesan status (WCAG 4.1.3)
- `AUDIT=status node tools/audit-kontras.js` (juga ikut audit penuh): 19 skenario × gelap/terang × 390/1280px, 84 pesan dicek. Skenario: saring sektor Peringkat, cari Kamus (cocok & kosong), kuis (dijawab & kosong), Tandai selesai, Salin tautan (berhasil & cadangan), kotak ketik Radar (1 cocok, banyak, tidak ada) & Bandingkan, pilih Radar & Bandingkan, saring Kabar, Asisten (belum aktif, menunggu jawaban, galat server, koneksi putus; `api/tanya` ditiru).
- Aturan: pesan wajib berada di wilayah role="status"/aria-live yang sudah ada DAN tampil sebelum aksi pengguna.
- Temuan sebelum perbaikan: 56. Penyebab: (1) enam wilayah pesan (`.tandai-info`, `.saring-ket`, `.kuis-hasil`, `.obrolan`, `.info-ketik`, `.info-salin`) disembunyikan dengan `display:none` saat kosong, jadi wilayahnya baru masuk pohon aksesibilitas bersamaan dengan pesannya; (2) pita "Asisten belum aktif" sendiri ber-role status dan ber-hidden.
- Perbaikan: saat kosong, wilayah hanya dikecilkan keluar dari alur (pola teks khusus pembaca layar, `clip-path: inset(50%)`); tampilan sama seperti dulu. Pita Asisten kini di dalam wadah role="status" yang selalu ada. Sesudah: 0 temuan. Zoom/layar pendek & sasaran sentuh dijalankan ulang: 0 temuan; tanpa scroll horizontal di 10 halaman (390 & 1280px).
- Uji balik UJI-STATUS (pesan di `<p>` tanpa aria-live + wilayah status yang dibuat bersama pesannya) tertangkap 4/4. Nina menambah cek statis di `tests/cek.mjs` (wilayah status tidak boleh `:empty { display:none }` atau dibuat hidden; pita Asisten di wadah status) + uji balik.
- Berikutnya: halaman berjudul jelas & urutan judul (WCAG 2.4.2 / 1.3.1, judul h1–h3 tidak melompat) di 10 halaman.

#### Audit judul halaman & urutan judul (WCAG 2.4.2 & 1.3.1) — Dewi & Nina, 17 Nov 21.12
- Alat: `AUDIT=judul node tools/audit-kontras.js` (juga ikut audit penuh). 18 keadaan (10 halaman + profil ANTM/TPIA/kode tak dikenal, pelajaran 2 modul/kuis terjawab/modul tak dikenal, Radar UNTR, kotak istilah) × gelap/terang × 390/1280px; 476 judul dicek.
- Aturan: `<title>` tidak kosong dan berbeda untuk keadaan yang isinya berbeda; tepat satu `<h1>` terlihat; judul pertama di `<main>` = h1; tingkat judul tidak melompat turun (h2 → h4).
- Temuan sebelum perbaikan: 8 (semuanya sama): profil dengan kode yang tidak ada di data (mis. `?kode=ZZZZ`) berjudul tab "Profil emiten" seperti halaman daftar, padahal isinya pesan "Kode ZZZZ belum ada di data kami". Perbaikan: judul tab kini "Kode ZZZZ tidak ditemukan · Profil emiten · Candra Analis". Sesudah: 0 temuan. Tampilan halaman tidak berubah.
- Catatan: `pelajaran.html?m=tidak-ada` menampilkan pelajaran 1 utuh, jadi judulnya ikut pelajaran 1 (sesuai isi) dan tidak dihitung temuan.
- Uji balik: UJI-JUDUL (h1 kedua + h2 → h4) dan UJI-TITLE (title kosong) tertangkap 4/4. Nina menambah cek statis di `tests/cek.mjs` (10 file HTML: title unik, satu h1, tanpa lompatan) + 4 uji balik.
- Berikutnya: bahasa halaman & bagian (WCAG 3.1.1 / 3.1.2).
- Selesai 18 Nov 07.xx (lihat di bawah).

#### Audit bahasa halaman & bagian (WCAG 3.1.1 & 3.1.2) — Dewi, Arif & Nina, 18 Nov 07.xx
- Alat: `AUDIT=bahasa node tools/audit-kontras.js` (juga ikut audit penuh). 16 keadaan (10 halaman + Radar UNTR, profil ANTM/TPIA, 2 pelajaran, kuis terjawab, kotak istilah) × gelap/terang × 390/1280px.
- Aturan: `<html lang="id">` di semua halaman; atribut lang lain hanya id/en; 20 istilah Inggris (mis. buyback, Dividend yield, Capital gain, Short selling, Sharia Online Trading System, Return on Equity) yang terlihat wajib berada di dalam `lang="en"`.
- Temuan sebelum perbaikan: 96 (semuanya di Belajar/kamus dan pelajaran; halaman lain belum memuat istilah Inggris yang terlihat). Perbaikan (Arif + Dewi): app.js membungkus istilah itu dengan `<span lang="en">` sesudah tombol istilah dipasang, dan memantau isi yang dibuat ulang (kotak istilah, kuis). Sesudah: 0 temuan, 144 penanda; jumlah tombol istilah dan panjang teks tiap halaman sama persis seperti sebelumnya; tanpa scroll horizontal. Audit label, status, judul, dan sorot tetap 0.
- Uji balik: UJI-LANG (lang `<html>` dihapus) dan UJI-EN (penanda diubah ke id) tertangkap 4/4. Nina menambah cek statis di `tests/cek.mjs` (lang tiap halaman, pemanggilan, daftar istilah app.js = audit) + 4 uji balik.
- Kirana meninjau tangkapan 390px pelajaran "Saham syariah": tampilan tidak berubah (penanda tidak terlihat).
- Berikutnya: label & pesan salah isian (WCAG 3.3.1 / 3.3.2).

#### Audit label, petunjuk & pesan salah isian (WCAG 3.3.2 & 3.3.1) — Dewi & Nina, 18 Nov 08.xx
- Alat: `AUDIT=isian node tools/audit-kontras.js` (juga ikut audit penuh). 9 keadaan (kuis kosong & sebagian, Asisten kosong / 600 karakter / kosong lalu diisi, Radar kode tak dikenal & dikenal, Bandingkan kode tak dikenal, cari kamus tanpa hasil) × gelap/terang × 390/1280px, 124 isian.
- Aturan: tiap isian terlihat punya label bertulisan; isian ber-maxlength punya petunjuk yang menyebut batasnya lewat aria-describedby; isian aria-invalid="true" punya pesan teks terlihat lewat aria-describedby; tiap pesan salah yang tampil dirujuk isiannya; keadaan benar tidak boleh bertanda salah.
- Temuan sebelum perbaikan: 52 (Asisten: kirim kosong diam saja tanpa pesan, batas 600 karakter hanya angka "0/600"; kuis: "Belum dijawab." tidak terhubung ke soalnya; kotak ketik: kode tak dikenal tidak ditandai aria-invalid). Sesudah: 0.
- Perbaikan: petunjuk "Paling banyak 600 karakter. Tekan Enter untuk mengirim, Shift+Enter untuk baris baru." di atas kotak tanya; pesan "Pertanyaan masih kosong. Tulis pertanyaan Anda dulu, lalu kirim." (wilayah status, hilang saat mulai mengetik) + garis merah bila tidak sedang difokus; fieldset soal kuis aria-describedby ke umpannya; kotak ketik aria-invalid saat tidak ada emiten cocok. Kontras teks baru: terang 7,25 & 5,51; gelap 9,55 & 7,42.
- Uji balik: UJI-ISIAN (isian aria-invalid tanpa pesan, textarea maxlength tanpa petunjuk, pesan salah tak terhubung) tertangkap 4/4. Nina: cek DOM tiruan (Asisten, kuis, kotak ketik) + uji balik di `tests/cek.mjs`.
- Temuan sampingan audit fokus: garis fokus tautan "Langsung ke isi" di 404 (mode terang) kuning di atas latar terang 1,55:1 → kini memakai warna teks halaman.
- Berikutnya: urutan fokus (WCAG 2.4.3).

### Audit urutan fokus (WCAG 2.4.3), 18 Nov 09.09 (Dewi & Nina, ditinjau Kirana)
- Alat: `AUDIT=urutan node tools/audit-kontras.js` (ikut audit penuh). 15 keadaan: 10 halaman, kotak istilah terbuka di Peringkat, kuis sesudah Periksa (lewat Enter) dan sesudah "Ulangi soal yang salah", Radar sesudah memilih UNTR, profil ANTM sesudah memilih pembanding. Gelap/terang × 390/1280px; Tab sampai kembali ke awal.
- Aturan: tidak ada tabindex positif; elemen yang terfokus terlihat (bukan opacity 0, bukan di luar dokumen/layar, bukan di aria-hidden/inert, bukan teks khusus pembaca layar); fokus berikutnya tidak di kiri pada baris yang sama dan tidak lebih atas kecuali pindah ke kolom kanan; Tab dari tombol istilah terbuka harus masuk ke kotak istilah.
- Hasil: 2.192 fokus dicek, 0 temuan. Tidak ada perubahan tampilan.
- Uji balik: UJI-POSITIF (tabindex="2" di tautan kaki), UJI-SEMBUNYI (tautan di left:-9999px & tautan opacity 0), UJI-BALIK (menu atas dibalik row-reverse) masing-masing tertangkap 4/4. Nina: cek statis tabindex positif di 10 HTML & app.js + uji balik di `tests/cek.mjs`.
- Berikutnya: kontras non-teks (WCAG 1.4.11).

### Audit kontras non-teks (WCAG 1.4.11), 18 Nov 10.09 (Dewi & Nina, ditinjau Kirana)
- Alat: `AUDIT=nonteks node tools/audit-kontras.js` (ikut audit penuh). 14 keadaan: 10 halaman, Radar sesudah memilih UNTR, profil ANTM + Bandingkan, kuis sesudah Periksa, Asisten aktif + kirim kosong (garis merah aria-invalid). Gelap/terang × 390/1280px.
- Yang dicek (≥3:1 terhadap latar di sebelahnya): garis tepi kotak isian (atau isi kotak), tombol bergaris (.tombol-garis, .tombol-salin, .tombol-lagi, tab tak terpilih, chip), lingkaran pilihan kuis (diukur dari piksel tangkapan layar), isi batang terhadap jalurnya, lampu panduan Radar, garis kiri kartu tanda Radar.
- Sebelum: 96 temuan. Garis tepi kotak isian, tab, dan chip memakai `--garis` (#dfe2d8 = 1,2:1 di terang; #353a4e = 1,5:1 di gelap); tombol "garis" di hero #4b51a0 di atas biru malam 2,22:1. Lingkaran kuis, batang, lampu, dan garis kartu Radar sudah lolos.
- Perbaikan (Dewi): token baru `--garis-kontrol` (terang #80867a = 3,48:1 di kertas / 3,74:1 di kartu; gelap #6b7290 = 3,91:1 / 3,54:1) untuk kotak isian, tab, chip, kotak alamat salin; garis `.tombol-garis` kini #7b82d6 (4,47:1). Garis fokus kotak tanya kini `--tinta` karena aksen gelap hanya 2,35:1 terhadap garis baru. Garis kartu & tabel tetap `--garis` (hiasan, bukan komponen).
- Sesudah: 352 komponen dicek, 0 temuan; tanpa scroll horizontal; audit fokus tetap 0 (UJI-FOKUS-BORDER tetap tertangkap 4/4).
- Uji balik: UJI-PUDAR (garis isian = warna isi kotak) dan UJI-LAMPU (lampu = warna garis) masing-masing 4/4. Nina: cek statis token & aturan CSS + 9 uji balik di `tests/cek.mjs`.
- Kirana: tangkapan 390px gelap & 1280px terang: kotak isian dan chip kini jelas batasnya tanpa terlihat berat.
- Berikutnya: penggunaan warna (WCAG 1.4.1): informasi tidak boleh hanya lewat warna.

### Audit penggunaan warna (WCAG 1.4.1), 18 Nov 13.10 (Dewi & Nina, ditinjau Kirana)
- Alat: `AUDIT=warna node tools/audit-kontras.js` (ikut audit penuh). 13 keadaan: 10 halaman, Radar sesudah memilih UNTR, profil ANTM + Bandingkan, kuis sesudah Periksa. Gelap/terang × 390/1280px.
- Yang dicek: tautan & tombol istilah di dalam blok teks harus bergaris bawah (atau beda ≥3:1 dari teks sekitar DAN bergaris saat diarahkan); kartu temuan Radar harus punya label teks tingkat; lampu panduan berlabel; angka naik/turun bertanda +/−; umpan kuis ✓/✗; status syariah bertulisan; setiap baris batang punya angka tertulis; batang musim laporan punya teks "n dari m". Teks khusus pembaca layar tidak dihitung.
- Sebelum: 120 temuan. (1) Tingkat kartu temuan Radar & profil (berat/dicermati/keterangan/aman) hanya dibedakan warna garis & judul (52); pemula harus mencocokkan warna dengan panduan. (2) Judul pelajaran di beranda & Belajar (tautan) tanpa garis bawah dan berwarna sama dengan teks (64). (3) Panduan Hijau tanpa label yang sama dengan kartu (4).
- Perbaikan: label teks kecil di atas judul setiap kartu temuan ("Tanda berat", "Perlu dicermati", "Keterangan", "Tanpa tanda risiko") lewat `kartuSinyal()`/`labelTingkat()` (dipakai Radar & profil); panduan kini "Merah (Tanda berat): …" dst.; judul pelajaran bergaris bawah tipis (`--garis-kontrol`), menebal saat diarahkan.
- Sesudah: 1.332 penanda dicek, 0 temuan; tanpa scroll horizontal 390/1280px; audit non-teks, judul, label, sentuh, orientasi tetap 0.
- Uji balik: UJI-GARIS (garis bawah tautan dihapus) dan UJI-TINGKAT (label tingkat disembunyikan) masing-masing 4/4. Nina: cek statis + 10 uji balik di `tests/cek.mjs`.
- Kirana: tangkapan 390px terang & 1280px gelap: label tingkat terbaca jelas tanpa membuat kartu ramai; garis bawah judul pelajaran tidak berat.
- Berikutnya: tujuan tautan (WCAG 2.4.4).

### Audit tujuan tautan (WCAG 2.4.4), 18 Nov 14.10 (Dewi & Nina, ditinjau Kirana)
- Alat: `AUDIT=tautan node tools/audit-kontras.js` (ikut audit penuh). 15 keadaan: 10 halaman, Radar UNTR, profil ANTM + Bandingkan, kuis sesudah Periksa, kotak istilah terbuka. Gelap/terang × 390/1280px, 2.708 tautan & tombol.
- Yang dicek: setiap tautan & tombol punya nama; nama tidak samar bila berdiri sendiri ("di sini", "klik", "selengkapnya", "lihat", "lanjut", "lainnya"); tautan bernama sama di satu halaman menuju tempat yang sama.
- Sebelum: 8 temuan, satu masalah: di profil emiten, tautan "Radar Risiko" di menu (ke radar.html) dan di baris "Lompat ke" (ke bagian Radar di profil) bernama sama tetapi tujuannya beda.
- Perbaikan: tautan "Lompat ke" menjadi "Radar Risiko emiten ini". Tambahan (bukan temuan alat, tetapi tujuannya hanya jelas dari kotak di sebelahnya): tombol "Unduh PDF" di Belajar menjadi "Unduh PDF modul".
- Sesudah: 0 temuan; tanpa scroll horizontal 390/1280px; audit label dalam nama, sentuh, warna, urutan tetap 0.
- Uji balik: UJI-DISINI (tautan "di sini" disisipkan) dan UJI-KEMBAR (tautan "Belajar" ke halaman lain) masing-masing 4/4. Nina: cek statis (tautan samar di 10 HTML & app.js, nama "Lompat ke" Radar, mode audit) + 9 uji balik di `tests/cek.mjs`.
- Kirana: tangkapan 390px: "Radar Risiko emiten ini" membungkus rapi ke baris kedua chip "Lompat ke"; tombol "Unduh PDF modul" tetap satu baris.
- Berikutnya: identifikasi konsisten (WCAG 3.2.4) — selesai 18 Nov 15.09, lihat di bawah.

### Audit identifikasi konsisten (WCAG 3.2.4), 18 Nov 15.09 (Dewi & Nina, ditinjau Kirana)
- Alat: `AUDIT=konsisten node tools/audit-kontras.js` (ikut audit penuh). 15 keadaan (10 halaman + profil TPIA, kotak istilah terbuka di Peringkat & pelajaran, 2 uji balik) × gelap/terang × 390/1280px, 1.404 komponen.
- Yang dibandingkan antarhalaman: "Langsung ke isi", logo beranda, label & urutan menu utama serta nama tiap tautan menu, tautan kaki, tautan unduhan, label & atribut kotak "Ketik kode atau nama emiten" (Radar & Bandingkan), pola tombol istilah ("Apa itu …?", aria-expanded), label kotak istilah, tombol "Salin tautan profil". Juga satu nama di menu/kaki tidak boleh menuju dua tempat.
- Hasil: 0 temuan (404 memakai alamat berawalan "/", setelah dinormalkan tujuannya sama). Tidak ada perubahan tampilan.
- Catatan: daftar pilihan emiten di Radar ("Atau pilih saham yang Anda pegang") dan Bandingkan ("Bandingkan ANTM dengan") berlabel beda karena fungsinya beda (memeriksa vs membandingkan); itu sesuai 3.2.4.
- Uji balik: UJI-MENU (menu "Radar Risiko" di Kabar diganti "Cek Risiko") dan UJI-KAKI (kaki Metodologi di Belajar diganti "Metodologi") masing-masing 4/4. Nina: cek statis menu/kaki/lompat/logo di 10 HTML, label kotak ketik tunggal, mode audit + 10 uji balik di `tests/cek.mjs`.
- Berikutnya: pembatalan penunjuk (WCAG 2.5.2).

### Audit pembatalan penunjuk (WCAG 2.5.2), 18 Nov 16.xx (Dewi & Nina; Kirana meninjau)
- Alat: `tools/audit-kontras.js` (`AUDIT=penunjuk`, ikut audit penuh). 13 keadaan (10 halaman + kotak istilah terbuka di Peringkat + Radar UNTR) × gelap/terang × 390/1280px (390px dengan layar sentuh).
- Tiga cara: (1) skrip pemantau dipasang sebelum app.js untuk mencatat pendengar `mousedown`/`pointerdown`/`touchstart` dan properti `on…`; (2) 2.460 elemen yang bisa ditekan dikirimi tekan tiruan tanpa lepas: DOM, alamat, gulir, centang tidak boleh berubah; (3) 248 kali tekan sungguhan lalu geser keluar dan lepas di area kosong pada tombol istilah, tab Peringkat, pilihan kuis, Periksa, Salin tautan, menu, logo, chip Asisten, kaki, tombol di isi.
- Hasil: 0 temuan. Semua aksi memakai `click` (jalan saat dilepas) atau papan ketik. Tidak ada perubahan tampilan.
- Catatan: kotak istilah yang sedang terbuka tertutup bila penunjuk dilepas di luar kotak; ini terjadi saat dilepas (klik di luar), bukan saat ditekan, jadi sesuai 2.5.2. Klik Playwright sendiri memasang pendengar sementara di `window`; pendengar dicatat sebelum keadaan dibuat agar tidak jadi temuan palsu.
- Uji balik: UJI-TEKAN (tab Peringkat kedua dipasangi `pointerdown` yang langsung memilih tab) 4/4. Nina: cek statis app.js & 10 HTML (tanpa pendengar/atribut turun), mode audit + 9 uji balik di `tests/cek.mjs`.
- Berikutnya: gerakan penunjuk (WCAG 2.5.1) dan aktivasi lewat gerakan perangkat (2.5.4).

### 18 Nov 17.09: gerakan penunjuk WCAG 2.5.1 & gerakan perangkat WCAG 2.5.4 (Dewi & Nina; Kirana meninjau)
- Audit baru `AUDIT=gerak` di `tools/audit-kontras.js` (ikut audit penuh): 12 keadaan × gelap/terang × 390/1280px + 2 uji balik.
- Empat cara: (1) skrip pemantau mencatat pendengar `touchmove`, `pointermove`, `gesture*`, `drag*`, `drop`, `wheel`, `devicemotion`, `deviceorientation` dan elemen `draggable`; (2) 32 kali setiap tab dipilih dengan satu klik; (3) 48 kali geser sungguhan 200px di isi halaman; (4) 56 kali goyang tiruan (`devicemotion` + `deviceorientation`).
- Hasil: 0 temuan. Tidak ada fungsi yang hanya bisa lewat geser, seret, cubit, goyang, atau miring HP; tabel Peringkat & tab dipakai dengan satu ketuk. Tidak ada perubahan tampilan.
- Uji balik: UJI-GOYANG (window dipasangi `devicemotion` yang memilih tab) dan UJI-GESER (daftar tab dipasangi `touchmove`) tertangkap 8/8. Nina: cek statis app.js & 10 HTML + 12 uji balik di `tests/cek.mjs`.
- Kirana: setuju, tidak ada usulan geser/carousel yang perlu ditolak; bila kelak ada fitur geser, wajib disertai tombol satu ketuk.
- Berikutnya: label & nama bagian yang bisa diubah ukurannya (WCAG 1.4.4 ubah ukuran teks 200% tanpa zoom halaman).

### 18 Nov 18.10: ubah ukuran teks 200% WCAG 1.4.4 (Dewi & Nina; Kirana meninjau)
- Cara uji: ukuran huruf dasar peramban dinaikkan 16px → 32px (seperti setelan "Ukuran font" Chrome, bukan zoom), lebar layar tetap 390px & 1280px, gelap/terang, 14 keadaan (`AUDIT=teks`). Diperiksa: teks ikut membesar, tidak terpotong, tidak bertumpuk, tanpa scroll samping.
- Temuan awal 12 (semua di 390px): scroll samping di beranda (tabel tiga teratas), Peringkat (tombol pilihan 2×2 terlalu sempit), profil ANTM (tabel profil & batang 9 bulan); angka "Pendapatan YoY" dan "DER" bertumpuk di kartu Peringkat.
- Perbaikan Dewi: kueri media `@media (max-width: 19.5em)`. Karena memakai em, ia aktif saat teks besar (624px pada 200%, 390px pada 125%) tetapi tidak pada ukuran biasa di HP ≥320px. Isinya: tombol pilihan & kartu Peringkat satu kolom, label batang 9 bulan di baris sendiri, angka di tabel kecil boleh turun baris. Hasil: 0 temuan; audit jarak teks, sentuh, zoom, orientasi tetap 0.
- Catatan: 34 judul membesar kurang dari 1,9× karena memakai clamp/vw (tetap membesar ≥1,2× dan sudah besar); dicatat, bukan temuan.
- Kirana: tangkapan 390px teks 200% rapi: tombol pilihan bertumpuk satu kolom, kartu Peringkat terbaca berurutan (Sektor, Laba 2025, Pendapatan YoY, DER, Sumber), batang 9 bulan tanpa terpotong.

### Catatan audit: jeda, hentikan, sembunyikan WCAG 2.2.2 (Dewi & Nina, 18 Nov 19.11)
- Alat: `AUDIT=animasi node tools/audit-kontras.js`. 15 keadaan (10 halaman, kotak istilah terbuka, Radar UNTR, penanda mengetik Asisten, uji balik) × gerak bebas/dikurangi × gelap/terang × 390/1280px = 112 pengecekan. Waktu selesai tiap animasi dihitung dari `getComputedTiming()`, lalu ditunggu 5,2 detik.
- Temuan 4 (beranda, semua ukuran): bintang di langit hero berkedip tanpa henti (`infinite`) tanpa tombol jeda.
- Perbaikan Dewi: bintang berkedip 2 kali (1,6 detik, jeda .4/.8 detik) lalu diam di terang semula; selesai ≤4 detik. Penanda "sedang menyusun jawaban" juga dibatasi 4 kedip, titik-titik tetap terlihat. Saat gerak dikurangi tetap tanpa animasi.
- Hasil: 0 temuan; uji balik UJI-ANIMASI 8/8. Nina menambah cek statis (tanpa `infinite`, animasi hanya di `prefers-reduced-motion: no-preference`, tanpa setInterval) + 8 uji balik.
- Kirana: tangkapan 390px setelah 4,5 detik: bintang diam rapi, tidak ada scroll samping.

### Catatan audit: batas waktu & pembaruan otomatis WCAG 2.2.1 (Dewi & Nina, 18 Nov 20.13)
- Alat: `AUDIT=waktu node tools/audit-kontras.js`. 16 keadaan (10 halaman, kotak istilah terbuka, Radar UNTR, salin tautan berhasil & cadangan, cari kamus, kuis benar, tandai selesai, galat Asisten, 2 uji balik) × gelap/terang × 390/1280px = 64 pengecekan. Jam halaman dipalsukan (`page.clock`) lalu dimajukan 20 menit sekaligus; dibandingkan alamat, navigasi, dan 4.664 baris teks terlihat sebelum vs sesudah.
- Temuan 4 (profil emiten, semua ukuran): pesan "Tautan disalin." hilang sendiri setelah 4 detik; pembaca layar yang lambat atau pemula bisa tidak sempat membacanya.
- Perbaikan Dewi: pesan tetap tampil sampai tombol "Salin tautan profil" ditekan lagi; tidak ada lagi setTimeout di app.js. Tidak ada halaman yang memuat ulang atau berpindah sendiri, tidak ada meta refresh.
- Hasil: 0 temuan; uji balik UJI-HILANG/UJI-MUAT 8/8; audit animasi & pesan status tetap 0; skenario keyboard Salin (390/1280px) 0 temuan. Nina menambah cek statis (tanpa setTimeout/setInterval, tanpa location.reload/replace/assign/href =, tanpa meta refresh) + 10 uji balik; tes salin diubah: pesan tidak boleh dijadwalkan hilang.
- Kirana: perubahan hanya teks pesan yang menetap; dicek 390px & 1280px setelah 6 detik, pesan masih ada, tanpa scroll samping.


### Catatan audit: saat fokus & saat mengisi WCAG 3.2.1/3.2.2 (Dewi & Nina, 18 Nov 21.21)
- Alat: `AUDIT=konteks node tools/audit-kontras.js` (ikut audit penuh). Tab sampai habis di 11 halaman/keadaan (2.292 langkah Tab): tiap Tab hanya boleh memindah fokus sekali, maju sesuai urutan dokumen, tidak jatuh di elemen tabindex=-1, tanpa navigasi, window.open, atau tab baru. Ditambah 10 perubahan isian (pilih & panah bawah pilihan Radar, ketik kode Radar, saring sektor, saring jenis kabar, pilih & ketik Bandingkan, cari kamus, jawaban kuis, kotak tanya Asisten): halaman tetap, tanpa jendela baru, fokus tetap di kontrol yang diubah. Gelap/terang × 390/1280px.
- Hasil: 0 temuan, tanpa perubahan tampilan. Uji balik UJI-FOKUS, UJI-JENDELA, UJI-UBAH, UJI-ISI tertangkap 16/16.
- Nina: cek statis di `tests/cek.mjs` (app.js tanpa window.open dan .submit(); requestSubmit hanya satu, dari Enter di kotak tanya) + 9 uji balik.
- Kirana: tidak ada perubahan tampilan yang perlu ditinjau; usul berikutnya audit nama, peran, nilai (WCAG 4.1.2).

### Catatan audit: nama, peran, nilai WCAG 4.1.2 (Dewi & Nina, 19 Nov 07.xx)
- Alat: `AUDIT=peran node tools/audit-kontras.js` (ikut audit penuh). Dibaca dari pohon aksesibilitas yang dihitung peramban (CDP `Accessibility.getFullAXTree`), sama seperti yang diterima pembaca layar. 11 halaman/keadaan (termasuk Radar UNTR dan kuis terjawab) × gelap/terang × 390/1280px = 2.672 simpul kontrol: setiap tautan, tombol, tab, isian, pilihan, radio, ringkasan `<details>` punya peran kontrol dan nama tidak kosong; tab ada di dalam tablist dan punya keadaan selected; radio punya keadaan checked.
- 6 skenario keadaan (×4): tab Peringkat diklik satu per satu + panah kanan (selected pindah), tombol istilah (expanded false → true → false lewat Escape), "Tandai selesai" (pressed false → true → false), jawaban kuis dengan Spasi & panah (checked pindah), ringkasan `<details>` dibuka dengan Enter (expanded), pilihan Radar (nilai terbaca UNTR).
- Hasil: 0 temuan, tanpa perubahan tampilan. Uji balik UJI-NAMA (tombol ikon tanpa nama), UJI-PERAN (div bisa difokus tanpa peran), UJI-KEADAAN (aria-* dibekukan) tertangkap 12/12. Catatan Nina: skenario `<details>` sempat menguji halaman tanpa `<details>` dan lolos diam-diam; kini dipindah ke Peringkat dan wajib gagal bila `<details>` tidak ditemukan.
- Nina: cek statis di `tests/cek.mjs` (tab memperbarui aria-selected, istilah memasang aria-expanded true & false, Tandai selesai memasang aria-pressed ikut keadaan, tanpa div/span bisa difokus tanpa peran, HTML tanpa role tombol/tab di elemen bukan kontrol) + 12 uji balik.
- Kirana: tidak ada perubahan tampilan; usul berikutnya audit konten non-teks (WCAG 1.1.1): ikon, emoji, SVG, dan gambar punya teks pengganti yang tepat atau disembunyikan dari pembaca layar bila hiasan.

### Catatan audit: konten non-teks WCAG 1.1.1 (Dewi & Nina, 19 Nov 08.xx)
- Alat: `AUDIT=alt node tools/audit-kontras.js` (ikut audit penuh), dibaca dari pohon aksesibilitas peramban. 16 halaman/keadaan (termasuk Radar UNTR dengan batang 2024/2025, profil ANTM & UNTR dengan batang 9 bulan, kotak istilah terbuka, kuis terjawab, pelajaran ditandai selesai di beranda/Belajar/pelajaran) × gelap/terang × 390/1280px: 116 grafis (SVG/gambar) dan 40 batang grafik.
- Yang diperiksa: grafis yang terbaca wajib bernama, hiasan wajib disembunyikan; tautan/tombol berisi ikon tersembunyi wajib tetap bernama; simbol berdiri sendiri (▲ ✓ ★) wajib diberi teks pengganti; isi CSS `::before/::after` berupa simbol wajib memakai teks pengganti CSS; batang grafik wajib disembunyikan, barisnya menuliskan angka (selain tahun), dan daftarnya bernama.
- **Temuan nyata (4 → 0):** di Belajar, pelajaran yang sudah selesai menampilkan tanda ✓ lewat CSS `content: attr(data-no)`, sehingga pembaca layar membacakan "tanda centang" padahal "Selesai" sudah tertulis di judul (angka 1–8 juga dobel dengan nomor urut `<ol>`). Diperbaiki: `content: attr(data-no) / ""` (tampilan sama persis). SVG langit di beranda kini juga `aria-hidden="true"` sendiri (sebelumnya hanya lewat induknya).
- Uji balik UJI-ALT (gambar tanpa alt), UJI-SEMBUNYI (tautan ikon bermakna disembunyikan), UJI-SIMBOL (▲ sendiri), UJI-CSS (::after "★"), UJI-BATANG (angka batang dihapus) tertangkap 20/20. Catatan Nina: UJI-BATANG sempat lolos karena label "Jan–Sep 2026" berisi angka tahun; kini angka tahun tidak dihitung.
- Nina: cek statis di `tests/cek.mjs` (img ber-alt, svg tersembunyi/bernama, batang9-isi tersembunyi, daftar batang ber-aria-label, simbol CSS ber-teks pengganti, mode audit & 5 uji balik ada) + 12 uji balik.
- Kirana: tampilan tidak berubah (dicek 390/1280px, tanpa scroll samping). Catatan kecil: ✓/✗ di umpan kuis dan "→" di bukti Radar tetap dibacakan bersama kata-kata ("Benar.", "Belum tepat.") sehingga makna tidak hilang; boleh dirapikan nanti. Usul berikutnya: audit info & hubungan (WCAG 1.3.1) untuk tabel dan daftar.

### Catatan audit: info & hubungan tabel dan daftar WCAG 1.3.1 (Dewi & Nina, 19 Nov 09.xx)
- Alat: `AUDIT=tabel node tools/audit-kontras.js` (ikut audit penuh), dibaca dari pohon aksesibilitas peramban. 14 halaman/keadaan (beranda, Peringkat tab awal & tab terakhir & saring sektor, Radar UNTR, profil ANTM & UNTR, Bandingkan ANTM–UNTR, Kabar, Belajar, pelajaran, Metodologi, Asisten, 404) × gelap/terang × 390/1280px: 44 tabel, 1.676 sel data, 184 daftar.
- Yang diperiksa: tabel terbaca table dan bernama (caption); setiap `<th>` memakai `scope` dan terbaca columnheader/rowheader; setiap `<td>` terbaca cell dan kolomnya punya judul; di HP (390px) tabel kartu Peringkat tetap table/row/cell dan label kartu (`data-label`) sama dengan judul kolomnya; setiap `<ul>/<ol>` terbaca list berisi listitem; kumpulan ≥3 butir sejenis tidak boleh berupa div berderet.
- **Temuan nyata (24 → 0):** (1) tabel mini Peringkat di beranda memakai `<th>` tanpa `scope` → kini `scope="col"`. (2) Empat ubin "Angka utama" di profil emiten berupa div berderet → kini `<ul role="list">` berisi `<li>`, diberi nama dari judul "Angka utama"; pembaca layar mengumumkan "daftar, 4 butir". Tampilan sama persis (posisi & ukuran ubin dicocokkan sebelum/sesudah di 390/1280px, terang/gelap; tanpa scroll samping).
- Tabel kartu Peringkat di HP sudah baik: Chrome tetap membaca table/row/cell walau `display: block/grid`, dan semua label kartu sama dengan judul kolom.
- Uji balik UJI-TH (th diganti td), UJI-SCOPE (scope dihapus), UJI-DAFTAR (daftar diganti div berderet), UJI-KARTU (tabel kartu kehilangan peran tabel) tertangkap 16/16.
- Nina: cek statis di `tests/cek.mjs` (semua `<th>` di HTML & app.js ber-scope, setiap tabel ber-caption, kisi-ubin = ul role="list" berisi li, CSS list-style: none, mode audit & 4 uji balik ada) + 12 uji balik.
- Kirana: tampilan tidak berubah. Usul berikutnya: audit lewati blok (WCAG 2.4.1): tautan "Lewati ke isi" di setiap halaman, tampil saat difokus, dan landmark header/nav/main/footer lengkap.

### Catatan audit: lewati blok WCAG 2.4.1 (Dewi & Nina, 19 Nov 10.xx)
- Alat: `AUDIT=lewati node tools/audit-kontras.js` (ikut audit penuh). 13 halaman/keadaan (beranda, Belajar, pelajaran, pelajaran tidak ada, Peringkat, Radar, profil ANTM, profil tanpa kode, Kabar, Metodologi, Asisten, 404, alamat salah ketik) × gelap/terang × 390/1280px; 312 landmark dibaca dari pohon aksesibilitas peramban.
- Yang diperiksa: Tab pertama jatuh ke "Langsung ke isi", tampil penuh di layar dan tidak tertutup; Enter memindahkan fokus sungguhan ke `<main>`; Tab berikutnya jatuh ke elemen pertama di isi (menu terlewati); tepat satu banner/main/contentinfo; setiap navigation bernama dan namanya tidak kembar.
- **Temuan nyata (52 → 0):** setelah Enter pada "Langsung ke isi", fokus jatuh ke `<body>`, bukan ke `<main>` (Tab berikutnya sudah benar, tetapi pembaca layar tidak langsung membaca isi). Kini `<main id="isi" tabindex="-1">` di 10 halaman, tanpa garis fokus pada main (bukan kontrol). Tampilan tidak berubah (390/1280px, tanpa scroll samping).
- Landmark sudah baik: nav kedua (Pelajaran lain, Lompat ke bagian profil, Isi halaman ini) semuanya bernama dan berbeda dari "Menu utama".
- Uji balik UJI-HAPUS (tautan dihapus), UJI-SASARAN (href ke id tidak ada), UJI-MAIN (main kedua), UJI-NAV (nav tanpa nama), UJI-TABINDEX (main tak bisa difokus) tertangkap 20/20. Audit fokus, tertutup, saat fokus, peran, alt, tabel, teks diulang: tetap 0.
- Nina: cek statis di `tests/cek.mjs` (main id="isi" tabindex="-1", tepat satu header/main/footer per halaman, setiap nav HTML & app.js bernama, CSS, mode audit & 5 uji balik) + 11 uji balik; 3 uji balik lama disesuaikan dengan tag main baru.
- Kirana: tampilan tidak berubah. Usul berikutnya: audit beberapa cara (WCAG 2.4.5): setiap halaman bisa dicapai lewat minimal dua jalan (menu utama, kaki halaman, daftar profil/pencarian kode), termasuk profil emiten dan pelajaran.

### Catatan audit: beberapa cara WCAG 2.4.5 (Dewi & Nina, 19 Nov 13.xx)
- Alat: `AUDIT=cara node tools/audit-kontras.js` (ikut audit penuh). Peramban sungguhan menjelajah situs mulai dari beranda (tautan setelah app.js berjalan, termasuk pencarian kode di Radar: tiap pilihan wajib memunculkan tautan profil). Tujuan: 8 halaman utama + 32 profil emiten + 8 pelajaran (404 dikecualikan karena hasil alamat salah). Jalan dihitung per jenis: menu atas, logo, kaki halaman, pencarian Radar, atau isi halaman lain (tiap halaman sumber = 1 jalan). 390/1280px × gelap/terang.
- **Temuan nyata (8 → 0):** (1) Beranda hanya bisa dicapai lewat logo → kaki semua halaman kini diawali tautan "Beranda". (2) Daftar "Profil semua emiten" hanya ada di kaki → pengantar Peringkat kini menautkannya ("Ingin melihat semua emiten, bukan hanya sepuluh teratas? Buka profil semua emiten."). Tidak ada tautan mati dan tidak ada halaman yatim; rata-rata 4,8 jalan per tujuan.
- Saat dicek di 390px, tautan baru di judul halaman berwarna biru tua di atas latar malam (sulit dibaca). Diperbaiki: `.judul-halaman p a` memakai warna bulan (#e9c46a, kontras 9,35:1), garis bawah tetap.
- Uji balik UJI-KAKI (tautan kaki dibuang), UJI-SATU (tautan Metodologi hanya tersisa di kaki), UJI-MATI (tautan profil di Peringkat ke kode tak dikenal) tertangkap 6/6. Audit konsisten, tautan, label, lewati diulang: tetap 0.
- Nina: cek statis di `tests/cek.mjs` (kaki 10 halaman memuat Beranda/Metodologi/Profil semua emiten/Kabar, isi Peringkat menautkan daftar profil, warna tautan judul halaman, mode audit & 3 uji balik) + 9 uji balik.
- Kirana: tampilan dicek 390/1280px, tanpa scroll samping. Usul berikutnya: audit bantuan konsisten (WCAG 3.2.6): jalan ke bantuan (Asisten AI, Metodologi, kamus istilah) tampil di urutan yang sama di setiap halaman.

### Catatan audit: bantuan konsisten WCAG 3.2.6 (Dewi & Nina, 19 Nov 14.xx)
- Alat: `AUDIT=bantuan node tools/audit-kontras.js` (ikut audit penuh). DOM terender di 11 halaman/keadaan (10 halaman + profil ANTM, pelajaran, 404 dari alamat salah ketik) × gelap/terang × 390/1280px = 110 pemeriksaan halaman. Jalan bantuan yang berulang: **Asisten AI** (menu atas) dan **Metodologi "Cara kami mengolah data"** (kaki halaman). Dicek: ada di setiap halaman, di wilayah yang sama, teks sama; urutan semua tautan menu + kaki sama persis dengan beranda; urutan tampil (atas→bawah, kiri→kanan) sama dengan urutan baca.
- **Hasil: 0 temuan di situs.** Putaran pertama sempat 22 temuan, ternyata salah alat: di 390px tautan "Cara kami mengolah data" terlipat dua baris sehingga kotak gabungannya mulai dari kiri layar. Alat kini membaca kotak baris pertama tautan. Tampilan situs tidak diubah.
- Kamus istilah hanya ada di Belajar (bukan jalan berulang), dan kotak istilah muncul di dalam isi tiap halaman, jadi keduanya di luar cakupan 3.2.6.
- Uji balik UJI-TUKAR (Asisten & Belajar ditukar di Peringkat), UJI-PINDAH (Metodologi dipindah ke menu di Radar), UJI-HILANG (Asisten dihapus di Kabar) tertangkap 6/6.
- Nina: cek statis di `tests/cek.mjs` (urutan menu & kaki 10 halaman sama dengan beranda, Asisten di menu, Metodologi di kaki dengan teks tetap, mode audit & 3 uji balik) + 8 uji balik.
- Kirana: tinjau. Usul berikutnya: audit judul & label deskriptif (WCAG 2.4.6): setiap judul bagian dan label isian (pilih saham Radar, Bandingkan, cari kamus, saring sektor/kabar) menjelaskan isinya, tanpa judul kembar yang membingungkan dalam satu halaman.

### Hasil audit judul & label deskriptif (WCAG 2.4.6) — Dewi & Nina, 19 Nov 15.xx
- Alat: `AUDIT=deskriptif node tools/audit-kontras.js` (ikut audit penuh). 11 halaman/keadaan (beranda, Belajar, pelajaran, Peringkat, Radar UNTR, profil ANTM, daftar profil, Kabar, Metodologi, Asisten, 404) × gelap/terang × 390/1280px: 380 judul dan 78 isian dibaca dari DOM terender.
- **Hasil: 0 temuan di situs.** Label isian sudah jelas: "Cari istilah", "Saring sektor", "Saring jenis kabar", "Ketik kode atau nama emiten", "Atau pilih saham yang Anda pegang", "Bandingkan ANTM dengan", "Pertanyaan Anda"; pilihan kuis dinilai bersama judul soalnya (legend). Tidak ada judul kosong, umum, atau kembar di bawah induk judul yang sama. Tampilan situs tidak diubah.
- Uji balik UJI-LABEL-KOSONG (label pilih saham Radar dikosongkan), UJI-PILIH (label Bandingkan diganti "Pilih"), UJI-KEMBAR (judul pertama Peringkat disalin) tertangkap 6/6.
- Nina: cek statis di `tests/cek.mjs` (6 label isian utama + label kotak ketik tidak umum/kosong, judul HTML statis tidak kosong/umum/kembar, mode audit & 3 uji balik) + 10 uji balik.
- Kirana: tinjau. Catatan: Peringkat hanya punya satu judul (h1) karena isinya satu tabel; masih wajar. Usul berikutnya: audit fokus tidak tertutup (WCAG 2.4.11) khusus daftar saran kotak ketik emiten dan menu HP terbuka.

### Hasil audit fokus tidak tertutup daftar saran & menu HP (WCAG 2.4.11) — Dewi & Nina, 19 Nov 16.xx
- Alat: `AUDIT=saran node tools/audit-kontras.js` (ikut audit penuh). Kotak "Ketik kode atau nama emiten" di Radar dan Bandingkan (profil ANTM) diketik sebagian ("A"/"B", banyak cocok) dan lengkap ("ANTM"/"BRIS", satu cocok), lalu Tab maju & Shift+Tab mundur sampai habis; ditambah beranda & Peringkat untuk menu atas. Gelap/terang × 390/1280px, 2.132 elemen terfokus dicek di 9 titik (penutup = elemen fixed/sticky/absolute).
- **Hasil: 0 temuan di situs, tampilan tidak diubah.** Daftar saran memakai `<datalist>` bawaan peramban: tidak ada elemen melayang buatan halaman yang muncul saat mengetik, dan peramban menutup daftarnya saat fokus pindah. Menu HP tidak punya panel buka-tutup: menu atas selalu tampil di kepala yang tidak lengket, semua tautan terlihat di 390px.
- Batas: tampilan daftar saran bawaan berbeda tiap peramban dan tidak bisa diukur di peramban uji; pengecekan di HP sungguhan tetap di tugas Kirana (Chrome Android, Safari iOS).
- Uji balik UJI-SARAN (daftar saran buatan sendiri 400px yang tetap terbuka) dan UJI-MENU (panel menu fixed 70% layar di HP) tertangkap 6/6.
- Nina: cek statis di `tests/cek.mjs` (kotak ketik memakai datalist, kepala/menu tidak fixed/sticky, tanpa tombol buka-tutup menu, kotak ketik tidak melayang, mode audit & 2 uji balik) + 9 uji balik.
- Kirana: tinjau. Usul berikutnya: audit tampilan fokus (WCAG 2.4.13): garis fokus minimal 2px dan kontras keadaan fokus vs tidak fokus ≥3:1 di semua jenis elemen.

### Hasil audit tampilan fokus (WCAG 2.4.13) — Dewi & Nina, 19 Nov 17.xx
- Alat: `AUDIT=tampilfokus node tools/audit-kontras.js` (ikut audit penuh). Tab sampai habis di 11 halaman/keadaan (beranda, Peringkat, istilah terbuka, Radar UNTR, profil ANTM, Kabar, Belajar, pelajaran dengan kuis terjawab, Metodologi, Asisten, 404) × gelap/terang × 390/1280px. Satu contoh per jenis elemen per halaman (384 contoh): tangkapan layar area elemen saat terfokus dan saat tidak, lalu piksel yang berubah dengan kontras ≥3:1 dihitung; luasnya wajib ≥ garis keliling 2px elemen (tautan terlipat dihitung sebagai satu bentuk, seperti garis fokus Chrome yang menyatu).
- **Temuan nyata (1, diperbaiki):** kotak tanya Asisten memakai border 2px bersudut bulat sebagai tanda fokus; karena sudutnya bulat, luas perubahannya sedikit di bawah syarat (3.344 vs 3.366 piksel di 1280px). Kini ditambah garis 1px warna sama tepat di luar border → tanda fokus 3px, tanpa mengubah tata letak.
- Bukan temuan (alat diperbaiki): pilihan sektor/Bandingkan yang terpotong di tepi bawah layar (alat kini menggulir elemen ke tengah dulu) dan tautan sumber yang terlipat dua-tiga baris (luas wajib kini dihitung dari bentuk gabungan, bukan kotak luar).
- Garis fokus 3px warna --fokus (kuning bulan di bagian biru malam) lolos di semua jenis elemen lain: tautan, tombol, chip, tombol istilah, pilihan, radio kuis, summary, tab.
- Uji balik UJI-TIPIS (garis 1px tanpa jarak) tertangkap 32 dan UJI-MIRIP (warna garis = warna latar) tertangkap 24.
- Nina: cek statis di `tests/cek.mjs` (garis dasar ≥2px var(--fokus), tidak ada aturan fokus <2px, kotak tanya border + garis 1px warna sama, mode audit & 2 uji balik) + 8 uji balik.
- Kirana: tinjau. Usul berikutnya: audit "tahu sedang di mana" (WCAG 2.4.8 Location): penanda halaman aktif di menu atau jejak letak di profil emiten & pelajaran.

### Hasil audit "tahu sedang di mana" (WCAG 2.4.8) — Dewi & Nina, 19 Nov 18.10
- Alat: `AUDIT=letak node tools/audit-kontras.js` (ikut audit penuh). 10 halaman (termasuk pelajaran & profil ANTM) dibuka dengan alamat .html dan alamat bersih seperti di Vercel ("/radar", "/pelajaran?m=…"), mode gelap/terang, 390px & 1280px: 96 halaman/keadaan.
- **Temuan nyata (diperbaiki):** `vercel.json` memakai `cleanUrls`, jadi alamat tayang tanpa ".html". Fungsi `tandaiMenu` di app.js mencocokkan "radar.html", sehingga di situs tayang tanda halaman aktif (tombol putih di menu) tidak pernah muncul; saat diuji lokal tampak benar. Kini akhiran .html dibuang di kedua sisi. Sebelum perbaikan 20 temuan (5 halaman menu × 4 tampilan, alamat bersih), sesudah 0.
- Judul tab dan <h1> semua halaman sudah menyebut letak (pelajaran: "… · Belajar · Candra Analis", profil: "ANTM · …"); halaman di luar menu tidak memberi tanda menu palsu.
- Uji balik UJI-TANPA (tanda dihapus) tertangkap 8 dan UJI-GANDA (semua tautan ditandai) tertangkap 8.
- Nina: cek statis di `tests/cek.mjs` (tandaiMenu membuang .html bila cleanUrls aktif, pelajaran → Belajar, aria-current="page", gaya menu aktif, mode audit, alamat bersih & 2 uji balik) + 8 uji balik.
- Kirana: tinjau. Usul berikutnya: audit keyboard & tanpa jebakan keyboard (WCAG 2.1.1/2.1.2).

### 19 Nov 19.10 — Audit keyboard & tanpa jebakan (WCAG 2.1.1/2.1.2) (Dewi & Nina, ditinjau Kirana)
- `AUDIT=keyboard node tools/audit-kontras.js`: 11 halaman/keadaan (termasuk kotak istilah terbuka), 390/1280px, gelap/terang. Tab maju & Shift+Tab mundur sampai keluar halaman: semua elemen terjangkau, fokus tidak pernah tertahan.
- Elemen dengan pendengar klik yang tidak bisa difokus: 0. Fitur utama dicoba hanya dengan keyboard (pilihan Radar, tab Peringkat dengan panah, istilah Enter/Esc, kuis Spasi/Enter, Bandingkan, salin tautan, saringan Kabar): semua bekerja. Hasil 0 temuan.
- Uji balik UJI-JEBAK (Tab ditahan) tertangkap 8 dan UJI-KLIK (kotak klik tanpa fokus) tertangkap 4. Uji coba tambahan: panah tab Peringkat dimatikan sementara → tertangkap di 4 ukuran.
- Kirana: tinjau. Usul berikutnya: audit pintasan tombol satu huruf (WCAG 2.1.4).
