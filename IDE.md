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
