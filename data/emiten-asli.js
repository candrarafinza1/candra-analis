/* DATA ASLI — dikumpulkan tim Fajar (Data Engineer), diperiksa Hana (Syariah).
   Belum ditampilkan di website sampai minimal 15 emiten lengkap (lihat BACKLOG.md).

   Aturan:
   - desBaris: nomor baris di Daftar Efek Syariah periode I 2026 (KEP-21/D.04/2026,
     berlaku 1 Juni 2026), dikutip verbatim dari https://idx.id/media/nbkfn2sd/des-mei-2026.pdf
   - Angka dalam miliar rupiah. null = belum ditemukan sumbernya. Jangan diisi tebakan.
   - roe & der dihitung dari angka di sumber: roe = labaTahun[2025] ÷ ekuitas 2025,
     der = liabilitas 2025 ÷ ekuitas 2025.
   - catatan: keterangan bila definisi angka berbeda dari biasanya. */
window.EMITEN_ASLI = [
  {
    kode: "TLKM", nama: "PT Telkom Indonesia (Persero) Tbk", sektor: "Infrastruktur",
    desBaris: 580,
    labaTahun: { 2024: 22400, 2025: 17810 },
    pendapatan: { 2024: 149960, 2025: 145740 },
    liabilitas2025: 137220, ekuitas2025: 150530,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Kontan, 12 Mei 2026: Telkom bukukan laba bersih Rp17,81 triliun di 2025",
      url: "https://investasi.kontan.co.id/news/telkom-tlkm-bukukan-laba-bersih-rp-1781-triliun-di-2025" }]
  },
  {
    kode: "KLBF", nama: "PT Kalbe Farma Tbk", sektor: "Kesehatan",
    desBaris: 413,
    labaTahun: { 2024: 3240, 2025: 3660 },
    pendapatan: { 2024: 32630, 2025: 35320 },
    liabilitas2025: 5970, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Investortrust, 31 Mar 2026: Laba Kalbe Farma naik di 2025, penjualan Rp35,32 triliun",
      url: "https://investortrust.id/market/98460/laba-kalbe-farma-klbf-naik-15-3-di-2025-penjualan-tembus-rp35-32-triliun" }]
  },
  {
    kode: "ICBP", nama: "PT Indofood CBP Sukses Makmur Tbk", sektor: "Barang konsumen primer",
    desBaris: 241,
    labaTahun: { 2024: 7080, 2025: 9220 },
    pendapatan: { 2024: 72600, 2025: 74850 },
    liabilitas2025: 61860, ekuitas2025: 73680,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Warta Ekonomi, 31 Mar 2026: ICBP raih penjualan Rp74,85 triliun di 2025",
      url: "https://wartaekonomi.co.id/read606113/produsen-indomie-icbp-raih-penjualan-rp7485-triliun-di-2025-laba-naik-30" }]
  },
  {
    kode: "ANTM", nama: "PT Aneka Tambang Tbk", sektor: "Bahan baku",
    desBaris: 76,
    labaTahun: { 2024: 3850, 2025: 7920 },
    pendapatan: { 2024: 69190, 2025: 84640 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: 210, harga: null,
    catatan: "Laba yang dikutip adalah laba tahun berjalan (termasuk kepentingan nonpengendali). Perlu dicek ulang ke laba yang diatribusikan ke pemilik entitas induk.",
    sumber: [{ judul: "JawaPos, 10 Jun 2026: Laba bersih 2025 melonjak, ANTM tebar dividen Rp5,05 triliun",
      url: "https://www.jawapos.com/bisnis/2606100278/laba-bersih-2025-melonjak-106-persen-antm-tebar-dividen-rp-505-triliun" }]
    },
  {
    kode: "UNTR", nama: "PT United Tractors Tbk", sektor: "Industri",
    desBaris: 199,
    labaTahun: { 2024: 19530, 2025: 14810 },
    pendapatan: { 2024: 134400, 2025: 131300 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [
      { judul: "Kontan, 27 Feb 2026: United Tractors cetak pendapatan bersih Rp131,3 triliun pada 2025",
        url: "https://investasi.kontan.co.id/news/united-tractors-untr-cetak-pendapatan-bersih-rp-1313-triliun-pada-2025" },
      { judul: "Bisnis, 27 Feb 2025: United Tractors cetak laba bersih Rp19,53 triliun 2024",
        url: "https://market.bisnis.com/read/20250227/192/1843194/united-tractors-untr-cetak-laba-bersih-rp1953-triliun-2024" },
      { judul: "Warta Ekonomi, 2025: United Tractors raup pendapatan Rp134,4 triliun (tahun buku 2024)",
        url: "https://wartaekonomi.co.id/read559366/united-tractors-untr-raup-pendapatan-rp1344-triliun-tapi-laba-bersihnya-tertekan" }]
  },
  {
    kode: "INDF", nama: "PT Indofood Sukses Makmur Tbk", sektor: "Barang konsumen primer",
    desBaris: 243,
    labaTahun: { 2024: 8640, 2025: 10680 },
    pendapatan: { 2024: 115790, 2025: 123490 },
    liabilitas2025: 97740, ekuitas2025: 120230,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    catatan: "Sumber menyebut \"laba bersih\" tanpa merinci bagian yang diatribusikan ke pemilik entitas induk.",
    sumber: [{ judul: "Warta Ekonomi, 31 Mar 2026: Indofood kantongi laba Rp10,68 triliun sepanjang 2025",
      url: "https://wartaekonomi.co.id/read606096/indofood-milik-grup-salim-indf-kantongi-laba-rp1068-triliun-sepanjang-2025" }]
  },
  {
    kode: "UNVR", nama: "PT Unilever Indonesia Tbk", sektor: "Barang konsumen primer",
    desBaris: 290,
    labaTahun: { 2024: 3360, 2025: 7640 },
    pendapatan: { 2024: 30620, 2025: 31940 },
    liabilitas2025: 15540, ekuitas2025: 4470,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    catatan: "Laba 2025 naik 126%. Sumber tidak merinci apakah ada keuntungan sekali-waktu; perlu dicek ke laporan keuangan tahunan sebelum dipakai di Peringkat.",
    sumber: [{ judul: "Bisnis, 12 Feb 2026: Laba Unilever melonjak 126% jadi Rp7,64 triliun sepanjang 2025",
      url: "https://market.bisnis.com/read/20260212/192/1952314/laba-unilever-unvr-melonjak-126-jadi-rp764-triliun-sepanjang-2025" }]
  },
  {
    kode: "PTBA", nama: "PT Bukit Asam (Persero) Tbk", sektor: "Energi",
    desBaris: 50,
    labaTahun: { 2024: 5100, 2025: 2930 },
    pendapatan: { 2024: 42760, 2025: 42650 },
    liabilitas2025: 21300, ekuitas2025: 22610,
    laba9b: { 2025: null, 2026: null },
    dps: 114, harga: null,
    catatan: "Ekuitas 2025 disebut sumber sebagai angka kisaran. Dividen Rp114 per saham disebut \"kisaran\" (total Rp1,32 triliun, 45% laba 2025).",
    sumber: [
      { judul: "Kabar Bursa, 2 Apr 2026: Laba bersih 2025 tergerus, bos PTBA langsung pasang target",
        url: "https://www.kabarbursa.com/market-hari-ini/laba-bersih-2025-tergerus-bos-ptba-langsung-pasang-target" },
      { judul: "JawaPos, 12 Jun 2026: Cetak laba Rp2,93 T, Bukit Asam tebar dividen Rp114 per saham",
        url: "https://jawapos.com/bisnis/2606110334/cetak-laba-rp-293-t-bukit-asam-tebar-dividen-rp-114-per-saham" }]
  },
  {
    kode: "MYOR", nama: "PT Mayora Indah Tbk", sektor: "Barang konsumen primer",
    desBaris: 259,
    labaTahun: { 2024: null, 2025: 2860 },
    pendapatan: { 2024: 36070, 2025: 38680 },
    liabilitas2025: 13010, ekuitas2025: 18360,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    catatan: "Laba 2024 hanya ditulis dibulatkan (Rp3 triliun) di sumber, jadi dibiarkan kosong sampai ada angka persis.",
    sumber: [{ judul: "Emiten News, 18 Mar 2026: Mayora raup laba Rp2,86 triliun, menciut 4,66 persen",
      url: "https://emitennews.com/news/mayora-myor-raup-laba-286-triliun-menciut-466-persen" }]
  },
  {
    kode: "SIDO", nama: "PT Industri Jamu Dan Farmasi Sido Muncul Tbk", sektor: "Kesehatan",
    desBaris: 432,
    labaTahun: { 2024: 1170, 2025: 1220 },
    pendapatan: { 2024: 3910, 2025: 4070 },
    liabilitas2025: 561.44, ekuitas2025: 3120,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    catatan: "Sumber menulis liabilitas \"Rp561,44 triliun\"; dibaca sebagai Rp561,44 miliar karena total aset hanya Rp3,68 triliun dan ekuitas Rp3,12 triliun.",
    sumber: [{ judul: "Bisnis, 28 Feb 2026: Sido Muncul cetak laba bersih Rp1,22 triliun pada 2025",
      url: "https://market.bisnis.com/read/20260228/192/1956569/sido-muncul-sido-cetak-laba-bersih-rp122-triliun-pada-2025-naik-dari-2024" }]
  },
  {
    kode: "CPIN", nama: "PT Charoen Pokphand Indonesia Tbk", sektor: "Barang konsumen primer",
    desBaris: 220,
    labaTahun: { 2024: 3710, 2025: 5640 },
    pendapatan: { 2024: 67470, 2025: 70700 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Kontan Insight, 9 Apr 2026: Pakan ternak menopang laba Charoen Pokphand pada 2025",
      url: "https://insight.kontan.co.id/news/pakan-ternak-menopang-laba-charoen-pokphand-cpin-pada-2025" }]
  },
  {
    kode: "JPFA", nama: "PT Japfa Comfeed Indonesia Tbk", sektor: "Barang konsumen primer",
    desBaris: 246,
    labaTahun: { 2024: 3010, 2025: 4000 },
    pendapatan: { 2024: 55800, 2025: 60710 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Investortrust, 1 Mar 2026: Laba bersih Japfa melonjak 33,33% di 2025",
      url: "https://investortrust.id/market/95824/laba-bersih-japfa-jpfa-melonjak-33-33-di-2025-ini-jadi-penopangnya" }]
  },
  {
    kode: "INTP", nama: "PT Indocement Tunggal Prakarsa Tbk", sektor: "Bahan baku",
    desBaris: 108,
    labaTahun: { 2024: 2010, 2025: 2250 },
    pendapatan: { 2024: 18550, 2025: 17730 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    catatan: "Laba 2025 ikut ditopang keuntungan sekali-waktu dari penjualan 60% bisnis mortar (Des 2025).",
    sumber: [{ judul: "Investortrust, 2 Apr 2026: Indocement cetak kenaikan laba 12% di 2025, ditopang divestasi aset",
      url: "https://investortrust.id/market/98742/indocement-intp-cetak-kenaikan-laba-12-di-2025-ditopang-divestasi-aset" }]
  },
  {
    kode: "SMGR", nama: "PT Semen Indonesia (Persero) Tbk", sektor: "Bahan baku",
    desBaris: 136,
    labaTahun: { 2024: 719.76, 2025: 190.84 },
    pendapatan: { 2024: 36180, 2025: 35240 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: null, harga: null,
    sumber: [{ judul: "Investortrust, 2026: Laba bersih Semen Indonesia anjlok 76,8% di 2025",
      url: "https://www.investortrust.id/market/98479/laba-bersih-semen-indonesia-smgr-anjlok-76-8-di-2025-ini-pemicunya" }]
  },
  {
    kode: "AKRA", nama: "PT AKR Corporindo Tbk", sektor: "Energi",
    desBaris: 12,
    labaTahun: { 2024: null, 2025: 2470 },
    pendapatan: { 2024: null, 2025: 46020 },
    liabilitas2025: null, ekuitas2025: null,
    laba9b: { 2025: null, 2026: null },
    dps: 100, harga: null,
    catatan: "Dividen tahun buku 2025 = interim Rp50 + final Rp50. Angka 2024 belum dimasukkan: sumber lain menyebut laba 2024 Rp2,39 triliun, tidak cocok dengan kenaikan 11% yang dilaporkan, jadi perlu dicek ke laporan resmi.",
    sumber: [{ judul: "Katadata, 27 Apr 2026: AKRA sepakat bagi dividen Rp1,98 triliun",
      url: "https://katadata.co.id/finansial/bursa/69ef175cc3f38/akra-sepakat-bagi-dividen-rp-1-98-triliun-umumkan-perubahan-direksi" }]
  }
];
