/* DATA CONTOH — BUKAN DATA PASAR SUNGGUHAN.
   Kode dan nama emiten di bawah sengaja fiktif (memakai angka) supaya tidak
   tertukar dengan saham nyata. Tim Fajar (Data Engineer) akan mengganti file ini
   dengan data hasil olahan laporan keuangan BEI dan Daftar Efek Syariah OJK.

   Satuan:
   - labaKuartal, pendapatan: miliar rupiah, urut dari kuartal terlama ke terbaru
   - roe, divYield: persen
   - der: kali (x)
   Status:
   - syariah: tercatat di Daftar Efek Syariah periode berjalan
   - keluarDES: tidak lagi tercatat di DES periode terbaru
   - suspensi: perdagangan sedang dihentikan sementara oleh bursa
   - notasiKhusus: emiten mendapat notasi khusus dari bursa */
window.DATA_META = {
  contoh: true,
  periodeDES: "Contoh periode berjalan",
  diperbarui: "Data contoh untuk uji tampilan"
};

window.EMITEN = [
  { kode: "CA01", nama: "Contoh Batu Bara Nusantara Tbk", sektor: "Energi",
    syariah: true, labaKuartal: [820, 905, 940, 1010], pendapatan: [5100, 5960], roe: 24.1, der: 0.4, divYield: 9.8 },
  { kode: "CA02", nama: "Contoh Telekomunikasi Raya Tbk", sektor: "Infrastruktur",
    syariah: true, labaKuartal: [1850, 1900, 1870, 1960], pendapatan: [36000, 37800], roe: 17.2, der: 0.9, divYield: 4.6 },
  { kode: "CA03", nama: "Contoh Semen Andalas Tbk", sektor: "Bahan baku",
    syariah: true, labaKuartal: [410, 360, 300, 240], pendapatan: [9800, 9100], roe: 6.3, der: 1.6, divYield: 2.1 },
  { kode: "CA04", nama: "Contoh Pangan Sejahtera Tbk", sektor: "Barang konsumen primer",
    syariah: true, labaKuartal: [640, 690, 710, 760], pendapatan: [21000, 23500], roe: 15.8, der: 0.7, divYield: 3.4 },
  { kode: "CA05", nama: "Contoh Properti Lestari Tbk", sektor: "Properti",
    syariah: true, labaKuartal: [180, 120, -40, -95], pendapatan: [3200, 2500], roe: -2.4, der: 2.3, divYield: 0, notasiKhusus: true },
  { kode: "CA06", nama: "Contoh Farmasi Bunda Tbk", sektor: "Kesehatan",
    syariah: true, labaKuartal: [260, 280, 300, 330], pendapatan: [4900, 5700], roe: 19.5, der: 0.3, divYield: 2.8 },
  { kode: "CA07", nama: "Contoh Nikel Timur Tbk", sektor: "Bahan baku",
    syariah: true, labaKuartal: [990, 1120, 1250, 1300], pendapatan: [14000, 18200], roe: 21.4, der: 0.6, divYield: 5.2 },
  { kode: "CA08", nama: "Contoh Ritel Keluarga Tbk", sektor: "Barang konsumen non-primer",
    syariah: false, keluarDES: true, labaKuartal: [150, 140, 135, 120], pendapatan: [7600, 7700], roe: 8.9, der: 1.1, divYield: 3.0 },
  { kode: "CA09", nama: "Contoh Agro Sawit Riau Tbk", sektor: "Barang konsumen primer",
    syariah: true, labaKuartal: [520, 610, 580, 660], pendapatan: [11200, 12600], roe: 13.7, der: 0.8, divYield: 6.9 },
  { kode: "CA10", nama: "Contoh Logistik Samudra Tbk", sektor: "Transportasi",
    syariah: true, labaKuartal: [95, 70, 55, 30], pendapatan: [2100, 2050], roe: 4.1, der: 1.9, divYield: 1.2, suspensi: true },
  { kode: "CA11", nama: "Contoh Teknologi Digital Tbk", sektor: "Teknologi",
    syariah: true, labaKuartal: [40, 65, 90, 120], pendapatan: [900, 1450], roe: 11.2, der: 0.2, divYield: 0 },
  { kode: "CA12", nama: "Contoh Energi Hijau Tbk", sektor: "Infrastruktur",
    syariah: true, labaKuartal: [300, 340, 360, 395], pendapatan: [4100, 4900], roe: 12.6, der: 1.2, divYield: 3.9 },
  { kode: "CA13", nama: "Contoh Kimia Prima Tbk", sektor: "Bahan baku",
    syariah: true, labaKuartal: [210, 230, 215, 240], pendapatan: [5200, 5500], roe: 10.4, der: 0.5, divYield: 4.4 },
  { kode: "CA14", nama: "Contoh Otomotif Jaya Tbk", sektor: "Perindustrian",
    syariah: true, labaKuartal: [700, 640, 690, 720], pendapatan: [30000, 30600], roe: 14.9, der: 0.9, divYield: 7.1 }
];
