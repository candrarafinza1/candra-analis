/* KABAR EMITEN — skema Arif, diisi Raka (riset), ditinjau Hana (tanpa ajakan). Mulai 1 Nov 2026.
   Satu entri = satu pengumuman atau aksi korporasi penting dari emiten yang ada di data/emiten-asli.js.

   Aturan (diperiksa tests/cek.mjs):
   - kode: wajib ada di data/emiten-asli.js.
   - tanggal: "YYYY-MM-DD" = tanggal pengumuman/berita sumber, bukan tanggal kami mencatat. Tidak boleh di masa depan.
   - jenis: salah satu dari JENIS di bawah.
   - ringkas: 1–2 kalimat, maksimal 260 karakter, menyebut fakta dari sumber saja. Angka ditulis persis seperti di sumber.
     Dilarang kalimat ajakan atau penilaian ("layak dibeli", "prospek cerah", "saatnya masuk").
   - sumber: { judul, url } dengan url https. Tanpa sumber, jangan dicatat. */
window.KABAR_JENIS = ["Laporan keuangan", "Pembelian kembali saham", "Dividen", "Rapat umum pemegang saham", "Aksi korporasi lain"];

window.KABAR = [
  // Pembelian kembali saham (buyback) — Kontan, 3 Okt 2026
  { kode: "UNTR", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "United Tractors menyiapkan dana hingga Rp2 triliun untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },
  { kode: "KLBF", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "Kalbe Farma menyiapkan dana Rp500 miliar untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },
  { kode: "MBMA", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "Merdeka Battery Materials menyiapkan dana Rp1,38 triliun untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },
  { kode: "HRUM", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "Harum Energy menyiapkan dana Rp120 miliar untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },

  // Laporan keuangan Januari–September 2026 (angka sama dengan data/emiten-asli.js, laba yang diatribusikan ke pemilik entitas induk)
  { kode: "AKRA", tanggal: "2026-10-23", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp2,21 triliun, dibanding Rp1,65 triliun pada periode yang sama 2025.",
    sumber: { judul: "Kontan, 23 Okt 2026: Laba AKR (AKRA) per kuartal III-2026", url: "https://investasi.kontan.co.id/news/laba-akr-akra-melonjak-34-menjadi-rp-221-triliun-per-kuartal-iii-2026" } },
  { kode: "UNVR", tanggal: "2026-10-23", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih Rp4,20 triliun, dibanding Rp3,33 triliun pada periode yang sama 2025.",
    sumber: { judul: "Databoks Katadata, 23 Okt 2026: Penjualan dan laba Unilever Indonesia kuartal III 2026", url: "https://databoks.katadata.co.id/pasar/statistik/6adaae8e7366d/penjualan-dan-laba-unilever-indonesia-unvr-meningkat-pada-kuartal-iii-2026" } },
  { kode: "UNTR", tanggal: "2026-10-27", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp4,47 triliun, dibanding Rp11,48 triliun pada periode yang sama 2025. Menurut Kontan ada pos sekali-waktu sekitar Rp3,5 triliun.",
    sumber: { judul: "Databoks Katadata, 27 Okt 2026: Laba United Tractors kuartal III 2026", url: "https://databoks.katadata.co.id/en/market/statistics/6ae0018520bc5/profit-of-united-tractors-plummeted-by-61-in-the-q3-2026-lowest-level-in-the-past-5-years" } },
  { kode: "SIDO", tanggal: "2026-10-27", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp619,1 miliar, dibanding Rp818,54 miliar pada periode yang sama 2025.",
    sumber: { judul: "IDX Channel, 27 Okt 2026: Sido Muncul catat laba bersih hingga kuartal III-2026", url: "https://www.idxchannel.com/market-news/sido-muncul-sido-catat-laba-bersih-rp619-miliar-hingga-kuartal-iii-2026" } },
  { kode: "ANTM", tanggal: "2026-10-28", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp8,83 triliun, dibanding Rp5,97 triliun pada periode yang sama 2025.",
    sumber: { judul: "Investor Daily, 28 Okt 2026: Laba Antam (ANTM) 9 bulan 2026", url: "https://investor.id/market/459656/laba-antam-antm-loncat-saham-lagi-murahmurahnya" } },
  { kode: "HEAL", tanggal: "2026-10-28", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp303,31 miliar, dibanding Rp356,01 miliar pada periode yang sama 2025.",
    sumber: { judul: "Bisnis, 28 Okt 2026: Hermina (HEAL) cetak laba bersih kuartal III/2026", url: "https://market.bisnis.com/read/20261028/192/2016384/hermina-heal-cetak-laba-bersih-rp30331-miliar-pada-kuartal-iii2026" } },
  { kode: "ISAT", tanggal: "2026-10-28", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp4,92 triliun, dibanding Rp3,56 triliun pada periode yang sama 2025.",
    sumber: { judul: "Investor Daily, 28 Okt 2026: Laba Indosat (ISAT) 9 bulan 2026", url: "https://investor.id/market/459807/laba-indosat-isat-menguat-investasi-tembus-rp-15-triliun" } },
  { kode: "PTBA", tanggal: "2026-10-29", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp4,41 triliun, dibanding Rp1,39 triliun pada periode yang sama 2025.",
    sumber: { judul: "CNBC Indonesia, 29 Okt 2026: Laba Bukit Asam (PTBA) kuartal III-2026", url: "https://www.cnbcindonesia.com/market/20261029132034-17-780560/kuartal-iii-2026-laba-bukit-asam--ptba--melesat-216-jadi-rp441-t" } },
  { kode: "MYOR", tanggal: "2026-10-29", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp2,43 triliun, dibanding Rp1,85 triliun pada periode yang sama 2025.",
    sumber: { judul: "Kontan, 29 Okt 2026: Laba Mayora (MYOR) per kuartal III-2026", url: "https://investasi.kontan.co.id/news/laba-mayora-myor-melesat-3123-menjadi-rp-243-triliun-per-kuartal-iii-2026" } },
  { kode: "TLKM", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk Rp14,44 triliun, dibanding Rp15 triliun pada periode yang sama 2025. Pendapatan Rp113,50 triliun.",
    sumber: { judul: "Investor Daily, 2 Nov 2026: Laba TLKM hingga kuartal III-2026", url: "https://investor.id/market/460258/telkom-tlkm-raup-laba-rp-14-triliun-hingga-kuartal-iii2026" } },
  { kode: "SMGR", tanggal: "2026-11-01", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk Rp532 miliar, dibanding Rp114,84 miliar pada periode yang sama 2025. Pendapatan Rp27,67 triliun.",
    sumber: { judul: "Kontan, 1 Nov 2026: Laba SMGR Januari–September 2026", url: "https://investasi.kontan.co.id/news/semen-indonesia-smgr-bukukan-laba-rp-532-miliar-pada-kuartal-iii-2026" } },
  { kode: "CPIN", tanggal: "2026-10-31", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk Rp5,18 triliun, dibanding Rp3,36 triliun pada periode yang sama 2025. Penjualan neto Rp60,20 triliun.",
    sumber: { judul: "Emiten News, 31 Okt 2026: Laba CPIN Januari–September 2026", url: "https://www.emitennews.com/news/dua-segmen-usaha-cpin-dongkrak-laba-naik-538-persen-ini-rinciannya" } },
  { kode: "INDF", tanggal: "2026-10-30", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik Rp7,87 triliun, dibanding Rp7,88 triliun pada periode yang sama 2025.",
    sumber: { judul: "Kontan, 30 Okt 2026: Pendapatan INDF per kuartal III-2026", url: "https://investasi.kontan.co.id/news/pendapatan-indf-naik-12-jadi-rp-10149-triliun-laba-naik-11-per-kuartal-iii-2026" } },
  { kode: "TPIA", tanggal: "2026-10-30", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih yang diatribusikan ke pemilik US$279,81 juta, dibanding US$1,30 miliar pada periode yang sama 2025 yang memuat keuntungan sekali-waktu dari transaksi Aster.",
    sumber: { judul: "CNBC Indonesia, 30 Okt 2026: Laba Chandra Asri (TPIA) kuartal III-2026", url: "https://www.cnbcindonesia.com/market/20261030112319-17-780872/laba-chandra-asri--tpia--anjlok-78-di-kuartal-iii-2026-ini-sebabnya" } },
  { kode: "PGAS", tanggal: "2026-10-29", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk US$292,95 juta, dibanding US$237,89 juta pada periode yang sama 2025.",
    sumber: { judul: "StockWatch, 29 Okt 2026: Laba PGAS hingga September 2026", url: "https://stockwatch.id/laba-bersih-pgas-naik-173-jadi-usd39725-juta-hingga-september-2026/" } },
  { kode: "BSDE", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk Rp844,70 miliar, dibanding Rp1,36 triliun pada periode yang sama 2025.",
    sumber: { judul: "Receh.in, 2 Nov 2026: Laba BSDE Januari–September 2026", url: "https://www.receh.in/2026/11/laba-bsde-turun-38-residensial-melemah.html" } },
  { kode: "MAPI", tanggal: "2026-10-28", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan ke pemilik entitas induk Rp1,72 triliun, dibanding Rp1,37 triliun pada periode yang sama 2025. Pendapatan bersih Rp37,44 triliun.",
    sumber: { judul: "Databoks Katadata, 28 Okt 2026: Laba MAPI kuartal III 2026", url: "https://databoks.katadata.co.id/pasar/statistik/6ae026957224a/mapi-gaet-laba-rp172-triliun-pada-kuartal-iii-2026-melesat-2516" } }
];
