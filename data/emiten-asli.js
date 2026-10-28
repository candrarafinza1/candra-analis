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
  }
];
