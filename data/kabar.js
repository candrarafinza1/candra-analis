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
  // Dividen interim AADI tahun buku 2026 — Investortrust 25 Nov 2026; total, jadwal & kurs sama di StockWatch 25 Nov dan Kontan (di TradingView);
  // Kontan: dividen per saham belum diumumkan (Raka + Fajar, ditinjau Hana, 27 Nov 13.xx)
  { kode: "AADI", tanggal: "2026-11-25", jenis: "Dividen",
    ringkas: "Adaro Andalan Indonesia membagikan dividen interim tahun buku 2026 sebesar US$500 juta; dividen per saham belum diumumkan. Dibayar dalam rupiah dengan kurs tengah BI 7 Desember 2026. Cum date 3 Desember, pembayaran 11 Desember 2026.",
    sumber: { judul: "Investortrust, 25 Nov 2026: Adaro Andalan (AADI) tebar dividen interim US$ 500 juta, cek jadwal berikut", url: "https://investortrust.id/market/123672/adaro-andalan-aadi-tebar-dividen-interim-us-500-juta-cek-jadwal-berikut" } },
  // Laporan 9 bulan BRIS — Investortrust, 24 Nov 2026; angka sama di Katadata, Infobanknews, Warta Ekonomi 24 Nov 2026 (Raka, ditinjau Hana)
  { kode: "BRIS", tanggal: "2026-11-24", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Bank Syariah Indonesia mencatat laba bersih Rp6,13 triliun, tumbuh 10,02% dari Rp5,57 triliun pada periode yang sama 2025 (Bisnis.com, 29 Okt 2025).",
    sumber: { judul: "Investortrust, 24 Nov 2026: Laba bersih BSI (BRIS) naik 10,2% jadi Rp6,13 triliun di kuartal III 2026", url: "https://investortrust.id/financial/123522/laba-bersih-bsi-bris-naik-10-2-jadi-rp-6-13-triliun-di-kuartal-iii-2026" } },
  // Laporan 9 bulan KLBF — Investortrust, 13 Nov 2026; angka sama di ringkasan Quartr 30 Okt 2026 (Raka, ditinjau Hana); istilah "diatribusikan" dari Quartr (Sari + Hana, 23 Nov 20.xx)
  { kode: "KLBF", tanggal: "2026-11-13", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan kepada pemilik entitas induk Rp2,74 triliun, tumbuh 4% dari Rp2,63 triliun pada periode yang sama 2025 (BCA Sekuritas, 27 Okt 2025).",
    sumber: { judul: "Investortrust, 13 Nov 2026: Prospek dan target harga saham Kalbe (KLBF) direvisi naik, intip katalis ini", url: "https://investortrust.id/market/122429/prospek-dan-target-harga-saham-kalbe-klbf-direvisi-naik-intip-katalis-ini" } },
  // Laporan 9 bulan MBMA — Investor Daily, 20 Nov 2026; angka sama di Investortrust 21 Nov 2026 (Raka, ditinjau Hana)
  { kode: "MBMA", tanggal: "2026-11-20", jenis: "Laporan keuangan",
    ringkas: "Merdeka Battery Materials mencatat laba yang diatribusikan kepada pemilik entitas induk US$146 juta pada Januari–September 2026, dibandingkan US$25 juta pada periode yang sama 2025. Pendapatan naik 90% menjadi US$1,78 miliar.",
    sumber: { judul: "Investor Daily, 20 Nov 2026: Cuan nikel mengalir deras, laba MBMA melonjak 484%", url: "https://investor.id/market/462771/cuan-nikel-mengalir-deras-laba-mbma-melonjak-484" } },
  // Laporan 9 bulan MDKA — SWA, 20 Nov 2026; angka sama di Investor Daily 21 Nov 2026 (Raka, ditinjau Hana)
  { kode: "MDKA", tanggal: "2026-11-20", jenis: "Laporan keuangan",
    ringkas: "Merdeka Copper Gold mencatat laba yang diatribusikan kepada pemilik entitas induk US$157 juta pada Januari–September 2026, berbalik dari rugi US$35 juta pada periode yang sama 2025. Pendapatan naik 76% menjadi sekitar US$2,3 miliar.",
    sumber: { judul: "SWA, 20 Nov 2026: MDKA berbalik laba US$157 juta, ditopang bisnis nikel dan emas", url: "https://swa.co.id/read/479889/mdka-berbalik-laba-us157-juta-ditopang-bisnis-nikel-dan-emas" } },
  // Laporan 9 bulan EXCL — EmitenNews, 18 Nov 2026; angka sama di Databoks 19 Nov 2026 (Raka, ditinjau Hana)
  { kode: "EXCL", tanggal: "2026-11-18", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. XLSmart masih mencatat rugi yang diatribusikan kepada pemilik entitas induk Rp1,60 triliun, menyusut dari rugi Rp2,60 triliun pada periode yang sama 2025.",
    sumber: { judul: "EmitenNews, 18 Nov 2026: EXCL catat perbaikan kinerja, pendapatan Q3 2026 tembus Rp35,7 triliun", url: "https://emitennews.com/news/excl-catat-perbaikan-kinerja-pendapatan-q3-2026-tembus-rp357-triliun" } },
  // Laporan 9 bulan HRUM — Kontan, 6 Nov 2026 (Raka, ditinjau Hana)
  { kode: "HRUM", tanggal: "2026-11-06", jenis: "Laporan keuangan",
    ringkas: "Harum Energy mencatat laba tahun berjalan yang diatribusikan kepada pemilik entitas induk US$70,74 juta pada Januari–September 2026, naik 89,63% dari US$37,31 juta pada periode yang sama 2025.",
    sumber: { judul: "Kontan Insight, 6 Nov 2026: Bedah prospek HRUM: lonjakan laba, beban sulfur, tekanan MHP", url: "https://insight.kontan.co.id/news/bedah-prospek-hrum-lonjakan-laba-beban-sulfur-tekanan-mhp-dan-rekomendasi-saham" } },
  // Laporan 9 bulan ITMG — Fortune IDN, 11 Nov 2026 (Raka, ditinjau Hana); istilah "diatribusikan" dari IDX Channel 12 Nov 2026: atribusi US$163 juta, laba periode berjalan US$168 juta (Sari + Hana, 23 Nov 20.xx)
  { kode: "ITMG", tanggal: "2026-11-11", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba yang diatribusikan kepada pemilik entitas induk US$162,93 juta, naik dari US$130,59 juta pada periode yang sama 2025. IDX Channel menulis pendapatan US$1,60 miliar, naik 17%.",
    sumber: { judul: "Fortune IDN, 11 Nov 2026: Produksi dan harga batu bara dongkrak laba ITMG 24,7% hingga Q3 2026", url: "https://www.fortuneidn.com/market/produksi-dan-harga-batu-bara-dongkrak-laba-itmg-24-7-hingga-q3-2026-00-3dhnm-h3zhhy" } },
  // Laporan 9 bulan AADI — depok24jam, 2 Nov 2026
  { kode: "AADI", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Adaro Andalan Indonesia merilis laporan Januari–September 2026: laba yang diatribusikan kepada pemilik entitas induk US$683,34 juta, naik dari US$587,32 juta. Pendapatan usaha US$3,96 miliar, naik 9,70%.",
    sumber: { judul: "depok24jam, 2 Nov 2026: Laba Adaro Andalan Indonesia (AADI) naik 16% kuartal III 2026", url: "https://www.depok24jam.com/2026/11/02/laba-adaro-andalan-indonesia-aadi-kuartal-iii-2026/" } },
  // Laporan 9 bulan ACES — IDX Channel, 2 Nov 2026; angka 2026 sama di Fortune IDN 2 Nov 2026; pembanding 2025 dari Bisnis 1 Nov 2025 (Sari + Hana, 23 Nov 18.xx)
  { kode: "ACES", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Aspirasi Hidup Indonesia merilis laporan Januari–September 2026: laba yang diatribusikan kepada pemilik entitas induk Rp604,7 miliar, tumbuh 25,7% dari Rp481,09 miliar pada periode yang sama 2025 (Bisnis, 1 Nov 2025). Penjualan bersih Rp6,9 triliun, naik 8,3%.",
    sumber: { judul: "IDX Channel, 2 Nov 2026: ACES cetak laba bersih Rp604,7 miliar hingga kuartal III-2026", url: "https://www.idxchannel.com/market-news/aces-cetak-laba-bersih-rp6047-miliar-hingga-kuartal-iii-2026-tumbuh-26-persen" } },
  // Laporan 9 bulan INTP — IDX Channel, 4 Nov 2026 (Raka, ditinjau Hana)
  { kode: "INTP", tanggal: "2026-11-04", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih Rp1,30 triliun, naik sekitar 22% dibanding Rp1,06 triliun pada periode yang sama 2025. Pendapatan neto Rp14,07 triliun, naik 8,9%.",
    sumber: { judul: "IDX Channel, 4 Nov 2026: Indocement (INTP) cetak laba bersih Rp1,3 triliun hingga kuartal III-2026, tumbuh 22 persen", url: "https://www.idxchannel.com/market-news/indocement-intp-cetak-laba-bersih-rp13-triliun-hingga-kuartal-iii-2026-tumbuh-22-persen" } },
  // Laporan 9 bulan JPFA — Kontan, 2 Nov 2026 (Raka, ditinjau Hana)
  { kode: "JPFA", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Laporan Januari–September 2026 terbit. Laba bersih Rp3,23 triliun, naik 34% dibanding Rp2,41 triliun pada periode yang sama 2025. Pendapatan Rp54,53 triliun, naik 26%.",
    sumber: { judul: "Kontan, 2 Nov 2026: Segmen DOC dan livebird topang kinerja Japfa (JPFA) di tengah tekanan beban bunga", url: "https://investasi.kontan.co.id/news/segmen-doc-dan-livebird-topang-kinerja-japfa-jpfa-di-tengah-tekanan-beban-bunga" } },
  // Dividen interim JPFA tahun buku 2026 — BCA Sekuritas & Kontan, 28 Okt 2026 (Raka, ditinjau Hana)
  { kode: "JPFA", tanggal: "2026-10-28", jenis: "Dividen",
    ringkas: "Japfa Comfeed Indonesia menetapkan dividen interim tahun buku 2026 sebesar Rp90 per saham, total Rp1.052.780.364.090. Tanggal pencatatan 9 November 2026, pembayaran 12 November 2026.",
    sumber: { judul: "BCA Sekuritas, 28 Okt 2026: JPFA akan bagikan dividen interim Rp90 per saham (tahun buku 2026) pada 12 November 2026", url: "https://bcasekuritas.co.id/latest-news/news/jpfa-akan-bagikan-dividen-interim-12-november-2026" } },
  // Dividen interim SIDO tahun buku 2026 — Kontan 23 Okt 2026; Rp300 miliar, Rp10 per saham, pencatatan 4 Nov & bayar 20 Nov sama di EmitenNews & Katadata 23 Okt 2026
  // (Katadata menulis "10 per saham" tanpa "Rp"; yield Kontan tidak ditulis karena bergantung harga) (Raka + Fajar, ditinjau Hana, 28 Nov 08.xx)
  { kode: "SIDO", tanggal: "2026-10-23", jenis: "Dividen",
    ringkas: "Sido Muncul membagikan dividen interim tahun buku 2026 sebesar Rp300 miliar atau Rp10 per saham. Tanggal pencatatan 4 November 2026, pembayaran 20 November 2026.",
    sumber: { judul: "Kontan, 23 Okt 2026: Sido Muncul (SIDO) bagikan dividen interim Rp 300 miliar, cek jadwalnya", url: "https://investasi.kontan.co.id/news/sido-muncul-sido-bagikan-dividen-interim-rp-300-miliar-cek-jadwalnya" } },
  // Dividen interim ITMG tahun buku 2026 — Fortune IDN 13 Nov 2026; Rp1.286,83 sama di Katadata 13 Nov 2026, tanggal sama di Kontan 3 Nov 2026 (Raka + Fajar, ditinjau Hana, 24 Nov 09.xx)
  // Cek tanggal bayar 27 Nov 19.xx (Fajar + Raka): pencatatan 12 Nov & bayar 18 Nov sama di Fortune 13 Nov, Kontan 3 Nov, dan Katadata 3 Nov ("14 Emiten Tebar Dividen November");
  // EmitenNews 4 Nov (bayar 23 Nov) dianggap menyimpang, kabar tidak diubah. Angka Rp1.191,09 di Katadata 3 Nov (sebelum penetapan) tidak dipakai.
  { kode: "ITMG", tanggal: "2026-11-13", jenis: "Dividen",
    ringkas: "Indo Tambangraya Megah menetapkan dividen interim tahun buku 2026 sebesar Rp1.286,83 per saham. Tanggal pencatatan 12 November 2026, pembayaran 18 November 2026.",
    sumber: { judul: "Fortune IDN, 13 Nov 2026: ITMG tetapkan dividen interim Rp1.286,83 per saham", url: "https://www.fortuneidn.com/market/itmg-tetapkan-dividen-interim-rp1-286-83-per-saham-00-3dhnm-6jq0tx" } },
  // Buyback ITMG 2026 — EmitenNews 4 Nov 2026; nilai Rp2,31 T & batas 20% sama di BCA Sekuritas 5 Nov 2026 (BCA menulis akhir "4 Februari 2026", diduga salah ketik);
  // Bisnis 4 Nov gagal dibuka alat tim; program 2025 Rp2,49 T (Kontan 4 Nov 2025) tidak dicampur (Raka, ditinjau Hana, 27 Nov 18.xx)
  { kode: "ITMG", tanggal: "2026-11-04", jenis: "Pembelian kembali saham",
    ringkas: "Indo Tambangraya Megah menyiapkan dana hingga Rp2,31 triliun dari kas internal untuk membeli kembali sahamnya sendiri (buyback), maksimal 20% dari modal disetor, dalam kondisi pasar yang berfluktuasi signifikan. Jadwal 4 November 2026–4 Februari 2027.",
    sumber: { judul: "EmitenNews, 4 Nov 2026: Selain dividen, emiten tambang batu bara termal ini buyback jumbo", url: "https://emitennews.com/news/selain-dividen-emiten-tambang-batu-bara-termal-ini-buyback-jumbo" } },
  // Penghentian buyback HRUM — EmitenNews 16 Nov 2026; tanggal efektif, dana & periode sama di BCA Sekuritas 17 Nov 2026 (IQPlus).
  // Realisasi pembelian tidak disebut kedua sumber → tidak ditulis (Raka, ditinjau Hana, 27 Nov 19.xx)
  { kode: "HRUM", tanggal: "2026-11-16", jenis: "Pembelian kembali saham",
    ringkas: "Harum Energy menghentikan buyback mulai 17 November 2026, lebih awal dari jadwal semula 28 September–24 Desember 2026 (dana maksimal Rp120 miliar). Alasan perseroan: rencana restrukturisasi internal oleh pemegang saham pengendali.",
    sumber: { judul: "EmitenNews, 16 Nov 2026: Harum Energy (HRUM) stop rencana buyback saham", url: "https://emitennews.com/news/harum-energy-hrum-stop-rencana-buyback-saham" } },
  // Realisasi buyback TPIA s/d 2 Nov 2026 — EmitenNews 2 Nov 2026; angka sama di BCA Sekuritas 3 Nov 2026 (Raka + Fajar, ditinjau Hana, 27 Nov 18.xx)
  { kode: "TPIA", tanggal: "2026-11-02", jenis: "Pembelian kembali saham",
    ringkas: "Chandra Asri Pacific telah membeli kembali 378.428.200 lembar sahamnya senilai Rp518,2 miliar hingga 2 November 2026, dari dana yang disiapkan hingga Rp2 triliun. Program dilanjutkan hingga 28 Januari 2027.",
    sumber: { judul: "EmitenNews, 2 Nov 2026: Realisasi buyback saham 4 emiten Pak PP Rp830M hingga awal November", url: "https://emitennews.com/news/realisasi-buyback-saham-4-emiten-pak-pp-rp830m-hingga-awal-november" } },
  // RUPS Luar Biasa TLKM 30 Sep 2026 — Katadata 1 Okt 2026; tanggal rapat, persetujuan pemisahan ke InfraNexia & Direktur Utama sama di BCA Sekuritas (IQPlus) 1 Okt 2026
  // (Bisnis 9 & 30 Sep tidak bisa dibuka alat tim) (Raka, ditinjau Hana, 28 Nov 09.xx)
  { kode: "TLKM", tanggal: "2026-10-01", jenis: "Rapat umum pemegang saham",
    ringkas: "RUPSLB Telkom 30 September 2026 menyetujui pemisahan bisnis dan aset fiber grosir ke PT Telkom Infrastruktur Indonesia (InfraNexia), nilai transaksi sekitar Rp85,7 triliun, serta perubahan pengurus dengan Nanang Hendarno sebagai Direktur Utama.",
    sumber: { judul: "Katadata, 1 Okt 2026: RUPSLB Telkom 2026 setujui spin-off InfraCo dan perubahan direksi", url: "https://katadata.co.id/finansial/korporasi/6abe21bd934e5/rupslb-telkom-2026-setujui-spin-off-infraco-dan-perubahan-direksi" } },
  // Kebijakan dividen TLKM tahun buku 2026 — Kontan 7 Sep 2026; rentang 60–90% & dividen setelah tahun buku sama di BCA Sekuritas (IQPlus) 7 Sep 2026 (Raka + Fajar, ditinjau Hana, 28 Nov 09.xx)
  { kode: "TLKM", tanggal: "2026-09-07", jenis: "Dividen",
    ringkas: "Telkom tidak membagikan dividen interim dari kinerja semester I 2026. Dividen tunai akan diputuskan RUPS setelah tahun buku berakhir, dengan rasio pembagian 60–90% dari laba bersih tahun buku 2026.",
    sumber: { judul: "Kontan, 7 Sep 2026: Telkom (TLKM) absen bagi dividen interim, ini alasannya", url: "https://investasi.kontan.co.id/news/telkom-tlkm-absen-bagi-dividen-interim-ini-alasannya" } },
  // RUPS Luar Biasa UNTR 9 Nov 2026 — Investortrust 9 Nov 2026 (Bisnis 9 Nov tidak bisa dibuka alat tim) (Raka, ditinjau Hana, 27 Nov 17.xx)
  { kode: "UNTR", tanggal: "2026-11-09", jenis: "Rapat umum pemegang saham",
    ringkas: "RUPSLB United Tractors 9 November 2026 menyetujui penghapusan 238,79 juta saham treasuri hasil buyback (6,4% dari modal ditempatkan dan disetor) serta mengangkat Irwandy Arif sebagai komisaris independen dan Christopher Suprayogie Ganis sebagai komisaris.",
    sumber: { judul: "Investortrust, 9 Nov 2026: UNTR setujui penghapusan 238,79 juta saham treasuri hasil buyback, ini dampaknya", url: "https://investortrust.id/market/121985/untr-setujui-penghapusan-238-79-juta-saham-treasuri-hasil-buyback-ini-dampaknya" } },
  // Dividen interim UNTR tahun buku 2026 — BCA Sekuritas 28 Okt 2026; jadwal sama di Pasardana 28 Okt 2026 (jadwal lama: bayar 26 Okt, diundur; EmitenNews) (Raka + Fajar, ditinjau Hana, 24 Nov 09.xx)
  { kode: "UNTR", tanggal: "2026-10-28", jenis: "Dividen",
    ringkas: "United Tractors membagikan dividen interim tahun buku 2026 sebesar Rp430 per saham (sekitar Rp1,478 triliun). Jadwal pembayaran diundur dari 26 Oktober menjadi 23 November 2026, tanggal pencatatan 9 November 2026.",
    sumber: { judul: "BCA Sekuritas, 28 Okt 2026: UNTR akan bagikan dividen interim Rp430 per saham pada 23 November 2026", url: "https://bcasekuritas.co.id/latest-news/news/untr-akan-bagikan-dividen-interim-23-november-2026" } },
  // Dividen interim I BSSR tahun buku 2026 — EmitenNews 21 Sep 2026; Rp406 per saham & jadwal sama di KabarBursa 22 Sep 2026; total US$60 juta sama di Kontan 23 Sep 2026 (Raka + Fajar, ditinjau Hana, 25 Nov 10.xx)
  { kode: "BSSR", tanggal: "2026-09-21", jenis: "Dividen",
    ringkas: "Baramulti Suksessarana menetapkan dividen interim I tahun buku 2026 sebesar US$60 juta, atau Rp406,16090 per saham. Tanggal pencatatan 1 Oktober 2026, pembayaran 9 Oktober 2026.",
    sumber: { judul: "EmitenNews, 21 Sep 2026: Baramulti (BSSR) tebar dividen interim Rp406 per saham, cek jadwalnya", url: "https://emitennews.com/news/baramulti-bssr-tebar-dividen-interim-rp406-per-saham-cek-jadwalnya" } },
  // Laporan 9 bulan CTRA — Kontan, 1 Nov 2026; Rp1,32 T vs Rp1,62 T & pendapatan Rp7,48 T vs Rp8,39 T sama di Katadata 16 Nov 2026 (Sari + Hana, 23 Nov 18.xx)
  { kode: "CTRA", tanggal: "2026-11-01", jenis: "Laporan keuangan",
    ringkas: "Ciputra Development merilis laporan Januari–September 2026: laba bersih Rp1,32 triliun, turun 18,5% dari Rp1,62 triliun pada periode yang sama 2025 (Katadata, 16 Nov 2026). Penjualan dan pendapatan usaha Rp7,48 triliun, turun 10,79% dari Rp8,39 triliun.",
    sumber: { judul: "Kontan, 1 Nov 2026: Laba Ciputra Development (CTRA) susut jadi Rp1,32 triliun di kuartal III-2026", url: "https://investasi.kontan.co.id/news/laba-ciputra-development-ctra-susut-jadi-rp-132-triliun-di-kuartal-iii-2026" } },
  // Laporan 9 bulan ICBP — Fortune IDN, 2 Nov 2026 (angka sama dengan laba9b; IDX Channel 30 Okt menulis Rp6,1 T vs Rp7,1 T, pembulatan). Sari + Hana, 21 Nov 19.xx
  { kode: "ICBP", tanggal: "2026-11-02", jenis: "Laporan keuangan",
    ringkas: "Indofood CBP merilis laporan Januari–September 2026: laba yang diatribusikan kepada pemilik entitas induk Rp6,16 triliun, dibandingkan Rp7,10 triliun pada periode yang sama 2025. Penjualan naik 15%.",
    sumber: { judul: "Fortune IDN, 2 Nov 2026: Penjualan ICBP naik 15%, laba Rp6,16 triliun hingga September 2026", url: "https://www.fortuneidn.com/business/penjualan-icbp-naik-15-biaya-produksi-tekan-margin-00-4pj81-1dd5zr" } },
  // Realisasi buyback UNTR 1 Jul–30 Sep 2026 + program 1 Okt–31 Des 2026 — EmitenNews 9 Okt 2026 (keterbukaan BEI 8 Okt);
  // jumlah saham & nilai sama di IDX Channel lewat RCTI+ 1 Okt 2026 (Raka + Fajar, ditinjau Hana, 27 Nov 20.xx)
  { kode: "UNTR", tanggal: "2026-10-09", jenis: "Pembelian kembali saham",
    ringkas: "United Tractors membeli kembali 57.974.100 saham senilai Rp1,42 triliun pada 1 Juli–30 September 2026 (71,2% dari anggaran Rp2,0 triliun). Program berikutnya berjalan 1 Oktober–31 Desember 2026 dengan dana Rp2,0 triliun dari kas internal.",
    sumber: { judul: "EmitenNews, 9 Okt 2026: United Tractors (UNTR) gunakan kas internal Rp5,6T buyback saham", url: "https://emitennews.com/news/united-tractors-untr-gunakan-kas-internal-rp56t-buyback-saham" } },
  // Pembelian kembali saham (buyback) — Kontan, 3 Okt 2026
  { kode: "UNTR", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "United Tractors menyiapkan dana hingga Rp2 triliun untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },
  { kode: "KLBF", tanggal: "2026-10-03", jenis: "Pembelian kembali saham",
    ringkas: "Kalbe Farma menyiapkan dana Rp500 miliar untuk membeli kembali sahamnya sendiri (buyback).",
    sumber: { judul: "Kontan, 3 Okt 2026: Buyback saham ramai jelang akhir 2026", url: "https://investasi.kontan.co.id/news/buyback-saham-ramai-jelang-akhir-2026-ini-emiten-yang-jadi-sorotan-analis" } },
  // Jadwal buyback KLBF — Kontan 16 Sep 2026; jadwal awal 16 Sep–16 Des & dana hingga Rp500 M sama di IDX Channel lewat RCTI+ 15 Sep 2026
  // (rencana awal ditarik beberapa jam kemudian). Realisasi belum ada sumber (Raka + Fajar, ditinjau Hana, 27 Nov 21.xx)
  { kode: "KLBF", tanggal: "2026-09-16", jenis: "Pembelian kembali saham",
    ringkas: "Kalbe Farma menjadwalkan pembelian kembali saham pada 17 September–17 Desember 2026 dengan dana hingga Rp500 miliar dari kas internal, tanpa RUPS. Rencana awal 16 September–16 Desember 2026 sempat ditarik beberapa jam setelah diumumkan.",
    sumber: { judul: "Kontan, 16 Sep 2026: Ubah jadwal, Kalbe Farma (KLBF) bakal buyback Rp500 miliar", url: "https://investasi.kontan.co.id/news/ubah-jadwal-kalbe-farma-klbf-bakal-buyback-rp-500-miliar" } },
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
