/* AGENDA IPO & DIVIDEN — skema Arif, riset Raka, cek angka Fajar, cek syariah Hana. Mulai 19 Nov 2026.
   Proyek prioritas dari Rafinza. Diperbarui setiap hari (sesi 07.xx dan 13.xx): tambah yang baru,
   perbarui tanggal yang berubah, hapus acara yang sudah lewat lebih dari 14 hari.

   Aturan umum (diperiksa tests/cek.mjs):
   - Tanggal ditulis "YYYY-MM-DD". Tanggal yang belum diumumkan = null.
   - Setiap entri punya sumber: [{ judul, url }] dengan url https. Angka & tanggal ditulis persis seperti di sumber.
   - Bahasa netral. Dilarang kalimat ajakan ("buruan beli sebelum cum date", "jangan sampai ketinggalan",
     "IPO pasti untung", dan sejenisnya). Agenda adalah jadwal, bukan saran membeli atau menjual.

   window.AGENDA_IPO = [{
     nama,                 // nama perusahaan sesuai prospektus
     kode,                 // kode saham rencana, boleh null
     sektor,
     buktiSyariah: { judul, url },   // WAJIB: prospektus / e-IPO / OJK yang menyebut sahamnya efek syariah.
                                     // Tanpa bukti ini, IPO TIDAK dicatat (aturan Hana).
     tanggal: { penawaranAwal: { mulai, selesai }, penawaranUmum: { mulai, selesai }, penjatahan, pencatatan },
     harga: { kisaranBawah, kisaranAtas, final },   // rupiah per saham; null bila belum ada
     sumber: [{ judul, url }]
   }]

   window.AGENDA_DIVIDEN = [{
     kode,                 // kode saham, wajib tercatat di Daftar Efek Syariah (DES) periode berjalan
     desBaris,             // nomor baris di DES periode I 2026 (KEP-21/D.04/2026, berlaku 1 Juni 2026);
                           // salah satu sumber wajib menaut ke berkas DES dan judulnya mengutip baris itu
     jenis,                // "interim" | "final"
     tahunBuku,            // mis. 2026
     dps,                  // dividen per saham, dalam mataUang. Boleh null HANYA bila sumber menyebut dividen per saham
                           // belum diumumkan; lalu totalDividenTeks wajib (Arif, 27 Nov 2026)
     totalDividenTeks,     // opsional, mis. "US$500 juta" / "Rp103,2 miliar": total dividen persis seperti sumber,
                           // dipakai hanya bila dps = null. Angkanya wajib muncul di judul salah satu sumber.
     mataUang,             // "IDR" atau "USD"
     tanggal: { cum, ex, recording, pembayaran },   // cum & ex = pasar reguler dan negosiasi
     sumber: [{ judul, url }]
   }]

   Field opsional untuk IPO & dividen (Arif, 21 Nov 2026, IDE.md #44):
     ditambahkan: "YYYY-MM-DD"   // tanggal entri dimasukkan tim; kartu ≤3 hari sejak tanggal ini diberi label
                                 // "Baru ditambahkan <tanggal>". Diisi Fajar HANYA untuk entri baru mulai rutin
                                 // berikutnya; entri lama tidak diberi tanggal karangan.

   Catatan Hana: DES periode II 2026 biasanya terbit akhir November dan berlaku 1 Desember.
   Setelah terbit, nomor baris setiap kode di sini dicek ulang ke DES baru. */

var DES_2026_I = "https://idx.id/media/nbkfn2sd/des-mei-2026.pdf";

// Tanggal terakhir tim memeriksa sumber Agenda (rutin sesi 07.xx dan 13.xx), "YYYY-MM-DD".
// Diperbarui setiap pemeriksaan rutin, walau tidak ada data baru. Ditampilkan di agenda.html (Arif + Dewi, 21 Nov 2026).
window.AGENDA_DIPERIKSA = "2026-11-27";

// IPO: per 19 Nov 2026 belum ada IPO yang sumbernya menyebut sahamnya efek syariah.
// Dicek Raka & Hana 19 Nov: Andalan Artha Primanusa (ANDA, penawaran umum 24–27 Nov 2026) — prospektus ringkas
// dan berita (CNBC Indonesia 6 Nov, Investortrust 5 Nov, Investasiku) tidak menyebut status syariah → belum dicatat.
// 24 Nov 2026 (Raka & Hana): ANDA masih tanpa bukti syariah (KAF Sekuritas 9 Nov juga tidak menyebut). IPO baru
// Bumi Atsiri Prima (BUAT, penawaran umum 1–7 Des, pencatatan 9 Des): Katadata, CNBC Indonesia, Investor.id 23 Nov
// tidak menyebut status syariah → belum dicatat.
window.AGENDA_IPO = [];

window.AGENDA_DIVIDEN = [
  // TOTO — interim 2026 (Raka; Fajar: tanggal sama di EmitenNews 16 Nov & BCA Sekuritas 17 Nov; Hana: DES baris 198)
  { kode: "TOTO", desBaris: 198, jenis: "interim", tahunBuku: 2026, dps: 10, mataUang: "IDR",
    tanggal: { cum: "2026-11-24", ex: "2026-11-25", recording: "2026-11-26", pembayaran: "2026-12-15" },
    sumber: [
      { judul: "BCA Sekuritas, 17 Nov 2026: Surya Toto bagikan dividen interim Rp103,2 miliar", url: "https://bcasekuritas.co.id/latest-news/news/surya-toto-bagikan-dividen-interim-rp1032-miiar" },
      { judul: "EmitenNews, 16 Nov 2026: TOTO tebar dividen interim 2026, Rp103,2 miliar", url: "https://emitennews.com/news/toto-tebar-dividen-interim-2026-siapkan-guyuran-dana-segar-rp1032m" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 198: TOTO PT Surya Toto Indonesia Tbk", url: DES_2026_I }
    ] },
  // DGWG — interim 2026 (Raka; Fajar: Kontan 17 Nov; Hana: DES baris 91)
  { kode: "DGWG", desBaris: 91, jenis: "interim", tahunBuku: 2026, dps: 19.5, mataUang: "IDR",
    tanggal: { cum: "2026-11-25", ex: "2026-11-26", recording: "2026-11-27", pembayaran: "2026-12-17" },
    sumber: [
      { judul: "Kontan, 17 Nov 2026: Delta Giri Wacana (DGWG) tebar dividen interim Rp114,7 miliar, ini jadwalnya", url: "https://investasi.kontan.co.id/news/delta-giri-wacana-dgwg-tebar-dividen-interim-rp-1147-miliar-ini-jadwalnya" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 91: DGWG PT Delta Giri Wacana Tbk", url: DES_2026_I }
    ] },
  // BOBA — interim 2026 (Raka; Fajar: PortalMadura 19 Nov; Hana: DES baris 211)
  { kode: "BOBA", desBaris: 211, jenis: "interim", tahunBuku: 2026, dps: 2, mataUang: "IDR",
    tanggal: { cum: "2026-11-26", ex: "2026-11-27", recording: "2026-11-30", pembayaran: "2026-12-18" },
    sumber: [
      { judul: "PortalMadura, 19 Nov 2026: BOBA bagikan dividen interim Rp2,31 miliar tahun buku 2026", url: "https://portalmadura.com/boba-bagikan-dividen-interim-rp231-miliar-tahun-buku-2026-cek-jadwal-lengkap-pencairannya-347753" },
      { judul: "BCA Sekuritas, 18 Nov 2026: BOBA akan bagikan dividen interim 18 Desember 2026", url: "https://bcasekuritas.co.id/latest-news/news/boba-akan-bagikan-dividen-interim-18-desember-2026" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 211: BOBA PT Formosa Ingredient Factory Tbk", url: DES_2026_I }
    ] },
  // JTPE — interim 2026 (Raka; Fajar: Kontan 19 Nov; Hana: DES baris 173)
  { kode: "JTPE", desBaris: 173, jenis: "interim", tahunBuku: 2026, dps: 10, mataUang: "IDR",
    tanggal: { cum: "2026-11-27", ex: "2026-11-30", recording: "2026-12-01", pembayaran: "2026-12-17" },
    sumber: [
      { judul: "Kontan, 19 Nov 2026: Jasuindo Tiga (JTPE) bagikan dividen interim Rp10 per saham, simak jadwalnya", url: "https://investasi.kontan.co.id/news/jasuindo-tiga-jtpe-bagikan-dividen-interim-rp-10-per-saham-simak-jadwalnya" },
      { judul: "EmitenNews, 19 Nov 2026: Jasuindo (JTPE) tebar dividen interim Rp67,73 miliar, distribusi 17 Desember", url: "https://emitennews.com/news/jasuindo-jtpe-tebar-dividen-interim-rp6773m-distribusi-17-desember" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 173: JTPE PT Jasuindo Tiga Perkasa Tbk", url: DES_2026_I }
    ] },
  // PSGO — interim 2026 (Raka; Fajar: Kontan 19 Nov; Hana: DES baris 269)
  { kode: "PSGO", desBaris: 269, jenis: "interim", tahunBuku: 2026, dps: 6, mataUang: "IDR",
    tanggal: { cum: "2026-11-27", ex: "2026-11-30", recording: "2026-12-01", pembayaran: "2026-12-18" },
    sumber: [
      { judul: "Kontan, 19 Nov 2026: Palma Serasih (PSGO) tebar dividen interim Rp113,1 miliar, catat jadwalnya", url: "https://investasi.kontan.co.id/news/palma-serasih-psgo-tebar-dividen-interim-rp-1131-miliar-catat-jadwalnya" },
      { judul: "EmitenNews, 19 Nov 2026: PSGO jadwal dividen Rp113,1 miliar, cum date 27 November", url: "https://emitennews.com/news/psgo-jadwal-dividen-rp1131-miliar-cum-date-27-november" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 269: PSGO PT Palma Serasih Tbk", url: DES_2026_I }
    ] },
  // AADI — interim 2026 (Raka, 27 Nov 13.xx; Fajar: jadwal sama di Investortrust, StockWatch & Kontan, semua 25 Nov;
  // dividen per saham BELUM diumumkan (Kontan: "belum mengumumkan besaran dividen per saham"), jadi dps = null dan
  // yang ditulis hanya total US$500 juta. Dibayar dalam rupiah dengan kurs tengah BI 7 Des 2026. Hana: DES baris 8,
  // sama dengan data/emiten-asli.js). Begitu DPS diumumkan (sekitar 7 Des), Fajar mengisi dps + sumbernya.
  { kode: "AADI", desBaris: 8, jenis: "interim", tahunBuku: 2026, dps: null, totalDividenTeks: "US$500 juta", mataUang: "USD",
    ditambahkan: "2026-11-27",
    tanggal: { cum: "2026-12-03", ex: "2026-12-04", recording: "2026-12-07", pembayaran: "2026-12-11" },
    sumber: [
      { judul: "Investortrust, 25 Nov 2026: Adaro Andalan (AADI) tebar dividen interim US$ 500 juta, cek jadwal berikut", url: "https://investortrust.id/market/123672/adaro-andalan-aadi-tebar-dividen-interim-us-500-juta-cek-jadwal-berikut" },
      { judul: "StockWatch, 25 Nov 2026: Adaro Andalan (AADI) tebar dividen interim USD500 juta, catat jadwal cum date", url: "https://stockwatch.id/adaro-andalan-aadi-tebar-dividen-interim-usd500-juta-catat-jadwal-cum-date/" },
      { judul: "Kontan (di TradingView): Adaro Andalan Indonesia (AADI) tebar dividen interim US$ 500 juta, cek jadwalnya", url: "https://id.tradingview.com/news/kontan:294cee2a787ea:0/" },
      { judul: "DES periode I 2026 (KEP-21/D.04/2026) baris 8: AADI PT Adaro Andalan Indonesia Tbk", url: DES_2026_I }
    ] }
];
