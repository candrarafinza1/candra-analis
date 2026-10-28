/* Kamus istilah di tempat (tim Arif, usulan Kirana #3).
   Teks ditulis sederhana untuk pemula; istilah syariah (DES, ISSI, JII) mengikuti pelajaran
   "Saham syariah dan Daftar Efek Syariah". Setiap penjelasan selaras dengan isi kurikulum di data/modul.js.
   Kolom:
   - istilah   : nama yang tampil di kotak penjelasan
   - pola      : teks yang dicari di halaman (huruf besar-kecil diabaikan bila besarKecil = false)
   - besarKecil: true untuk singkatan (ROE, DER, DES) agar tidak salah cocok
   - arti      : 1–2 kalimat
   - pelajaran : id pelajaran terkait di data/modul.js (boleh kosong) */
window.ISTILAH = [
  { istilah: "ROE (Return on Equity)", pola: ["ROE"], besarKecil: true,
    arti: "Laba bersih setahun dibagi ekuitas, dalam persen. Menunjukkan seberapa efisien perusahaan menghasilkan laba dari modal pemegang saham.",
    pelajaran: "laporan-keuangan" },
  { istilah: "DER (Debt to Equity Ratio)", pola: ["DER"], besarKecil: true,
    arti: "Total liabilitas dibagi ekuitas, dalam kali. DER 2x berarti kewajiban perusahaan dua kali lipat modalnya sendiri.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Laba bersih", pola: ["laba bersih", "laba diatribusikan"],
    arti: "Sisa pendapatan setelah semua biaya dan pajak. Candra Analis memakai laba yang diatribusikan ke pemilik entitas induk, yaitu bagian laba milik pemegang saham perusahaan itu sendiri.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Pendapatan", pola: ["pendapatan"],
    arti: "Nilai penjualan barang atau jasa perusahaan dalam satu periode, sebelum dikurangi biaya. Sering juga disebut penjualan.",
    pelajaran: "laporan-keuangan" },
  { istilah: "YoY (year on year)", pola: ["YoY"], besarKecil: true,
    arti: "Dibandingkan dengan periode yang sama tahun sebelumnya. Contoh: pendapatan 2025 dibanding pendapatan 2024.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Ekuitas", pola: ["ekuitas"],
    arti: "Modal milik pemegang saham, yaitu total aset dikurangi total liabilitas.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Liabilitas", pola: ["liabilitas"],
    arti: "Semua kewajiban yang harus dibayar perusahaan, misalnya utang bank, obligasi, dan utang kepada pemasok.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Tahun buku", pola: ["tahun buku"],
    arti: "Periode 12 bulan yang dicakup satu laporan keuangan tahunan. Untuk kebanyakan emiten sama dengan 1 Januari–31 Desember.",
    pelajaran: "laporan-keuangan" },
  { istilah: "Daftar Efek Syariah (DES)", pola: ["Daftar Efek Syariah", "DES"], besarKecil: true,
    arti: "Daftar saham dan efek lain yang memenuhi prinsip syariah, ditetapkan OJK dan diperbarui tiap akhir Mei dan akhir November. Candra Analis hanya memuat saham yang ada di daftar ini; masuk daftar bukan berarti saham itu disarankan untuk dibeli.",
    pelajaran: "saham-syariah" },
  { istilah: "ISSI (Indeks Saham Syariah Indonesia)", pola: ["ISSI"], besarKecil: true,
    arti: "Indeks yang berisi seluruh saham syariah yang tercatat di Bursa Efek Indonesia.",
    pelajaran: "saham-syariah" },
  { istilah: "JII (Jakarta Islamic Index)", pola: ["JII"], besarKecil: true,
    arti: "Indeks berisi 30 saham syariah yang paling likuid (paling ramai diperdagangkan) di Bursa Efek Indonesia.",
    pelajaran: "saham-syariah" },
  { istilah: "JII70", pola: ["JII70"], besarKecil: true,
    arti: "Indeks berisi 70 saham syariah yang paling likuid di Bursa Efek Indonesia. Cakupannya lebih luas daripada JII.",
    pelajaran: "saham-syariah" },
  { istilah: "Emiten", pola: ["emiten"],
    arti: "Perusahaan yang sahamnya tercatat dan bisa dibeli masyarakat di bursa. Disebut juga perusahaan terbuka.",
    pelajaran: "apa-itu-saham" },
  { istilah: "Dividen", pola: ["dividen"],
    arti: "Bagian laba perusahaan yang dibagikan kepada pemegang saham. Tidak semua perusahaan membagikannya setiap tahun.",
    pelajaran: "apa-itu-saham" },
  { istilah: "RDN (Rekening Dana Nasabah)", pola: ["RDN"], besarKecil: true,
    arti: "Rekening bank khusus atas nama Anda untuk menampung uang transaksi saham. Uang Anda tidak masuk ke rekening sekuritas.",
    pelajaran: "buka-rekening" },
  { istilah: "Lot", pola: ["lot"],
    arti: "Satuan jual beli saham di Bursa Efek Indonesia. 1 lot = 100 lembar saham.",
    pelajaran: "lot-dan-transaksi" }
];
