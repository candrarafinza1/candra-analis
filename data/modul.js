/* Kurikulum belajar Candra Analis — disusun tim Sari (Konten Edukasi),
   diperiksa tim Hana (Syariah & Kepatuhan).
   Setiap pelajaran: id, judul, ringkas, durasi, kuis, isi (HTML).
   kuis (tim Laras, bahasa ditinjau Sari, soal syariah ditinjau Hana): 3 soal,
   tiap soal { soal, pilihan[3], benar = indeks pilihan yang benar, jelas = penjelasan singkat }. */
window.MODUL = [
  {
    id: "apa-itu-saham",
    judul: "Apa itu saham?",
    ringkas: "Saham sebagai bukti kepemilikan perusahaan, dan dua cara saham memberi hasil.",
    durasi: "8 menit",
    kuis: [
      {
        "soal": "Apa arti memegang saham sebuah perusahaan?",
        "pilihan": [
          "Meminjamkan uang ke perusahaan dengan bunga tetap",
          "Ikut memiliki sebagian kecil perusahaan",
          "Menjadi karyawan perusahaan itu"
        ],
        "benar": 1,
        "jelas": "Saham adalah bukti bahwa Anda ikut memiliki sebagian kecil perusahaan."
      },
      {
        "soal": "Dua cara saham bisa memberi hasil adalah…",
        "pilihan": [
          "Kenaikan harga (capital gain) dan dividen",
          "Bunga bulanan dan bonus tahunan",
          "Gaji dan tunjangan"
        ],
        "benar": 0,
        "jelas": "Hasil saham datang dari selisih harga jual dengan harga beli, dan dari dividen bila dibagikan. Keduanya tidak dijamin."
      },
      {
        "soal": "Uang seperti apa yang sebaiknya dipakai untuk membeli saham?",
        "pilihan": [
          "Uang belanja bulan depan",
          "Uang pinjaman",
          "Uang yang tidak Anda butuhkan dalam waktu dekat"
        ],
        "benar": 2,
        "jelas": "Harga saham bisa turun. Pakai uang yang bisa Anda tahan untuk jangka panjang."
      }
    ],
    isi: `
      <p>Saham adalah bukti bahwa Anda ikut memiliki sebagian kecil perusahaan. Kalau sebuah perusahaan punya satu miliar lembar saham dan Anda memegang seribu lembar, Anda pemilik satu per sejuta perusahaan itu.</p>
      <p>Perusahaan yang sahamnya bisa dibeli masyarakat disebut <strong>emiten</strong> atau perusahaan terbuka. Di Indonesia, saham diperdagangkan di Bursa Efek Indonesia (BEI) dan diawasi Otoritas Jasa Keuangan (OJK).</p>

      <h2>Dua cara saham memberi hasil</h2>
      <ul>
        <li><strong>Kenaikan harga (capital gain).</strong> Anda membeli di harga Rp1.000, lalu menjualnya saat harga Rp1.300. Selisih Rp300 per lembar adalah keuntungan Anda.</li>
        <li><strong>Dividen.</strong> Bagian laba perusahaan yang dibagikan kepada pemegang saham. Tidak semua perusahaan membagikan dividen setiap tahun.</li>
      </ul>

      <h2>Risikonya juga nyata</h2>
      <ul>
        <li><strong>Harga bisa turun</strong> di bawah harga beli Anda (capital loss).</li>
        <li><strong>Dividen bisa tidak dibagikan</strong> kalau perusahaan merugi atau memilih menahan laba.</li>
        <li><strong>Saham bisa dihentikan perdagangannya</strong> (suspensi) oleh bursa, sehingga untuk sementara tidak bisa dijual.</li>
      </ul>
      <div class="kotak-penting">Pegangan pertama: gunakan uang yang tidak Anda butuhkan dalam waktu dekat. Saham cocok untuk tujuan jangka panjang, bukan untuk uang belanja bulan depan.</div>
    `
  },
  {
    id: "saham-syariah",
    judul: "Saham syariah dan Daftar Efek Syariah",
    ringkas: "Bagaimana sebuah saham dinyatakan syariah, siapa yang menetapkan, dan seberapa sering daftarnya diperbarui.",
    durasi: "10 menit",
    kuis: [
      {
        "soal": "Siapa yang menetapkan Daftar Efek Syariah (DES)?",
        "pilihan": [
          "OJK (Otoritas Jasa Keuangan)",
          "Perusahaan sekuritas",
          "Emitennya sendiri"
        ],
        "benar": 0,
        "jelas": "DES ditetapkan oleh OJK."
      },
      {
        "soal": "Berapa batas utang berbasis bunga dibanding total aset agar saham bisa masuk DES?",
        "pilihan": [
          "Tidak lebih dari 10%",
          "Tidak lebih dari 45%",
          "Tidak ada batas"
        ],
        "benar": 1,
        "jelas": "Utang berbasis bunga tidak boleh lebih dari 45% total aset. Angka 10% adalah batas pendapatan tidak halal."
      },
      {
        "soal": "Seberapa sering DES diperbarui secara berkala?",
        "pilihan": [
          "Setiap hari bursa",
          "Sekali dalam lima tahun",
          "Dua kali setahun, berlaku 1 Juni dan 1 Desember"
        ],
        "benar": 2,
        "jelas": "DES terbit akhir Mei dan akhir November. Karena itu status syariah sebuah saham bisa berubah."
      }
    ],
    isi: `
      <p>Saham syariah adalah saham emiten yang kegiatan usaha dan keuangannya memenuhi prinsip syariah di pasar modal. Di Indonesia, daftarnya ditetapkan oleh OJK dalam <strong>Daftar Efek Syariah (DES)</strong>.</p>

      <h2>Kriteria utama</h2>
      <p>Secara garis besar, sebuah saham masuk DES bila:</p>
      <ul>
        <li><strong>Kegiatan usahanya tidak bertentangan dengan prinsip syariah</strong>, misalnya bukan perjudian, bukan jasa keuangan ribawi, dan bukan produsen atau penjual barang haram.</li>
        <li><strong>Utang berbasis bunga tidak lebih dari 45%</strong> dari total aset.</li>
        <li><strong>Pendapatan tidak halal</strong> (termasuk bunga) <strong>tidak lebih dari 10%</strong> dari total pendapatan.</li>
      </ul>

      <h2>Diperbarui dua kali setahun</h2>
      <p>OJK menerbitkan DES secara berkala pada akhir Mei dan akhir November, berlaku efektif 1 Juni dan 1 Desember. Di antara jadwal itu, OJK juga bisa menambahkan saham baru secara insidentil, misalnya emiten yang baru mencatatkan saham.</p>
      <div class="kotak-penting">Artinya status syariah bisa berubah. Saham yang hari ini syariah bisa keluar dari daftar periode berikutnya. Radar Risiko Candra Analis akan memberi tahu Anda bila itu terjadi pada saham yang Anda pegang.</div>

      <h2>Indeks saham syariah</h2>
      <ul>
        <li><strong>ISSI</strong> (Indeks Saham Syariah Indonesia): seluruh saham syariah di BEI.</li>
        <li><strong>JII</strong> (Jakarta Islamic Index): 30 saham syariah paling likuid.</li>
        <li><strong>JII70</strong>: 70 saham syariah paling likuid.</li>
      </ul>

      <h2>Cara bertransaksi yang syariah</h2>
      <p>Selain memilih sahamnya, cara transaksinya juga perlu diperhatikan. Gunakan sekuritas yang menyediakan <strong>Sharia Online Trading System (SOTS)</strong>. Sistem ini dirancang mengikuti fatwa DSN-MUI, antara lain tidak memakai pembiayaan berbunga (margin) dan tidak melayani transaksi short selling.</p>
    `
  },
  {
    id: "buka-rekening",
    judul: "Membuka rekening saham",
    ringkas: "Rekening efek, RDN, dan cara memastikan sekuritas Anda resmi.",
    durasi: "7 menit",
    kuis: [
      {
        "soal": "Di mana uang transaksi saham Anda disimpan?",
        "pilihan": [
          "Di Rekening Dana Nasabah (RDN) atas nama Anda",
          "Di rekening pribadi pegawai sekuritas",
          "Di rekening perusahaan yang sahamnya Anda beli"
        ],
        "benar": 0,
        "jelas": "RDN adalah rekening bank atas nama Anda sendiri. Uang tidak masuk ke rekening sekuritas."
      },
      {
        "soal": "Layanan apa yang dipakai untuk memastikan saham benar-benar tercatat atas nama Anda?",
        "pilihan": [
          "Grup percakapan investor",
          "AKSes KSEI",
          "Kolom komentar media sosial"
        ],
        "benar": 1,
        "jelas": "Lewat AKSes KSEI Anda bisa memantau sendiri kepemilikan saham Anda."
      },
      {
        "soal": "Seseorang menawarkan untuk “mengelolakan” uang Anda lewat rekening pribadinya. Sikap yang tepat?",
        "pilihan": [
          "Setuju bila dijanjikan untung tetap",
          "Setor sedikit dulu untuk mencoba",
          "Tolak, karena itu bukan cara kerja pasar modal yang resmi"
        ],
        "benar": 2,
        "jelas": "Jangan menitipkan uang ke rekening pribadi seseorang. Transaksi resmi selalu lewat RDN atas nama Anda."
      }
    ],
    isi: `
      <p>Untuk membeli saham, Anda membuka rekening di <strong>perusahaan sekuritas</strong> (perantara pedagang efek) yang berizin OJK dan menjadi anggota BEI. Sekarang prosesnya bisa sepenuhnya daring lewat aplikasi.</p>

      <h2>Yang Anda dapatkan</h2>
      <ul>
        <li><strong>Rekening efek</strong>: tempat saham Anda dicatat.</li>
        <li><strong>Rekening Dana Nasabah (RDN)</strong>: rekening bank atas nama Anda untuk menampung uang transaksi. Uang Anda tidak masuk ke rekening sekuritas.</li>
        <li><strong>SID</strong> (Single Investor Identification): nomor identitas tunggal Anda sebagai investor di pasar modal Indonesia.</li>
      </ul>

      <h2>Yang biasanya diminta</h2>
      <ul>
        <li>KTP dan NPWP (NPWP bisa menyusul di beberapa sekuritas).</li>
        <li>Rekening bank atas nama sendiri.</li>
        <li>Swafoto dan tanda tangan digital.</li>
      </ul>

      <h2>Pastikan resmi</h2>
      <ol>
        <li>Cek nama sekuritas di situs resmi OJK atau daftar anggota bursa di situs BEI.</li>
        <li>Pilih yang menyediakan fitur transaksi syariah (SOTS) bila Anda ingin bertransaksi sesuai syariah.</li>
        <li>Jangan pernah menitipkan uang ke rekening pribadi seseorang dengan janji "dikelolakan". Itu bukan cara kerja pasar modal yang resmi.</li>
      </ol>
      <div class="kotak-penting">Setelah rekening aktif, Anda bisa memantau kepemilikan saham Anda sendiri lewat layanan AKSes KSEI. Ini cara memastikan saham benar-benar tercatat atas nama Anda.</div>
    `
  },
  {
    id: "lot-dan-transaksi",
    judul: "Lot, harga, dan biaya transaksi",
    ringkas: "Berapa uang yang dibutuhkan untuk membeli saham pertama Anda, beserta biayanya.",
    durasi: "9 menit",
    kuis: [
      {
        "soal": "Satu lot saham di BEI sama dengan berapa lembar?",
        "pilihan": [
          "10 lembar",
          "100 lembar",
          "1.000 lembar"
        ],
        "benar": 1,
        "jelas": "Satu lot = 100 lembar saham."
      },
      {
        "soal": "Harga saham Rp500 per lembar. Berapa modal untuk membeli 3 lot, belum termasuk biaya?",
        "pilihan": [
          "Rp150.000",
          "Rp1.500",
          "Rp15.000"
        ],
        "benar": 0,
        "jelas": "Rp500 × 100 lembar × 3 lot = Rp150.000."
      },
      {
        "soal": "Apa arti T+2?",
        "pilihan": [
          "Harga boleh naik dua kali sehari",
          "Biaya transaksi dua persen",
          "Transaksi diselesaikan dua hari bursa setelah transaksi"
        ],
        "benar": 2,
        "jelas": "Pada T+2 uang benar-benar berpindah dan saham tercatat di rekening efek Anda."
      }
    ],
    isi: `
      <p>Saham di BEI dibeli dalam satuan <strong>lot</strong>. Satu lot sama dengan <strong>100 lembar</strong> saham.</p>

      <h2>Menghitung modal</h2>
      <div class="kotak-rumus">Modal = harga per lembar × 100 × jumlah lot</div>
      <p>Contoh: harga saham Rp1.250. Untuk membeli 2 lot:</p>
      <div class="kotak-rumus">Rp1.250 × 100 × 2 = Rp250.000 (belum termasuk biaya)</div>

      <h2>Biaya transaksi</h2>
      <p>Setiap kali membeli atau menjual, sekuritas mengenakan biaya (fee). Besarnya berbeda-beda per sekuritas, jadi baca tabel biaya di aplikasi Anda. Biaya jual biasanya sedikit lebih tinggi daripada biaya beli karena ada pajak penjualan saham.</p>
      <p>Karena ada biaya di kedua sisi, harga harus naik melebihi total biaya dulu sebelum Anda benar-benar untung. Ini salah satu alasan sering keluar-masuk saham justru menggerus hasil.</p>

      <h2>Penyelesaian transaksi</h2>
      <p>Transaksi di pasar reguler diselesaikan dua hari bursa setelah transaksi (T+2). Saat itulah uang benar-benar berpindah dan saham tercatat di rekening efek Anda.</p>

      <h2>Harga bergerak per fraksi</h2>
      <p>Harga saham tidak bergerak per rupiah, melainkan per langkah tertentu yang disebut fraksi harga. Besarnya fraksi bergantung pada rentang harga saham. Aplikasi sekuritas akan otomatis menyesuaikan harga yang Anda masukkan.</p>
    `
  },
  {
    id: "laporan-keuangan",
    judul: "Membaca laporan keuangan",
    ringkas: "Tujuh angka yang paling sering dipakai untuk menilai kesehatan dan harga sebuah saham.",
    durasi: "12 menit",
    kuis: [
      {
        "soal": "Rumus ROE adalah…",
        "pilihan": [
          "Total liabilitas ÷ total ekuitas",
          "Laba bersih ÷ total ekuitas × 100%",
          "Harga saham ÷ EPS"
        ],
        "benar": 1,
        "jelas": "ROE mengukur seberapa efisien perusahaan menghasilkan laba dari modal pemiliknya. Rumus lain di pilihan adalah DER dan PER."
      },
      {
        "soal": "DER yang tinggi berarti…",
        "pilihan": [
          "Utang perusahaan besar dibanding modal sendiri",
          "Laba perusahaan pasti besar",
          "Dividen pasti dibagikan"
        ],
        "benar": 0,
        "jelas": "Makin tinggi DER, makin berat beban perusahaan saat kondisi sulit."
      },
      {
        "soal": "Apakah PER yang rendah selalu berarti sahamnya murah?",
        "pilihan": [
          "Ya, selalu",
          "Ya, asalkan pendapatannya naik",
          "Belum tentu, bisa juga pasar khawatir labanya akan turun"
        ],
        "benar": 2,
        "jelas": "Satu angka tidak pernah cukup. Bandingkan dengan tahun-tahun sebelumnya dan dengan perusahaan sejenis."
      }
    ],
    isi: `
      <p>Laporan keuangan emiten terbit setiap kuartal dan bisa diunduh gratis dari situs BEI. Anda tidak perlu membaca semuanya. Mulailah dari angka-angka ini.</p>

      <h2>Kesehatan usaha</h2>
      <ul>
        <li><strong>Pendapatan</strong>: total penjualan. Apakah tumbuh dari tahun ke tahun?</li>
        <li><strong>Laba bersih</strong>: sisa setelah semua biaya dan pajak. Inilah sumber dividen.</li>
        <li><strong>ROE</strong> (Return on Equity): seberapa efisien perusahaan menghasilkan laba dari modal pemiliknya.</li>
      </ul>
      <div class="kotak-rumus">ROE = laba bersih ÷ total ekuitas × 100%</div>
      <ul>
        <li><strong>DER</strong> (Debt to Equity Ratio): seberapa besar utang dibanding modal sendiri. Makin tinggi, makin berat beban perusahaan saat kondisi sulit.</li>
      </ul>
      <div class="kotak-rumus">DER = total liabilitas ÷ total ekuitas</div>

      <h2>Mahal atau murah?</h2>
      <ul>
        <li><strong>EPS</strong> (laba per saham): laba bersih dibagi jumlah saham beredar.</li>
        <li><strong>PER</strong> (Price to Earnings Ratio): berapa kali laba per saham yang Anda bayar.</li>
      </ul>
      <div class="kotak-rumus">PER = harga saham ÷ EPS</div>
      <ul>
        <li><strong>Dividend yield</strong>: dividen setahun dibanding harga saham sekarang.</li>
      </ul>
      <div class="kotak-rumus">Dividend yield = dividen per saham ÷ harga saham × 100%</div>

      <div class="kotak-penting">Satu angka saja tidak pernah cukup. PER rendah bisa berarti murah, bisa juga berarti pasar khawatir labanya akan turun. Bandingkan dengan tahun-tahun sebelumnya dan dengan perusahaan sejenis.</div>
    `
  },
  {
    id: "mengelola-risiko",
    judul: "Mengelola risiko",
    ringkas: "Kebiasaan sederhana yang melindungi modal Anda, dan jebakan yang paling sering menjerat pemula.",
    durasi: "9 menit",
    kuis: [
      {
        "soal": "Apa yang sebaiknya disiapkan sebelum berinvestasi saham?",
        "pilihan": [
          "Dana darurat",
          "Uang pinjaman",
          "Daftar saham dari media sosial"
        ],
        "benar": 0,
        "jelas": "Dana darurat menjaga Anda tidak terpaksa menjual saham saat butuh uang mendadak."
      },
      {
        "soal": "Apa yang dimaksud diversifikasi?",
        "pilihan": [
          "Menaruh semua modal di satu saham",
          "Menyebar modal ke beberapa saham dan sektor",
          "Sering keluar-masuk saham setiap hari"
        ],
        "benar": 1,
        "jelas": "Dengan menyebar modal, satu masalah tidak menghabiskan semua modal Anda."
      },
      {
        "soal": "Ke mana Anda bisa memeriksa atau melaporkan tawaran investasi yang mencurigakan?",
        "pilihan": [
          "Ke orang yang menawarkannya",
          "Tidak perlu ke mana-mana",
          "Kontak OJK 157"
        ],
        "benar": 2,
        "jelas": "OJK menyediakan Kontak OJK 157 untuk bertanya atau melapor."
      }
    ],
    isi: `
      <h2>Kebiasaan yang melindungi</h2>
      <ul>
        <li><strong>Siapkan dana darurat dulu</strong> sebelum berinvestasi saham.</li>
        <li><strong>Sebar ke beberapa saham dan sektor</strong> (diversifikasi), supaya satu masalah tidak menghabiskan semua modal.</li>
        <li><strong>Tentukan alasan membeli</strong>, tulis, lalu tinjau setiap laporan kuartal. Jika alasannya sudah tidak berlaku, itu sinyal untuk mengevaluasi ulang.</li>
        <li><strong>Investasikan rutin</strong> dengan jumlah tetap tiap bulan, daripada menunggu waktu yang "pas".</li>
      </ul>

      <h2>Jebakan yang sering menjerat pemula</h2>
      <ul>
        <li><strong>Ikut-ikutan rekomendasi media sosial.</strong> OJK mewajibkan pihak yang memberi rekomendasi efek memiliki izin penasihat investasi. Waspadai ajakan "pasti naik".</li>
        <li><strong>Pom-pom saham</strong>: harga dinaikkan beramai-ramai, lalu yang mengajak menjual duluan.</li>
        <li><strong>Menitipkan dana ke perorangan</strong> dengan janji keuntungan tetap.</li>
        <li><strong>Memakai uang pinjaman</strong> untuk membeli saham.</li>
      </ul>
      <div class="kotak-penting">Kalau ada tawaran investasi yang mencurigakan, Anda bisa memeriksanya atau melapor ke Kontak OJK 157.</div>
    `
  },
  {
    id: "praktik-beli-pertama",
    judul: "Praktik: membeli saham pertama Anda",
    ringkas: "Latihan dengan uang virtual dulu, lalu langkah demi langkah membeli satu lot sungguhan.",
    durasi: "15 menit",
    kuis: [
      {
        "soal": "Apa langkah pertama yang disarankan pelajaran ini?",
        "pilihan": [
          "Langsung setor dana besar ke RDN",
          "Latihan dengan Sharia Virtual Trading di aplikasi IDX Mobile",
          "Bergabung dengan grup yang membagikan kode saham"
        ],
        "benar": 1,
        "jelas": "Latihan dengan uang virtual dulu, terutama untuk merasakan saat harga turun."
      },
      {
        "soal": "Sebelum memasang order beli, apa yang perlu dipastikan tentang sahamnya?",
        "pilihan": [
          "Saham itu tercatat di Daftar Efek Syariah",
          "Saham itu sedang ramai dibicarakan",
          "Harganya yang paling murah di bursa"
        ],
        "benar": 0,
        "jelas": "Cek status syariahnya di DES periode berjalan."
      },
      {
        "soal": "Kapan sebaiknya Anda meninjau ulang saham yang Anda pegang?",
        "pilihan": [
          "Setiap kali harga naik atau turun",
          "Tidak perlu ditinjau",
          "Setiap kali laporan kuartal terbit"
        ],
        "benar": 2,
        "jelas": "Tinjau berdasarkan laporan keuangan, bukan pergerakan harga harian."
      }
    ],
    isi: `
      <p>Pelajaran ini mengajak Anda praktik. Kerjakan berurutan dan jangan lompat ke uang sungguhan sebelum tahap latihan selesai.</p>

      <h2>Tahap 1: latihan tanpa uang sungguhan</h2>
      <ol>
        <li>Unduh aplikasi resmi <strong>IDX Mobile</strong> dari Bursa Efek Indonesia, lalu aktifkan <strong>Mode Syariah</strong>.</li>
        <li>Buka fitur <strong>Sharia Virtual Trading</strong>. Anda mendapat modal virtual dan harga yang bergerak sungguhan.</li>
        <li>Beli dua atau tiga saham syariah pilihan Anda dengan modal virtual itu. Tulis alasan Anda membeli masing-masing saham.</li>
        <li>Pantau selama dua sampai empat minggu. Perhatikan perasaan Anda saat harga turun. Ini latihan terpenting.</li>
      </ol>

      <h2>Tahap 2: siapkan rekening</h2>
      <ol>
        <li>Buka rekening di sekuritas berizin OJK yang menyediakan transaksi syariah (lihat pelajaran "Membuka rekening saham").</li>
        <li>Tunggu sampai rekening efek dan RDN aktif. Biasanya Anda menerima email atau notifikasi di aplikasi.</li>
        <li>Setor dana ke RDN sesuai rencana. Untuk permulaan, cukup jumlah kecil yang siap Anda tahan bertahun-tahun.</li>
      </ol>

      <h2>Tahap 3: memasang order beli</h2>
      <ol>
        <li>Cari kode saham di aplikasi sekuritas. Pastikan saham itu tercatat di Daftar Efek Syariah.</li>
        <li>Pilih <strong>Beli</strong>, isi <strong>harga</strong> dan <strong>jumlah lot</strong>. Periksa total yang akan terpotong dari RDN, termasuk biaya.</li>
        <li>Kirim order. Order bisa langsung terjadi (<em>matched</em>) atau menunggu sampai ada penjual di harga itu.</li>
        <li>Setelah dua hari bursa (T+2), saham tercatat atas nama Anda. Cek juga lewat AKSes KSEI.</li>
      </ol>

      <h2>Tahap 4: catat dan tinjau</h2>
      <ul>
        <li>Catat tanggal, harga, jumlah lot, biaya, dan alasan membeli.</li>
        <li>Pasang saham Anda di Radar Risiko Candra Analis agar Anda tahu bila muncul tanda masalah.</li>
        <li>Tinjau ulang setiap kali laporan kuartal terbit, bukan setiap kali harga naik-turun.</li>
      </ul>
      <div class="kotak-penting">Tujuan pembelian pertama adalah belajar prosesnya, bukan mencari untung besar. Mulai kecil, catat semuanya.</div>
    `
  },
  {
    id: "praktik-analisis-sendiri",
    judul: "Praktik: menganalisis perusahaan sendiri",
    ringkas: "Lembar kerja sepuluh langkah untuk menilai satu perusahaan dari laporan keuangannya.",
    durasi: "20 menit",
    kuis: [
      {
        "soal": "Apa yang pertama kali dicari di Bagian A lembar kerja?",
        "pilihan": [
          "Dari mana uang perusahaan itu datang",
          "Harga sahamnya hari ini",
          "Berapa orang yang membicarakannya"
        ],
        "benar": 0,
        "jelas": "Memahami usaha lebih penting daripada menghafal rasio."
      },
      {
        "soal": "Menurut lembar kerja ini, DER di atas 2 berarti…",
        "pilihan": [
          "Labanya sangat besar",
          "Utangnya berat",
          "Sahamnya otomatis syariah"
        ],
        "benar": 1,
        "jelas": "DER di atas 2 berarti total liabilitas lebih dari dua kali ekuitas."
      },
      {
        "soal": "Anda belum bisa menjelaskan cara perusahaan itu menghasilkan uang. Apa yang disarankan?",
        "pilihan": [
          "Tetap lanjut asal PER-nya rendah",
          "Ikuti pendapat orang lain",
          "Tunda dulu sampai Anda memahaminya"
        ],
        "benar": 2,
        "jelas": "Keputusan Anda harus bisa dijelaskan dengan alasan Anda sendiri."
      }
    ],
    isi: `
      <p>Pilih satu perusahaan syariah yang produknya Anda kenal sehari-hari. Unduh laporan keuangan tahunan terbarunya dari situs BEI, lalu isi langkah-langkah di bawah. Tuliskan jawabannya di buku atau lembar kerja.</p>

      <h2>Bagian A: kenali usahanya</h2>
      <ol>
        <li><strong>Dari mana uangnya datang?</strong> Tulis produk atau jasa utamanya dalam satu kalimat.</li>
        <li><strong>Apakah masih tercatat syariah?</strong> Cek di Daftar Efek Syariah periode berjalan.</li>
        <li><strong>Siapa pesaingnya?</strong> Sebutkan dua perusahaan sejenis untuk pembanding.</li>
      </ol>

      <h2>Bagian B: periksa angkanya</h2>
      <ol start="4">
        <li><strong>Pendapatan</strong> tiga tahun terakhir: naik, datar, atau turun?</li>
        <li><strong>Laba bersih</strong> tiga tahun terakhir: apakah ikut naik bersama pendapatan?</li>
        <li><strong>ROE</strong>: hitung laba bersih ÷ ekuitas. Bandingkan dengan dua pesaing tadi.</li>
        <li><strong>DER</strong>: hitung total liabilitas ÷ ekuitas. Di atas 2 berarti utangnya berat.</li>
      </ol>

      <h2>Bagian C: nilai harganya</h2>
      <ol start="8">
        <li><strong>PER</strong>: harga saham ÷ laba per saham. Bandingkan dengan pesaing dan dengan PER tahun-tahun sebelumnya.</li>
        <li><strong>Dividen</strong>: apakah rutin dibagikan? Berapa dividend yield-nya?</li>
      </ol>

      <h2>Bagian D: simpulkan sendiri</h2>
      <ol start="10">
        <li>Tulis tiga hal yang membuat Anda yakin dan tiga hal yang membuat Anda ragu tentang perusahaan ini. Keputusan Anda harus bisa dijelaskan dari daftar itu.</li>
      </ol>
      <div class="kotak-penting">Kalau Anda tidak bisa menjelaskan cara perusahaan itu menghasilkan uang, tunda dulu. Memahami usaha lebih penting daripada menghafal rasio.</div>
    `
  }
];
