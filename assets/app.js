/* Candra Analis — logika halaman (tanpa framework, tanpa build).
   Setiap fungsi hanya berjalan bila elemen tujuannya ada di halaman. */
(function () {
  "use strict";

  var MODUL = window.MODUL || [];
  // Data asli (tim Fajar). Hanya emiten yang barisnya ditemukan di Daftar Efek Syariah OJK.
  var EMITEN = window.EMITEN_ASLI || [];
  var DES_LABEL = "Daftar Efek Syariah OJK periode I 2026 (KEP-21/D.04/2026, berlaku 1 Juni 2026)";

  /* ---------- Utilitas ---------- */
  var angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });
  var angka2 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

  function el(tag, attrs, isi) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k];
      else if (k === "text") e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    (isi || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }

  // Miliar rupiah → teks ringkas (M = miliar, T = triliun)
  function rupiahMiliar(m) {
    var neg = m < 0, a = Math.abs(m);
    var t = a >= 1000 ? "Rp" + angka2.format(a / 1000) + " T" : "Rp" + angka.format(a) + " M";
    return neg ? "−" + t : t;
  }
  // Emiten yang melapor dalam dolar AS (keputusan Galih, 29 Okt 2026): angka disimpan dan
  // ditampilkan dalam mata uang laporannya (juta US$), TANPA dikonversi ke rupiah, agar tidak
  // ada kurs karangan. Rasio (pertumbuhan, ROE, DER) tidak bergantung mata uang, jadi tetap ikut
  // Peringkat; "Laba terbesar" hanya membandingkan emiten berlaporan rupiah.
  function dolarJuta(m) {
    var neg = m < 0, a = Math.abs(m);
    var t = a >= 1000 ? "US$" + angka2.format(a / 1000) + " miliar" : "US$" + angka.format(a) + " juta";
    return neg ? "−" + t : t;
  }
  function usd(e) { return e && e.mataUang === "USD"; }
  function uang(e) { return usd(e) ? dolarJuta : rupiahMiliar; }
  function persen(p) { return (p < 0 ? "−" : "") + angka.format(Math.abs(p)) + "%"; }
  // Perubahan (naik/turun): tanda "+" bila naik, "−" bila turun. ROE tetap memakai persen() (temuan Kirana 30 Okt 16.10).
  function ubah(p) { return (p > 0 ? "+" : "") + persen(p); }
  function ada(v) { return typeof v === "number" && isFinite(v); }
  function tumbuh(a, b) { return ada(a) && ada(b) && a !== 0 ? (b - a) / Math.abs(a) * 100 : null; }
  // Rumus tim Galih: semua dari angka tahun buku 2025 di sumber
  function laba25(e) { return e.labaTahun ? e.labaTahun[2025] : null; }
  function tumbuhLaba(e) { return e.labaTahun ? tumbuh(e.labaTahun[2024], e.labaTahun[2025]) : null; }
  function tumbuhPendapatan(e) { return e.pendapatan ? tumbuh(e.pendapatan[2024], e.pendapatan[2025]) : null; }
  function roe(e) { return ada(laba25(e)) && ada(e.ekuitas2025) && e.ekuitas2025 > 0 ? laba25(e) / e.ekuitas2025 * 100 : null; }
  function der(e) { return ada(e.liabilitas2025) && ada(e.ekuitas2025) && e.ekuitas2025 > 0 ? e.liabilitas2025 / e.ekuitas2025 : null; }
  function syariahAktif(e) { return ada(e.desBaris) && !e.keluarDES; }
  function strip(v, f) { return ada(v) ? f(v) : "–"; }

  function selKode(e) {
    // Kode menaut ke profil emiten (Dewi, 29 Okt)
    return el("td", null, [el("a", { class: "kode tautan-kode", href: "emiten.html?kode=" + e.kode, text: e.kode, "aria-label": e.kode + ", profil emiten" }), el("span", { class: "nama-emiten", text: e.nama })]);
  }

  function pitaSumber(wadah) {
    if (!wadah) return;
    // Kalimat inti selalu tampil; rinciannya di <details> agar tidak memanjang di HP (Dewi, tinjauan Kirana).
    wadah.appendChild(el("div", { class: "pita-sumber", role: "note" }, [
      el("p", null, [
        el("strong", { text: EMITEN.length + " emiten syariah" }),
        " dari Daftar Efek Syariah OJK. Angka yang belum bisa dipastikan sengaja dikosongkan (–)."
      ]),
      el("details", null, [
        el("summary", { text: "Tentang data ini" }),
        el("p", { text: "Angka tahun buku 2024–2025 dan laba Januari–September dari laporan keuangan emiten sebagaimana diberitakan media; tiap emiten punya tautan sumber. Status syariah: " + DES_LABEL + "." })
      ])
    ]));
  }
  /* ---------- Musim laporan 9 bulan (Arif + Dewi, IDE.md #17) ----------
     Dihitung dari laba9b 2026 di data emiten: tanpa simpanan, angka selalu tertulis. */
  function musimLaporan(wadah) {
    if (!wadah) return;
    var urut = EMITEN.slice().sort(function (a, b) { return a.kode.localeCompare(b.kode); });
    var sudah = urut.filter(function (e) { return e.laba9b && ada(e.laba9b[2026]); }).map(function (e) { return e.kode; });
    var belum = urut.filter(function (e) { return !(e.laba9b && ada(e.laba9b[2026])); }).map(function (e) { return e.kode; });
    var n = sudah.length, total = urut.length;
    var pct = total ? Math.round(n / total * 100) : 0;
    var isi = el("span", { class: "musim-isi" });
    isi.style.width = pct + "%";
    var jalur = el("div", { class: "musim-jalur", "aria-hidden": "true" }, [isi]);
    wadah.appendChild(el("div", { class: "musim-laporan", role: "note", "aria-label": "Musim laporan 9 bulan" }, [
      el("p", { class: "musim-teks" }, [
        "Laporan Januari–September 2026 sudah masuk untuk ",
        el("strong", { text: n + " dari " + total + " emiten" }),
        "."
      ]),
      jalur,
      el("p", { class: "musim-catatan", text: "Angka masuk bertahap. \"Belum masuk\" berarti angkanya belum ada di data kami: laporannya belum terbit, atau sumbernya belum bisa dipastikan. Perbandingan laba 9 bulan antaremiten baru sebanding bila keduanya sudah masuk." }),
      el("details", null, [
        el("summary", { text: "Lihat daftar kode" }),
        el("p", null, [el("strong", { text: "Sudah masuk (" + n + "): " }), sudah.length ? sudah.join(", ") : "belum ada"]),
        el("p", null, [el("strong", { text: "Belum masuk (" + belum.length + "): " }), belum.length ? belum.join(", ") : "tidak ada"])
      ])
    ]));
  }
  /* Beranda (Arif, 2 Nov 09.10, IDE.md #17): satu baris ringkas, hitungan sama dengan musimLaporan(). */
  function musimBeranda() {
    var wadah = document.getElementById("musim-beranda");
    if (!wadah) return;
    var n = EMITEN.filter(function (e) { return e.laba9b && ada(e.laba9b[2026]); }).length, total = EMITEN.length;
    wadah.appendChild(document.createTextNode("Laporan Januari–September 2026: "));
    wadah.appendChild(el("strong", { text: n + " dari " + total + " emiten" }));
    wadah.appendChild(document.createTextNode(" sudah masuk. "));
    wadah.appendChild(el("a", { href: "peringkat.html#pita", text: "Lihat di Peringkat" }));
    wadah.hidden = false;
  }
  function tautanSumber(e) {
    var s = (e.sumber || [])[0];
    return s ? el("a", { href: s.url, target: "_blank", rel: "noopener", text: "Sumber", "aria-label": "Sumber data " + e.kode + " (tab baru)" }) : document.createTextNode("–");
  }

  /* ---------- Penanda kemajuan belajar (Arif, IDE.md #4) ----------
     Hanya disimpan di peramban pengguna ini (localStorage): tanpa akun, tanpa server.
     Bila penyimpanan diblokir (mode privat), halaman tetap jalan tanpa penanda tersimpan. */
  var KUNCI_KEMAJUAN = "candra-analis:pelajaran-selesai";
  function bacaSelesai() {
    var v;
    try { v = JSON.parse(localStorage.getItem(KUNCI_KEMAJUAN) || "[]"); } catch (e) { return []; }
    return Array.isArray(v) ? v.filter(function (id) { return MODUL.some(function (m) { return m.id === id; }); }) : [];
  }
  function simpanSelesai(daftar) {
    try { localStorage.setItem(KUNCI_KEMAJUAN, JSON.stringify(daftar)); return true; } catch (e) { return false; }
  }

  function buatTandaiSelesai(m) {
    var kotak = el("div", { class: "tandai-selesai" });
    var tombol = el("button", { type: "button", class: "tombol tombol-tandai" });
    var info = el("p", { class: "tandai-info", role: "status", "aria-live": "polite" });
    function segarkan(umumkan) {
      var sudah = bacaSelesai().indexOf(m.id) >= 0;
      tombol.setAttribute("aria-pressed", sudah ? "true" : "false");
      tombol.textContent = sudah ? "✓ Sudah selesai" : "Tandai selesai";
      if (umumkan) info.textContent = sudah
        ? bacaSelesai().length + " dari " + MODUL.length + " pelajaran selesai. Tanda hanya tersimpan di perangkat ini."
        : "Tanda selesai dihapus.";
    }
    tombol.addEventListener("click", function () {
      var daftar = bacaSelesai(), i = daftar.indexOf(m.id);
      if (i >= 0) daftar.splice(i, 1); else daftar.push(m.id);
      if (!simpanSelesai(daftar)) { info.textContent = "Peramban ini tidak mengizinkan penyimpanan, jadi tanda tidak bisa disimpan."; return; }
      segarkan(true);
    });
    segarkan(false);
    kotak.appendChild(el("p", { class: "tandai-ajak", text: "Sudah paham isi pelajaran ini?" }));
    kotak.appendChild(tombol);
    kotak.appendChild(info);
    return kotak;
  }

  /* ---------- Perkiraan waktu baca (Arif, IDE.md #12; teks Laras) ----------
     Dihitung dari jumlah kata isi pelajaran saja (tanpa kuis), ±200 kata per menit,
     dibulatkan ke atas, minimal 1 menit. Rumus yang sama dipakai modul PDF. */
  var KATA_PER_MENIT = 200;
  function menitBaca(m) {
    var teks = String(m.isi || "").replace(/<[^>]+>/g, " ").replace(/&[a-z0-9#]+;/gi, " ");
    var kata = teks.split(/\s+/).filter(function (w) { return /[0-9A-Za-z\u00C0-\u024F]/.test(w); }).length;
    return Math.max(1, Math.ceil(kata / KATA_PER_MENIT));
  }
  function teksWaktuBaca(m) { return "Waktu baca ± " + menitBaca(m) + " menit"; }

  /* ---------- Jalur belajar ---------- */
  function renderJalur(id, lengkap) {
    var ol = document.getElementById(id);
    if (!ol) return;
    var selesai = lengkap ? bacaSelesai() : [];
    MODUL.forEach(function (m, i) {
      var sudah = selesai.indexOf(m.id) >= 0;
      var li = el("li", { "data-no": sudah ? "✓" : String(i + 1), class: sudah ? "selesai" : null }, [
        el("h3", null, [el("a", { href: "pelajaran.html?m=" + m.id, text: m.judul }), sudah ? el("span", { class: "label-selesai", text: "Selesai" }) : null]),
        el("p", { text: m.ringkas }),
        lengkap ? el("span", { class: "durasi", text: teksWaktuBaca(m) }) : null
      ]);
      if (!sudah) li.removeAttribute("class");
      ol.appendChild(li);
    });
    if (lengkap) {
      var n = selesai.length;
      ol.parentNode.insertBefore(el("p", { class: "kemajuan" }, [
        el("strong", { text: n + " dari " + MODUL.length + " pelajaran selesai" }),
        n ? (n === MODUL.length ? ". Semua pelajaran sudah Anda tandai selesai." : ". Lanjutkan kapan saja.") : ". Tandai pelajaran di bagian akhirnya setelah Anda membacanya.",
        el("span", { class: "kemajuan-catatan", text: " Tanda hanya tersimpan di peramban perangkat ini." })
      ]), ol);
    }
  }

  /* ---------- Lanjutkan belajar di beranda (Arif, IDE.md #9; teks Laras) ----------
     Memakai penanda kemajuan yang sama. Belum ada yang ditandai → kotak tetap tersembunyi. */
  function renderLanjutkan() {
    var kotak = document.getElementById("lanjutkan-belajar");
    if (!kotak || !MODUL.length) return;
    var selesai = bacaSelesai();
    if (!selesai.length) return;
    var n = selesai.length, idx = -1;
    for (var i = 0; i < MODUL.length; i++) if (selesai.indexOf(MODUL[i].id) < 0) { idx = i; break; }
    var info = el("p", { class: "lanjutkan-info" }, [
      el("strong", { text: n + " dari " + MODUL.length + " pelajaran selesai." }),
      " Tanda hanya tersimpan di perangkat ini."
    ]);
    if (idx >= 0) {
      kotak.appendChild(info);
      var m = MODUL[idx];
      kotak.appendChild(el("a", { class: "tombol tombol-utama", href: "pelajaran.html?m=" + m.id }, [
        "Lanjutkan belajar: Pelajaran " + (idx + 1),
        el("span", { class: "lanjutkan-judul", text: m.judul })
      ]));
    } else {
      kotak.appendChild(el("p", { class: "lanjutkan-tamat" }, [
        "Semua " + MODUL.length + " pelajaran selesai. Anda bisa ",
        el("a", { href: "belajar.html", text: "membuka ulang pelajaran" }),
        " kapan saja. Tanda hanya tersimpan di perangkat ini."
      ]));
    }
    kotak.hidden = false;
  }

  /* ---------- Kuis akhir pelajaran (tim Laras, Sari, Hana; tampilan Dewi) ----------
     Tanpa server dan tanpa menyimpan apa pun: jawaban hanya diperiksa di perangkat. */
  function buatKuis(m) {
    var form = el("form", { class: "kuis", "aria-labelledby": "judul-kuis", novalidate: "" });
    form.appendChild(el("h2", { id: "judul-kuis", text: "Cek pemahaman" }));
    form.appendChild(el("p", { class: "kuis-pengantar", text: "Tiga soal singkat dari pelajaran ini. Pilih satu jawaban di tiap soal, lalu periksa. Tidak dinilai dan tidak disimpan." }));
    var umpan = [], soalFs = [], wadahPilihan = [], masukan = [], dilipat = [], salahTerakhir = [], tepatTerakhir = [];
    m.kuis.forEach(function (q, i) {
      // Dewi & Nina (18 Nov 08.xx, WCAG 3.3.1): umpan per soal (mis. "Belum dijawab.") terhubung ke kelompok soalnya.
      var fs = el("fieldset", { class: "kuis-soal", "aria-describedby": "kuis-umpan-" + i });
      fs.appendChild(el("legend", { text: (i + 1) + ". " + q.soal }));
      wadahPilihan[i] = []; masukan[i] = []; dilipat[i] = false;
      q.pilihan.forEach(function (p, j) {
        var idIn = "kuis-" + i + "-" + j;
        var inp = el("input", { type: "radio", name: "soal-" + i, id: idIn, value: String(j) });
        var w = el("div", { class: "kuis-pilihan" }, [inp, el("label", { for: idIn, text: p })]);
        wadahPilihan[i].push(w); masukan[i].push(inp);
        fs.appendChild(w);
      });
      var u = el("p", { class: "kuis-umpan", id: "kuis-umpan-" + i, hidden: "" });
      umpan.push(u); soalFs.push(fs); fs.appendChild(u);
      form.appendChild(fs);
    });
    var hasil = el("p", { class: "kuis-hasil", role: "status", "aria-live": "polite" });
    var ulang = el("button", { type: "button", class: "tombol kuis-ulang", text: "Ulangi kuis", hidden: "" });
    // Arif & Dewi (16 Nov, IDE.md #31): ulangi hanya soal yang belum tepat; soal yang sudah benar dilipat.
    var ulangSalah = el("button", { type: "button", class: "tombol kuis-ulang-salah", text: "Ulangi soal yang salah", hidden: "" });
    form.appendChild(el("div", { class: "kuis-aksi" }, [
      el("button", { type: "submit", class: "tombol tombol-gelap", text: "Periksa jawaban" }), ulang, ulangSalah
    ]));
    form.appendChild(hasil);

    function lipat(i, ya) {
      dilipat[i] = ya;
      soalFs[i].className = ya ? "kuis-soal kuis-dilipat" : "kuis-soal";
      wadahPilihan[i].forEach(function (w) { w.hidden = ya; });
    }

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var benar = 0, kosong = 0;
      salahTerakhir = []; tepatTerakhir = [];
      m.kuis.forEach(function (q, i) {
        if (dilipat[i]) { benar++; return; }
        var pilih = form.querySelector('input[name="soal-' + i + '"]:checked');
        var u = umpan[i];
        u.hidden = false;
        if (!pilih) { kosong++; u.className = "kuis-umpan kuis-kosong"; u.textContent = "Belum dijawab."; return; }
        var tepat = Number(pilih.value) === q.benar;
        if (tepat) { benar++; tepatTerakhir.push(i); } else salahTerakhir.push(i);
        u.className = "kuis-umpan " + (tepat ? "kuis-tepat" : "kuis-salah");
        u.textContent = (tepat ? "✓ Benar. " : "✗ Belum tepat. Jawaban: " + q.pilihan[q.benar] + ". ") + q.jelas;
      });
      hasil.textContent = benar + " dari " + m.kuis.length + " benar" +
        (kosong ? " (" + kosong + " soal belum dijawab)." : benar === m.kuis.length ? ". Bagus, Anda siap ke pelajaran berikutnya." : ". Baca lagi bagian yang belum tepat, lalu coba ulangi.");
      ulang.hidden = false;
      ulangSalah.hidden = salahTerakhir.length === 0;
    });
    ulang.addEventListener("click", function () {
      form.reset();
      m.kuis.forEach(function (q, i) { lipat(i, false); });
      umpan.forEach(function (u) { u.hidden = true; u.textContent = ""; });
      hasil.textContent = ""; ulang.hidden = true; ulangSalah.hidden = true;
      var pertama = form.querySelector("input");
      if (pertama) pertama.focus();
    });
    ulangSalah.addEventListener("click", function () {
      var buka = salahTerakhir.slice();
      if (!buka.length) return;
      m.kuis.forEach(function (q, i) {
        var u = umpan[i];
        if (buka.indexOf(i) >= 0) {
          masukan[i].forEach(function (inp) { inp.checked = false; });
          lipat(i, false);
          u.hidden = true; u.textContent = "";
        } else if (!dilipat[i] && tepatTerakhir.indexOf(i) >= 0) {
          lipat(i, true);
          u.hidden = false; u.className = "kuis-umpan kuis-tepat"; u.textContent = "✓ Sudah benar.";
        }
      });
      salahTerakhir = []; tepatTerakhir = [];
      ulangSalah.hidden = true;
      hasil.textContent = "Ulangi " + buka.length + " soal yang belum tepat. Soal yang sudah benar dilipat.";
      masukan[buka[0]][0].focus();
    });
    return form;
  }

  /* ---------- Halaman pelajaran ---------- */
  function renderPelajaran() {
    var wadah = document.getElementById("isi-pelajaran");
    if (!wadah) return;
    var id = new URLSearchParams(location.search).get("m");
    var idx = MODUL.findIndex(function (m) { return m.id === id; });
    if (idx < 0) idx = 0;
    var m = MODUL[idx];

    document.title = m.judul + " · Belajar · Candra Analis";
    document.getElementById("judul-pelajaran").textContent = m.judul;
    document.getElementById("sub-pelajaran").textContent =
      "Pelajaran " + (idx + 1) + " dari " + MODUL.length + " · " + teksWaktuBaca(m).toLowerCase();

    wadah.innerHTML = m.isi; // isi berasal dari file kurikulum kita sendiri
    pasangIstilah(wadah);
    if (m.kuis && m.kuis.length) wadah.appendChild(buatKuis(m));
    wadah.appendChild(buatTandaiSelesai(m));

    var nav = el("nav", { class: "navigasi-pelajaran", "aria-label": "Pelajaran lain" });
    nav.appendChild(idx > 0
      ? el("a", { href: "pelajaran.html?m=" + MODUL[idx - 1].id, text: "Sebelumnya: " + MODUL[idx - 1].judul })
      : el("a", { href: "belajar.html", text: "Kembali ke daftar pelajaran" }));
    nav.appendChild(idx < MODUL.length - 1
      ? el("a", { href: "pelajaran.html?m=" + MODUL[idx + 1].id, text: "Berikutnya: " + MODUL[idx + 1].judul })
      : el("a", { href: "peringkat.html", text: "Selesai. Coba baca tabel peringkat" }));
    wadah.appendChild(nav);
  }

  /* ---------- Peringkat (tim Galih) ---------- */
  var KRITERIA = {
    laba: {
      label: "Laba bersih terbesar", nilai: laba25, tampil: rupiahMiliar, rupiahSaja: true, kolom: "Laba 2025",
      metode: "Laba bersih tahun buku 2025. Emiten yang melapor dalam dolar AS tidak ikut urutan ini karena tidak kami konversi ke rupiah."
    },
    tumbuhLaba: {
      label: "Pertumbuhan laba", nilai: tumbuhLaba, tampil: ubah, kolom: "Laba 2025 vs 2024",
      metode: "Perubahan laba bersih 2025 dibanding 2024."
    },
    tumbuh: {
      label: "Pertumbuhan pendapatan", nilai: tumbuhPendapatan, tampil: ubah, kolom: "Pendapatan 2025 vs 2024",
      metode: "Perubahan pendapatan 2025 dibanding 2024."
    },
    roe: {
      label: "ROE tertinggi", nilai: roe, tampil: persen, kolom: "ROE 2025",
      metode: "Laba bersih 2025 dibagi total ekuitas akhir 2025. Mengukur efisiensi memakai modal."
    }
  };

  // Emiten bertanda periksaUlang tidak ikut diperingkat sampai angkanya dipastikan (aturan Hana).
  // Emiten bertanda sekaliWaktu tidak ikut karena labanya banyak ditopang keuntungan sekali-waktu (aturan Galih & Hana, 30 Okt).
  function diluarPeringkat(e) { return !!(e.periksaUlang || e.sekaliWaktu); }
  function peserta(kunci) {
    var k = KRITERIA[kunci];
    return EMITEN.filter(function (e) { return syariahAktif(e) && !diluarPeringkat(e) && !(k.rupiahSaja && usd(e)) && ada(k.nilai(e)); });
  }
  // sektor kosong = semua sektor. Saring sektor (Arif, 30 Okt, IDE.md #11): rumus sama, urutan dihitung ulang di dalam sektor.
  function urutkan(kunci, sektor) {
    var k = KRITERIA[kunci];
    return peserta(kunci).filter(function (e) { return !sektor || e.sektor === sektor; }).sort(function (a, b) { return k.nilai(b) - k.nilai(a); }).slice(0, 10);
  }

  function renderMini() {
    var tb = document.getElementById("mini-peringkat");
    if (!tb) return;
    urutkan("laba").slice(0, 3).forEach(function (e, i) {
      tb.appendChild(el("tr", null, [
        el("td", { class: "peringkat-no", text: String(i + 1) }),
        selKode(e),
        el("td", { class: "angka", text: rupiahMiliar(laba25(e)) })
      ]));
    });
  }

  function renderPeringkat() {
    var akar = document.getElementById("peringkat");
    if (!akar) return;
    pitaSumber(document.getElementById("pita"));
    musimLaporan(document.getElementById("pita"));
    pasangIstilah(document.getElementById("pita"));

    var tabBaris = el("div", { class: "tab-baris", role: "tablist", "aria-label": "Pilih dasar peringkat" });
    var panel = el("div", { role: "tabpanel", id: "panel-peringkat" });
    var sektorList = EMITEN.filter(syariahAktif).map(function (e) { return e.sektor; })
      .filter(function (x, i, a) { return x && a.indexOf(x) === i; }).sort(function (a, b) { return a.localeCompare(b, "id"); });
    var pilihSektor = el("select", { id: "pilih-sektor" });
    pilihSektor.appendChild(el("option", { value: "", text: "Semua sektor" }));
    sektorList.forEach(function (x) { pilihSektor.appendChild(el("option", { value: x, text: x })); });
    var kunciAktif = "laba";
    pilihSektor.addEventListener("change", function () { tampilkan(kunciAktif); });
    akar.appendChild(tabBaris);
    akar.appendChild(el("div", { class: "saring-sektor" }, [
      el("label", { for: "pilih-sektor", text: "Saring sektor" }), pilihSektor,
      el("p", { class: "saring-ket", id: "ket-sektor", "aria-live": "polite" })
    ]));
    akar.appendChild(panel);

    function tampilkan(kunci) {
      kunciAktif = kunci;
      var sektor = pilihSektor.value;
      Array.prototype.forEach.call(tabBaris.children, function (t) {
        t.setAttribute("aria-selected", String(t.dataset.k === kunci));
        t.tabIndex = t.dataset.k === kunci ? 0 : -1;
      });
      var k = KRITERIA[kunci];
      panel.setAttribute("aria-labelledby", "tab-" + kunci);
      tutupIstilah(false);
      panel.innerHTML = "";
      var daftar = urutkan(kunci, sektor);
      document.getElementById("ket-sektor").textContent = sektor
        ? daftar.length + " emiten sektor " + sektor.toLowerCase() + " ikut urutan ini. Urutan dihitung ulang di dalam sektor."
        : "";
      var tbody = el("tbody");
      daftar.forEach(function (e, i) {
        var g = tumbuhPendapatan(e);
        tbody.appendChild(el("tr", null, [
          el("td", { class: "peringkat-no", text: String(i + 1) }),
          selKode(e),
          el("td", { class: "sel-sektor", "data-label": "Sektor", text: e.sektor }),
          el("td", { class: "angka sel-utama", "data-label": k.kolom, text: k.tampil(k.nilai(e)) }),
          kunci === "laba" ? null : el("td", { class: "angka", "data-label": "Laba 2025", text: strip(laba25(e), uang(e)) }),
          kunci === "tumbuh" ? null : el("td", { class: "angka " + (ada(g) ? (g >= 0 ? "naik" : "turun") : ""), "data-label": "Pendapatan YoY", text: strip(g, ubah) }),
          el("td", { class: "angka", "data-label": "DER", text: strip(der(e), function (v) { return angka.format(v) + "x"; }) }),
          el("td", { class: "sel-sumber", "data-label": "Data" }, [tautanSumber(e)])
        ]));
      });
      if (ISTILAH.length) panel.appendChild(el("p", { class: "baris-istilah" },
        // Arif + Dewi (8 Nov 07.09): "emiten" & "sektor" disebut di sini agar tetap bisa diketuk di HP,
        // karena kepala tabel disembunyikan saat Peringkat tampil sebagai kartu. Kartu tidak ditambah apa pun.
        ["Bingung istilahnya? Ketuk: emiten, sektor, ROE, DER, YoY, laba bersih, pendapatan, ekuitas."]));
      // Dewi (14 Nov, IDE.md #30): kelas tabel-wadah-kartu agar kepala tabel bisa menempel di layar lebar (lihat styles.css).
      panel.appendChild(el("div", { class: "tabel-wadah tabel-wadah-kartu" }, [
        el("table", { class: "tabel-kartu" }, [
          el("caption", { class: "keterangan-tabel", text: (daftar.length < 10 ? daftar.length : "Sepuluh") + " saham syariah teratas" + (sektor ? " di sektor " + sektor.toLowerCase() : "") + ": " + k.label.toLowerCase() }),
          el("thead", null, [el("tr", null, [
            el("th", { scope: "col", text: "#" }),
            el("th", { scope: "col", text: "Emiten" }),
            el("th", { scope: "col", text: "Sektor" }),
            el("th", { scope: "col", class: "angka", text: k.kolom }),
            kunci === "laba" ? null : el("th", { scope: "col", class: "angka", text: "Laba 2025" }),
            kunci === "tumbuh" ? null : el("th", { scope: "col", class: "angka", text: "Pendapatan YoY" }),
            el("th", { scope: "col", class: "angka", text: "DER" }),
            el("th", { scope: "col", text: "Data" })
          ])]),
          tbody
        ])
      ]));
      if (!daftar.length) panel.insertBefore(el("p", { class: "catatan-metode", text: "Belum ada emiten di sektor ini yang angkanya lengkap untuk urutan ini. Pilih dasar peringkat lain atau Semua sektor." }), panel.lastChild);
      var keluar = EMITEN.filter(function (e) { return syariahAktif(e) && (!sektor || e.sektor === sektor) && !(k.rupiahSaja && usd(e)) && (diluarPeringkat(e) || !ada(k.nilai(e))); })
        .map(function (e) { return e.kode; });
      panel.appendChild(el("p", { class: "catatan-metode", style: "margin-top:12px" },
        ["Cara menghitung: " + k.metode + " Hanya emiten yang tercatat di Daftar Efek Syariah. Urutan ini menggambarkan data, bukan saran membeli." +
          (keluar.length ? " Belum ikut diperingkat karena angkanya kosong, sedang dicek ulang, atau labanya banyak ditopang keuntungan sekali-waktu: " + keluar.join(", ") + "." : "")]));
      pasangIstilah(panel);
    }

    Object.keys(KRITERIA).forEach(function (kunci) {
      var t = el("button", { class: "tab", type: "button", role: "tab", id: "tab-" + kunci, "aria-controls": "panel-peringkat", text: KRITERIA[kunci].label });
      t.dataset.k = kunci;
      t.addEventListener("click", function () { tampilkan(kunci); });
      t.addEventListener("keydown", function (ev) {
        var kunciList = Object.keys(KRITERIA), i = kunciList.indexOf(kunci);
        if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
          var j = (i + (ev.key === "ArrowRight" ? 1 : -1) + kunciList.length) % kunciList.length;
          tampilkan(kunciList[j]);
          tabBaris.children[j].focus();
        }
      });
      tabBaris.appendChild(t);
    });
    tampilkan("laba");
  }

  // Fajar & Galih (30 Okt): aturan laba sekali-waktu untuk laba 9 bulan. Pos sekali-waktu yang nilainya disebut sumber
  // dibandingkan dengan laba 9 bulan tahun yang sama; ≥25% → beri catatan. Laba tidak dihitung ulang.
  function sekaliWaktu9b(e) {
    var w = e.sekaliWaktu9b, N = e.laba9b || {};
    if (!w || !ada(w.nilai) || !ada(N[w.tahun]) || N[w.tahun] === 0) return null;
    var porsi = Math.abs(w.nilai) / Math.abs(N[w.tahun]) * 100;
    if (porsi < 25) return null;
    var besar = porsi > 100 ? "lebih besar daripada laba" : "setara sekitar " + Math.round(porsi) + "% laba";
    return "Laba Januari–September " + w.tahun + " " + (w.jenis === "beban" ? "ditekan" : "ditopang") + " " + w.ket +
      ", " + besar + " periode itu. Karena itu naik-turun laba 9 bulan 2026 dibanding 2025 tidak sepenuhnya mencerminkan usaha rutin.";
  }

  /* ---------- Radar Risiko (tim Galih) ---------- */
  // Mengembalikan daftar sinyal { tingkat: tinggi|sedang|info|aman, judul, isi, bukti }
  function periksa(e) {
    var s = [];
    var L = e.labaTahun || {}, P = e.pendapatan || {}, rp = uang(e);

    if (e.keluarDES) s.push({ tingkat: "tinggi", judul: "Tidak lagi tercatat sebagai saham syariah",
      isi: "Emiten ini tidak ada di Daftar Efek Syariah periode terbaru.", bukti: "Sumber: " + DES_LABEL + "." });

    // Sinyal suspensi dihapus (9 Nov, Galih & Hana): belum ada data/pemantauan suspensi dan buktinya tidak menyebut pengumuman tertentu.

    if (ada(L[2025]) && L[2025] < 0) s.push({ tingkat: "tinggi", judul: "Merugi pada 2025",
      isi: "Perusahaan mencatat rugi bersih pada tahun buku 2025.", bukti: "Laba 2025: " + rp(L[2025]) + "." });

    var gl = tumbuhLaba(e);
    if (ada(gl) && gl <= -50) s.push({ tingkat: "tinggi", judul: "Laba turun lebih dari separuh",
      isi: "Laba bersih 2025 turun tajam dibanding 2024.",
      bukti: "Laba: " + rp(L[2024]) + " (2024) → " + rp(L[2025]) + " (2025), " + ubah(gl) + "." });
    else if (ada(gl) && gl < 0) s.push({ tingkat: "sedang", judul: "Laba menurun",
      isi: "Laba bersih 2025 lebih rendah daripada 2024.",
      bukti: "Laba: " + rp(L[2024]) + " (2024) → " + rp(L[2025]) + " (2025), " + ubah(gl) + "." });

    var gp = tumbuhPendapatan(e);
    if (ada(gp) && gp < 0) s.push({ tingkat: "sedang", judul: "Pendapatan menurun",
      isi: "Penjualan 2025 lebih rendah daripada 2024.",
      bukti: "Pendapatan: " + rp(P[2024]) + " → " + rp(P[2025]) + " (" + ubah(gp) + ")." });

    // Laba 9 bulan (Januari–September) 2026 dibanding periode yang sama 2025.
    var N = e.laba9b || {}, g9 = tumbuh(N[2025], N[2026]);
    if (ada(g9)) {
      var bukti9 = "Laba Januari–September: " + rp(N[2025]) + " (2025) → " + rp(N[2026]) + " (2026), " + ubah(g9) + ".";
      if (ada(N[2026]) && N[2026] < 0) s.push({ tingkat: "tinggi", judul: "Merugi dalam 9 bulan pertama 2026",
        isi: "Perusahaan mencatat rugi bersih untuk periode Januari–September 2026.", bukti: bukti9 });
      else if (g9 <= -50) s.push({ tingkat: "tinggi", judul: "Laba 9 bulan 2026 turun lebih dari separuh",
        isi: "Laba Januari–September 2026 turun tajam dibanding periode yang sama tahun lalu.", bukti: bukti9 });
      else if (g9 < 0) s.push({ tingkat: "sedang", judul: "Laba 9 bulan 2026 menurun",
        isi: "Laba Januari–September 2026 lebih rendah daripada periode yang sama tahun lalu.", bukti: bukti9 });
      else if (g9 === 0) s.push({ tingkat: "info", judul: "Laba 9 bulan 2026 tidak berubah",
        isi: "Laba Januari–September 2026 sama dengan periode yang sama tahun lalu. Laporan kuartalan umumnya belum diaudit.", bukti: bukti9 });
      else s.push({ tingkat: "info", judul: "Laba 9 bulan 2026 naik",
        isi: "Laba Januari–September 2026 lebih tinggi daripada periode yang sama tahun lalu. Laporan kuartalan umumnya belum diaudit.", bukti: bukti9 });
      var sw9 = sekaliWaktu9b(e);
      if (sw9) s.push({ tingkat: "info", judul: "Perbandingan laba 9 bulan tidak sebanding", isi: sw9,
        bukti: "Aturan laba sekali-waktu: lihat Metodologi. Angka laba tetap ditampilkan apa adanya." });
      if (e.catatan9b) s.push({ tingkat: "info", judul: "Catatan laba 9 bulan", isi: e.catatan9b,
        bukti: "Sumber tercantum di daftar sumber di bawah." });
    }

    var d = der(e);
    if (ada(d) && d > 2) s.push({ tingkat: "sedang", judul: "Utang tinggi dibanding modal",
      isi: "Total liabilitas lebih dari dua kali ekuitas. Beban kewajiban bisa menekan laba saat kondisi sulit.",
      bukti: "DER akhir 2025: " + angka.format(d) + "x." });

    if (e.catatan) s.push({ tingkat: "info", judul: "Catatan data dari tim kami",
      isi: e.catatan, bukti: "Angka bertanda catatan sedang dicek ke laporan keuangan resmi." });

    if (!s.some(function (x) { return x.tingkat !== "info"; })) s.push({ tingkat: "aman", judul: "Tidak ada tanda risiko dari pemeriksaan ini",
      isi: "Laba, pendapatan, utang, dan status syariah tidak menunjukkan tanda yang kami pantau.",
      bukti: "Tetap pantau laporan kuartal berikutnya." });

    var urut = { tinggi: 0, sedang: 1, info: 2, aman: 3 };
    return s.sort(function (a, b) { return urut[a.tingkat] - urut[b.tingkat]; });
  }

  // Radar (IDE.md #6, Dewi): batang pembanding 2024 vs 2025. CSS saja, angka tetap tertulis;
  // hanya bila kedua angka positif. Animasi tumbuh hanya di prefers-reduced-motion: no-preference (styles.css).
  function batangTahun(judul, D, rp) {
    if (!(ada(D[2024]) && ada(D[2025]) && D[2024] > 0 && D[2025] > 0)) return null;
    var maks = Math.max(D[2024], D[2025]);
    var daftar = el("ul", { class: "batang9 batang-tahun", "aria-label": judul + " 2024 dan 2025" });
    [2024, 2025].forEach(function (th) {
      var batang = el("span", { class: "batang9-isi batang-tumbuh" + (th === 2025 ? (D[2025] >= D[2024] ? " batang9-naik" : " batang9-turun") : ""), "aria-hidden": "true" });
      batang.style.width = Math.max(4, Math.round(D[th] / maks * 100)) + "%";
      daftar.appendChild(el("li", { class: "batang9-baris" }, [
        el("span", { class: "batang9-label", text: String(th) }),
        el("span", { class: "batang9-jalur" }, [batang]),
        el("span", { class: "batang9-angka", text: rp(D[th]) })
      ]));
    });
    return el("div", { class: "batang-kelompok" }, [el("p", { class: "batang-judul", "aria-hidden": "true", text: judul }), daftar]);
  }

  // Radar (IDE.md #6, Dewi): contoh cara membaca hasil, tampil sebelum emiten dipilih.
  var PANDUAN_RADAR = [
    { tingkat: "tinggi", warna: "Merah", arti: "Misalnya rugi, laba turun lebih dari separuh, atau tidak lagi tercatat sebagai saham syariah." },
    { tingkat: "sedang", warna: "Kuning", arti: "Misalnya laba atau pendapatan menurun, atau utang lebih dari dua kali modal." },
    { tingkat: "info", warna: "Biru", arti: "Misalnya catatan data dari tim kami atau laba 9 bulan yang naik." },
    { tingkat: "aman", warna: "Hijau", arti: "Tidak ada tanda risiko dari pemeriksaan ini. Tetap pantau laporan berikutnya." }
  ];
  // Dewi & Nina (18 Nov 13.xx, WCAG 1.4.1): tingkat temuan tidak boleh hanya dibedakan warna.
  // Setiap kartu temuan diberi label teks; label yang sama dipakai di panduan warna.
  function labelTingkat(t) {
    return { tinggi: "Tanda berat", sedang: "Perlu dicermati", info: "Keterangan", aman: "Tanpa tanda risiko" }[t] || "";
  }
  function kartuSinyal(x) {
    return el("li", { class: "sinyal sinyal-" + x.tingkat }, [
      el("p", { class: "sinyal-tingkat", text: labelTingkat(x.tingkat) }),
      el("h3", { class: "sinyal-judul", text: x.judul }), el("p", { text: x.isi }), el("p", { class: "bukti", text: x.bukti })
    ]);
  }
  function panduanRadar() {
    var ul = el("ul", { class: "panduan-radar" });
    PANDUAN_RADAR.forEach(function (x) {
      ul.appendChild(el("li", { class: "panduan-baris" }, [
        el("span", { class: "lampu lampu-" + x.tingkat, "aria-hidden": "true" }),
        el("p", null, [el("strong", { text: x.warna + " (" + labelTingkat(x.tingkat) + "): " }), document.createTextNode(x.arti)])
      ]));
    });
    return el("div", { class: "kotak-panduan" }, [
      el("h2", { class: "panduan-judul", text: "Cara membaca hasil Radar" }),
      el("p", { class: "catatan-metode", text: "Setiap temuan diberi warna dan label. Keduanya menunjukkan jenis temuan, bukan saran membeli atau menjual." }),
      ul
    ]);
  }

  /* ---------- Ketik kode atau nama emiten (Arif + Dewi, IDE.md #28, 14 Nov) ----------
     Kotak isian + <datalist> bawaan peramban di atas <select> yang lama (cadangan bila datalist tidak didukung).
     Bila isian cocok dengan tepat satu emiten, <select> ikut berganti lalu event change dikirim. Tanpa simpanan. */
  function cocokEmiten(teks, daftar) {
    var q = String(teks || "").split("·")[0].trim().toLowerCase();
    if (!q) return { q: "", hasil: [] };
    var persis = daftar.filter(function (x) { return x.kode.toLowerCase() === q; });
    if (persis.length) return { q: q, hasil: persis };
    return { q: q, hasil: daftar.filter(function (x) {
      return x.kode.toLowerCase().indexOf(q) === 0 || (q.length >= 2 && String(x.nama || "").toLowerCase().indexOf(q) !== -1);
    }) };
  }
  function kotakKetik(idDasar, pilih, daftar) {
    var idIsi = idDasar + "-ketik", idDaftar = idDasar + "-daftar", idInfo = idDasar + "-info";
    var dl = el("datalist", { id: idDaftar });
    daftar.forEach(function (x) { dl.appendChild(el("option", { value: x.kode + " · " + x.nama })); });
    var isi = el("input", { type: "text", id: idIsi, list: idDaftar, autocomplete: "off", spellcheck: "false",
      inputmode: "search", "aria-describedby": idInfo });
    var info = el("p", { id: idInfo, class: "info-ketik", role: "status", "aria-live": "polite" });
    var dariKetik = false;
    isi.addEventListener("input", function () {
      var c = cocokEmiten(isi.value, daftar);
      // Dewi & Nina (18 Nov 08.xx, WCAG 3.3.1): isian tanpa emiten cocok ditandai aria-invalid; pesannya sudah di aria-describedby.
      if (c.q && !c.hasil.length) isi.setAttribute("aria-invalid", "true"); else isi.removeAttribute("aria-invalid");
      if (!c.q) { info.textContent = ""; return; }
      if (c.hasil.length === 1) {
        var x = c.hasil[0];
        info.textContent = "Dipilih: " + x.kode + " · " + x.nama + ".";
        if (pilih.value !== x.kode) {
          pilih.value = x.kode;
          dariKetik = true;
          pilih.dispatchEvent(new Event("change", { bubbles: true }));
          dariKetik = false;
        }
      } else if (c.hasil.length > 1) {
        info.textContent = c.hasil.length + " emiten cocok. Ketik lebih lengkap, atau pilih dari daftar.";
      } else {
        info.textContent = "Tidak ada emiten yang cocok dengan \u201c" + isi.value.trim() + "\u201d di data kami. Coba kode empat huruf, atau pilih dari daftar di bawah.";
      }
    });
    // Bila <select> diganti langsung, isian dikosongkan agar keduanya tidak bertentangan.
    pilih.addEventListener("change", function () {
      if (dariKetik) return;
      isi.value = ""; info.textContent = ""; isi.removeAttribute("aria-invalid");
    });
    return el("div", { class: "kotak-ketik" }, [
      el("label", { for: idIsi, text: "Ketik kode atau nama emiten" }), isi, dl, info
    ]);
  }

  function renderRadar() {
    var akar = document.getElementById("radar");
    if (!akar) return;
    pitaSumber(document.getElementById("pita"));
    musimLaporan(document.getElementById("pita"));

    var pilih = el("select", { id: "pilih-saham" });
    pilih.appendChild(el("option", { value: "", text: "Pilih kode saham" }));
    EMITEN.slice().sort(function (a, b) { return a.kode.localeCompare(b.kode); }).forEach(function (e) {
      pilih.appendChild(el("option", { value: e.kode, text: e.kode + " · " + e.nama }));
    });
    var urutRadar = EMITEN.slice().sort(function (a, b) { return a.kode.localeCompare(b.kode); });
    var form = el("div", { class: "radar-form" }, [
      kotakKetik("radar", pilih, urutRadar),
      el("label", { for: "pilih-saham", text: "Atau pilih saham yang Anda pegang" }), pilih
    ]);
    var hasil = el("div", { id: "hasil-radar", "aria-live": "polite" });
    akar.appendChild(form);
    akar.appendChild(hasil);

    function tampil() {
      tutupIstilah(false);
      hasil.innerHTML = "";
      var e = EMITEN.find(function (x) { return x.kode === pilih.value; });
      if (!e) {
        hasil.appendChild(el("p", { class: "catatan-metode", text: "Pilih satu kode saham untuk melihat hasil pemeriksaan. Saham yang belum ada di daftar sedang dikumpulkan datanya." }));
        hasil.appendChild(panduanRadar());
        // Arif (7 Nov 17.09): kalimat petunjuk & panduan ikut ditandai istilah; <select> ada di luar #hasil-radar.
        pasangIstilah(hasil);
        return;
      }
      var s = periksa(e);
      var jml = s.filter(function (x) { return x.tingkat === "tinggi" || x.tingkat === "sedang"; }).length;
      hasil.appendChild(el("h2", { style: "font-size:1.35rem", text: e.kode + ": " + (jml ? jml + " tanda yang perlu Anda perhatikan" : "tidak ada tanda risiko") }));
      hasil.appendChild(el("p", { class: "catatan-metode", text: "Tercatat di " + DES_LABEL + ", baris " + e.desBaris + "." +
        (usd(e) ? " Emiten ini melapor dalam dolar AS; angka ditampilkan dalam dolar AS sesuai laporannya." : "") }));
      // Dewi + Galih (20 Nov 2026): kartu info jadwal dividen ≤30 hari, bukan bagian dari hitungan tanda risiko.
      var infoA = infoAgendaEmiten(e.kode, new Date());
      if (infoA) hasil.appendChild(infoA);
      var ul = el("ul", { class: "sinyal-daftar" });
      s.forEach(function (x) {
        ul.appendChild(kartuSinyal(x));
      });
      hasil.appendChild(ul);
      var bL = batangTahun("Laba", e.labaTahun || {}, uang(e)), bP = batangTahun("Pendapatan", e.pendapatan || {}, uang(e));
      if (bL || bP) {
        hasil.appendChild(el("h3", { style: "margin-top:20px;font-size:1.05rem", text: "Laba dan pendapatan 2024 vs 2025" }));
        if (bL) hasil.appendChild(bL);
        if (bP) hasil.appendChild(bP);
        hasil.appendChild(el("p", { class: "catatan-metode", text: "Batang 2025 hijau bila naik, merah bila turun dibanding 2024. Batang hanya tampil bila kedua angka positif." }));
      }
      var sumber = el("ul", { class: "daftar-sumber" });
      (e.sumber || []).forEach(function (x) {
        sumber.appendChild(el("li", null, [el("a", { href: x.url, target: "_blank", rel: "noopener", text: x.judul, "aria-label": x.judul + " (tab baru)" })]));
      });
      hasil.appendChild(el("p", null, [el("a", { href: "emiten.html?kode=" + e.kode, text: "Lihat profil lengkap " + e.kode })]));
      hasil.appendChild(el("h3", { style: "margin-top:20px;font-size:1.05rem", text: "Sumber data" }));
      hasil.appendChild(sumber);
      pasangIstilah(hasil);
      hasil.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px", text: "Radar menyajikan fakta dari data. Ini bukan perintah menjual atau mempertahankan saham. Keputusan ada di tangan Anda." }));
    }
    pilih.addEventListener("change", tampil);
    var awal = new URLSearchParams(location.search).get("kode");
    if (awal) pilih.value = awal.toUpperCase();
    tampil();
  }

  /* ---------- Profil emiten (tim Dewi & Arif) ---------- */
  // emiten.html?kode=XXXX. Hanya menampilkan angka yang ada di data; yang kosong tampil "–".
  /* ---------- Bandingkan dua emiten (Arif, IDE.md #14, 1 Nov) ----------
     Hanya angka berdampingan, tanpa kata "lebih baik". Dolar AS tidak dikonversi; bila mata uang beda, diberi catatan.
     Tanpa simpanan. */
  function bagianBanding(e) {
    var wadah = el("section", { class: "banding", "aria-labelledby": "judul-banding" });
    wadah.appendChild(el("h2", { class: "judul-profil-bagian", id: "judul-banding", text: "Bandingkan dengan emiten lain" }));
    var pilih = el("select", { id: "pilih-banding", class: "pilih-banding" });
    pilih.appendChild(el("option", { value: "", text: "Pilih emiten…" }));
    EMITEN.filter(function (x) { return x.kode !== e.kode; }).sort(function (a, b) { return a.kode.localeCompare(b.kode); })
      .forEach(function (x) { pilih.appendChild(el("option", { value: x.kode, text: x.kode + " · " + x.nama })); });
    var urutBanding = EMITEN.filter(function (x) { return x.kode !== e.kode; }).sort(function (a, b) { return a.kode.localeCompare(b.kode); });
    wadah.appendChild(kotakKetik("banding", pilih, urutBanding));
    wadah.appendChild(el("div", { class: "saring-sektor kontrol-banding" }, [el("label", { for: "pilih-banding", text: "Bandingkan " + e.kode + " dengan" }), pilih]));
    var hasil = el("div", { id: "hasil-banding", "aria-live": "polite" });
    wadah.appendChild(hasil);

    function nilaiPos(x) {
      var rp = uang(x), L = x.labaTahun || {}, P = x.pendapatan || {}, N = x.laba9b || {};
      var g9 = tumbuh(N[2025], N[2026]);
      return [
        strip(L[2025], rp),
        strip(P[2025], rp),
        strip(roe(x), persen),
        strip(der(x), function (v) { return angka.format(v) + "x"; }),
        ada(N[2026]) ? rp(N[2026]) + (ada(g9) ? " (" + ubah(g9) + ")" : "") : "belum ada",
        syariahAktif(x) ? "Baris " + x.desBaris : "Tidak tercatat"
      ];
    }
    var POS = ["Laba bersih 2025", "Pendapatan 2025", "ROE 2025", "DER akhir 2025", "Laba Jan–Sep 2026 (perubahan dari 2025)", "Daftar Efek Syariah"];

    pilih.addEventListener("change", function () {
      // Arif (7 Nov 18.08): kotak istilah yang terbuka di hasil lama ditutup dulu; hasil baru ikut ditandai istilah.
      tutupIstilah(false);
      hasil.textContent = "";
      var x = EMITEN.find(function (y) { return y.kode === pilih.value; });
      if (!x) return;
      var a = nilaiPos(e), b = nilaiPos(x);
      var tbody = el("tbody");
      POS.forEach(function (nama, i) {
        tbody.appendChild(el("tr", null, [el("th", { scope: "row", text: nama }),
          el("td", { class: "angka", text: a[i] }), el("td", { class: "angka", text: b[i] })]));
      });
      hasil.appendChild(el("div", { class: "tabel-wadah" }, [el("table", { class: "tabel-profil tabel-banding" }, [
        el("caption", { class: "keterangan-tabel", text: e.kode + " dan " + x.kode + " berdampingan. Laba = laba yang diatribusikan kepada pemilik entitas induk." }),
        el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Pos" }),
          el("th", { scope: "col", class: "angka", text: e.kode }), el("th", { scope: "col", class: "angka", text: x.kode })])]),
        tbody
      ])]));
      if (usd(e) !== usd(x)) hasil.appendChild(el("p", { class: "catatan-metode", text:
        "Satu emiten melapor dalam dolar AS dan yang lain dalam rupiah. Angka uangnya tidak sebanding langsung karena tidak kami konversi; ROE dan DER (persen dan kali) tetap bisa dibaca berdampingan." }));
      // IDE.md #18 (2 Nov): sebut kode emitennya agar pemula tahu catatan mana yang harus dibaca.
      var bertanda = [e, x].filter(function (y) { return y.periksaUlang || y.sekaliWaktu; }).map(function (y) { return y.kode; });
      if (bertanda.length) hasil.appendChild(el("p", { class: "catatan-metode", text:
        "Laba " + bertanda.join(" dan ") + " sedang dicek ulang atau banyak ditopang keuntungan sekali-waktu. Baca catatannya di profil " +
        (bertanda.length > 1 ? "masing-masing" : bertanda[0]) + " sebelum membandingkan." }));
      hasil.appendChild(el("p", { class: "catatan-metode" }, [
        "Perbandingan ini hanya menyandingkan angka, bukan saran membeli atau menjual. Sumber tiap angka ada di bagian Sumber data profil masing-masing: ",
        el("a", { href: "emiten.html?kode=" + x.kode, text: "profil " + x.kode }), "."]));
      pasangIstilah(hasil);
    });
    return wadah;
  }

  // Dividen per saham untuk profil: hanya bila dps angka > 0 dan dpsSumber https ada; selalu dalam rupiah.
  function dividenTampil(e) {
    if (typeof e.dps !== "number" || !(e.dps > 0)) return null;
    if (!e.dpsSumber || !e.dpsSumber.judul || !/^https:\/\//.test(e.dpsSumber.url || "")) return null;
    // DPS bisa berdesimal dua (mis. SMGR Rp28,33), jadi tidak dibulatkan ke satu desimal
    return "Rp" + new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(e.dps);
  }

  // Arif & Dewi (14 Nov, IDE.md #29): tombol "Salin tautan profil". Memakai Clipboard API bawaan peramban bila ada;
  // bila tidak ada atau ditolak, alamat ditampilkan di kotak teks yang sudah terpilih agar bisa disalin manual.
  // Tanpa simpanan, tanpa layanan luar. Pesan di role=status.
  // Dewi & Nina (18 Nov 20.xx, WCAG 2.2.1): "Tautan disalin." tidak lagi hilang sendiri setelah 4 detik; pesan tetap
  // sampai tombol ditekan lagi, agar pemula (dan pembaca layar yang lambat) sempat membacanya.
  function tombolSalin(alamat, papan) {
    var info = el("p", { id: "salin-info", class: "info-salin", role: "status", "aria-live": "polite" });
    var tombol = el("button", { type: "button", class: "tombol tombol-salin", text: "Salin tautan profil" });
    var kotak = el("input", { type: "text", id: "salin-alamat", class: "alamat-salin", readonly: "", hidden: "",
      "aria-label": "Alamat profil ini" });
    kotak.value = alamat;
    function pesan(t) {
      info.textContent = t;
    }
    function cadangan() {
      kotak.hidden = false;
      kotak.focus();
      kotak.select();
      pesan("Tautan belum bisa disalin otomatis. Alamatnya sudah dipilih di kotak ini: salin dengan Ctrl+C, atau tekan lama lalu Salin.");
    }
    tombol.addEventListener("click", function () {
      if (!papan || typeof papan.writeText !== "function") { cadangan(); return; }
      var janji;
      try { janji = papan.writeText(alamat); } catch (err) { cadangan(); return; }
      Promise.resolve(janji).then(function () {
        kotak.hidden = true;
        pesan("Tautan disalin.");
      }, cadangan);
    });
    return el("div", { class: "salin-profil" }, [tombol, kotak, info]);
  }

  // Arif & Hana (16 Nov, IDE.md #33): baris kesegaran data di bawah judul profil. Tanggal HANYA diambil dari judul
  // sumber di data berformat "Media, 2 Nov 2026: …", bertanggal setelah 30 Sep 2026 (laporan Januari–September 2026
  // paling cepat terbit Oktober) dan bukan berita dividen. Tanpa tanggal seperti itu → baris tidak tampil (null).
  function kesegaran9b(e) {
    var N = e.laba9b || {};
    if (!ada(N[2026])) return { teks: "Laporan Januari–September 2026 belum masuk data.", tanggal: null };
    var BLN_PENDEK = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6, Jul: 7, Agu: 8, Sep: 9, Okt: 10, Nov: 11, Des: 12 };
    var terbaru = 0, label = null;
    (e.sumber || []).forEach(function (s) {
      var judul = String((s && s.judul) || "");
      var m = /^[^:]*?,\s*(\d{1,2}) (Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des) (20\d\d)\b[^:]*:/.exec(judul);
      if (!m || /dividen/i.test(judul)) return;
      var nilai = Number(m[3]) * 10000 + BLN_PENDEK[m[2]] * 100 + Number(m[1]);
      if (nilai > 20260930 && nilai > terbaru) { terbaru = nilai; label = m[1] + " " + m[2] + " " + m[3]; }
    });
    if (!label) return null;
    return { teks: "Angka terbaru: laporan Januari–September 2026 (sumber terbaru bertanggal " + label + ").", tanggal: label };
  }

  function renderProfil() {
    var akar = document.getElementById("profil");
    if (!akar) return;
    var kode = (new URLSearchParams(location.search).get("kode") || "").trim().toUpperCase();
    var e = EMITEN.find(function (x) { return x.kode === kode; });

    function daftarSemua() {
      var ul = el("ul", { class: "daftar-emiten" });
      EMITEN.slice().sort(function (a, b) { return a.kode.localeCompare(b.kode); }).forEach(function (x) {
        ul.appendChild(el("li", null, [el("a", { href: "emiten.html?kode=" + x.kode }, [
          el("span", { class: "kode", text: x.kode }), el("span", { class: "nama-emiten", text: x.nama })
        ])]));
      });
      return ul;
    }

    if (!e) {
      // Arif: kode kosong atau tidak ada di data → pesan ramah + daftar emiten yang tersedia
      // Dewi & Nina (17 Nov 21.xx, WCAG 2.4.2): judul tab ikut menyebut kode yang tidak ditemukan
      if (kode) document.title = "Kode " + kode.slice(0, 8) + " tidak ditemukan · Profil emiten · Candra Analis";
      akar.appendChild(el("div", { class: "pita-sumber", role: "status" }, [
        el("p", null, kode
          ? [el("strong", { text: "Kode " + kode.slice(0, 8) + " belum ada di data kami. " }),
            "Bisa jadi kodenya salah ketik, atau emiten itu belum kami kumpulkan datanya. Kami hanya memuat emiten yang tercatat di Daftar Efek Syariah OJK."]
          : ["Pilih satu emiten di bawah untuk melihat profilnya."])
      ]));
      akar.appendChild(el("h2", { class: "judul-profil-bagian", text: EMITEN.length + " emiten dalam data kami" }));
      akar.appendChild(daftarSemua());
      return;
    }

    var rp = uang(e), L = e.labaTahun || {}, P = e.pendapatan || {}, N = e.laba9b || {};
    document.title = e.kode + " · " + e.nama + " · Candra Analis";
    document.getElementById("judul-profil").textContent = e.kode;
    document.getElementById("sub-profil").textContent = e.nama + " · Sektor " + e.sektor.toLowerCase();
    var dasarAlamat = String(location.href || "").split(/[?#]/)[0] || "emiten.html";
    var papanKlip = typeof window !== "undefined" && window.isSecureContext && typeof navigator !== "undefined" && navigator.clipboard ? navigator.clipboard : null;
    var segar = kesegaran9b(e);
    if (segar) akar.appendChild(el("p", { class: "kesegaran-data", id: "kesegaran-data", text: segar.teks }));
    akar.appendChild(tombolSalin(dasarAlamat + "?kode=" + e.kode, papanKlip));

    // Status syariah
    akar.appendChild(el("div", { class: "status-syariah " + (syariahAktif(e) ? "status-ya" : "status-tidak"), role: "note" }, [
      el("strong", { text: syariahAktif(e) ? "Tercatat sebagai saham syariah" : "Tidak lagi tercatat sebagai saham syariah" }),
      el("p", { text: syariahAktif(e)
        ? "Bukti: " + DES_LABEL + ", baris " + e.desBaris + ". Masuk daftar bukan berarti disarankan untuk dibeli."
        : "Emiten ini tidak ada di Daftar Efek Syariah periode terbaru." })
    ]));
    // Dewi + Galih (20 Nov 2026): info jadwal dividen dalam 30 hari ke depan, tautan ke Agenda.
    var infoAgenda = infoAgendaEmiten(e.kode, new Date());
    if (infoAgenda) akar.appendChild(infoAgenda);
    // Raka & Sari (30 Okt): ringkasan usaha 1–2 kalimat, hanya bila ada sumbernya
    if (e.usaha && e.usaha.teks && e.usaha.sumber && e.usaha.sumber.url) {
      akar.appendChild(el("h2", { class: "judul-profil-bagian", text: "Usaha perusahaan" }));
      akar.appendChild(el("p", { class: "ringkasan-usaha", text: e.usaha.teks }));
      akar.appendChild(el("p", { class: "catatan-metode" }, ["Sumber: ",
        el("a", { href: e.usaha.sumber.url, rel: "noopener", text: e.usaha.sumber.judul })]));
    }
    if (usd(e)) akar.appendChild(el("p", { class: "catatan-metode", text: "Emiten ini melapor dalam dolar AS. Angka ditampilkan dalam dolar AS sesuai laporannya, tanpa dikonversi ke rupiah." }));
    if (e.periksaUlang) akar.appendChild(el("p", { class: "catatan-metode", text: "Angka laba emiten ini sedang dicek ulang atau tidak bisa dibandingkan secara adil, jadi sementara tidak ikut Peringkat. Penjelasannya ada di catatan di bawah." }));
    if (e.sekaliWaktu) akar.appendChild(el("p", { class: "catatan-metode" }, [
      "Tidak ikut Peringkat: " + e.sekaliWaktu + " Laba yang seperempatnya atau lebih berasal dari keuntungan sekali-waktu tidak adil dibandingkan dengan laba usaha rutin. ",
      el("a", { href: "metodologi.html#sekali-waktu", text: "Baca aturannya" }), "."]));

    // Angka utama
    function ubin(label, nilai, ket) {
      return el("li", { class: "ubin" }, [el("span", { class: "ubin-label", text: label }), el("strong", { class: "ubin-nilai", text: nilai }), ket ? el("span", { class: "ubin-ket", text: ket }) : null]);
    }
    var gl = tumbuhLaba(e), gp = tumbuhPendapatan(e), g9 = tumbuh(N[2025], N[2026]);
    akar.appendChild(el("h2", { class: "judul-profil-bagian", id: "angka-utama", text: "Angka utama" }));
    // Dewi & Nina (19 Nov, WCAG 1.3.1): empat ubin = satu kumpulan → daftar sungguhan (role="list" agar Safari tetap membacanya daftar).
    akar.appendChild(el("ul", { class: "kisi-ubin", role: "list", "aria-labelledby": "angka-utama" }, [
      ubin("Laba bersih 2025", strip(L[2025], rp), ada(L[2024]) && L[2024] < 0 ? "2024: rugi " + rp(-L[2024]) : (ada(gl) ? ubah(gl) + " dibanding 2024" : null)),
      ubin("Pendapatan 2025", strip(P[2025], rp), ada(gp) ? ubah(gp) + " dibanding 2024" : null),
      ubin("ROE 2025", strip(roe(e), persen), "Laba bersih ÷ ekuitas"),
      ubin("DER akhir 2025", strip(der(e), function (v) { return angka.format(v) + "x"; }), "Liabilitas ÷ ekuitas")
    ]));

    // Arif (IDE.md #7): posisi emiten di Peringkat, memakai peserta() dan rumus yang sama dengan halaman Peringkat
    function posisi(kunci, nama) {
      var k = KRITERIA[kunci];
      if (!syariahAktif(e)) return nama + ": tidak ikut Peringkat karena tidak tercatat di Daftar Efek Syariah terbaru.";
      if (e.periksaUlang) return nama + ": belum ikut Peringkat karena angkanya sedang dicek ulang atau tidak bisa dibandingkan secara adil (lihat catatan di bawah).";
      if (e.sekaliWaktu) return nama + ": tidak ikut Peringkat karena laba 2025 banyak ditopang keuntungan sekali-waktu (lihat aturan di Metodologi).";
      if (k.rupiahSaja && usd(e)) return nama + ": tidak ikut karena emiten ini melapor dalam dolar AS.";
      if (!ada(k.nilai(e))) return nama + ": belum ikut Peringkat karena datanya belum lengkap.";
      var urut = peserta(kunci).sort(function (a, b) { return k.nilai(b) - k.nilai(a); });
      var i = urut.findIndex(function (x) { return x.kode === e.kode; });
      return nama + ": urutan " + (i + 1) + " dari " + urut.length + " emiten (" + k.tampil(k.nilai(e)) + ").";
    }
    akar.appendChild(el("div", { class: "posisi-peringkat", role: "note" }, [
      el("strong", { text: "Posisi di Peringkat" }),
      el("ul", null, [el("li", { text: posisi("tumbuhLaba", "Pertumbuhan laba 2025 vs 2024") }), el("li", { text: posisi("roe", "ROE 2025") })]),
      el("p", { class: "catatan-metode" }, ["Urutan 1 = angka tertinggi di antara emiten dalam data kami. Ini gambaran data, bukan saran membeli atau menjual. ",
        el("a", { href: "peringkat.html", text: "Lihat Peringkat (10 teratas)" })])
    ]));

    var baris = [
      ["Laba bersih", L[2024], L[2025]],
      ["Pendapatan", P[2024], P[2025]],
      ["Liabilitas (akhir tahun)", null, e.liabilitas2025],
      ["Ekuitas (akhir tahun)", null, e.ekuitas2025]
    ];
    var tbody = el("tbody");
    baris.forEach(function (b) {
      tbody.appendChild(el("tr", null, [el("th", { scope: "row", text: b[0] }),
        el("td", { class: "angka", text: strip(b[1], rp) }), el("td", { class: "angka", text: strip(b[2], rp) })]));
    });
    akar.appendChild(el("div", { class: "tabel-wadah" }, [el("table", { class: "tabel-profil" }, [
      el("caption", { class: "keterangan-tabel", text: "Tahun buku 2024 dan 2025" + (usd(e) ? " (dolar AS)" : " (rupiah)") + ". Laba = laba yang diatribusikan kepada pemilik entitas induk." }),
      el("thead", null, [el("tr", null, [el("th", { scope: "col", text: "Pos" }), el("th", { scope: "col", class: "angka", text: "2024" }), el("th", { scope: "col", class: "angka", text: "2025" })])]),
      tbody
    ])]));
    akar.appendChild(el("p", { class: "catatan-metode", text: ada(g9)
      ? "Laba Januari–September: " + rp(N[2025]) + " (2025) → " + rp(N[2026]) + " (2026), " + ubah(g9) + ". Laporan kuartalan umumnya belum diaudit."
      : "Laba Januari–September 2026 belum kami masukkan: laporan kuartal III belum rilis atau angkanya belum bisa dipastikan." }));
    var sw9p = sekaliWaktu9b(e);
    if (sw9p) akar.appendChild(el("p", { class: "catatan-metode" }, [sw9p + " ", el("a", { href: "metodologi.html#sekali-waktu", text: "Baca aturannya" }), "."]));
    // Batang pembanding laba 9 bulan (IDE.md #10): CSS saja, angka tetap tertulis; hanya bila kedua angka positif.
    if (ada(g9) && N[2025] > 0 && N[2026] > 0) {
      var maks9 = Math.max(N[2025], N[2026]);
      var daftar9 = el("ul", { class: "batang9", "aria-label": "Perbandingan laba Januari–September 2025 dan 2026" });
      [2025, 2026].forEach(function (th) {
        var batang = el("span", { class: "batang9-isi" + (th === 2026 ? (N[2026] >= N[2025] ? " batang9-naik" : " batang9-turun") : ""), "aria-hidden": "true" });
        batang.style.width = Math.max(4, Math.round(N[th] / maks9 * 100)) + "%";
        daftar9.appendChild(el("li", { class: "batang9-baris" }, [
          el("span", { class: "batang9-label", text: "Jan–Sep " + th }),
          el("span", { class: "batang9-jalur" }, [batang]),
          el("span", { class: "batang9-angka", text: rp(N[th]) })
        ]));
      });
      akar.appendChild(daftar9);
    }

    // Dividen tunai tahun buku 2025 (Galih & Hana, Arif, 3 Nov): hanya angka bersumber, tanpa imbal hasil
    // (harga acuan belum ada). Kalimat netral: dividen lalu tidak menjamin dividen berikutnya.
    var dps = dividenTampil(e);
    if (dps) {
      akar.appendChild(el("p", { class: "catatan-metode baris-dividen" }, [
        el("strong", { text: "Dividen tunai tahun buku 2025: " + dps + " per saham. " }),
        "Sumber: ", el("a", { href: e.dpsSumber.url, target: "_blank", rel: "noopener", text: e.dpsSumber.judul, "aria-label": e.dpsSumber.judul + " (tab baru)" }), ". ",
        // Sari & Laras (4 Nov): emiten berlaporan dolar AS → jelaskan kenapa dividen tertulis dalam rupiah
        e.dpsRupiah ? "Dividen ini dibayar dalam rupiah; angkanya ditulis oleh sumber, bukan hasil konversi kami dari dolar AS. " : "",
        "Dividen yang sudah dibagikan tidak menjamin dividen tahun berikutnya. Ini data, bukan saran membeli atau menjual."
      ]));
    }

    akar.appendChild(bagianBanding(e));

    // Radar Risiko (rumus yang sama dengan radar.html)
    var s = periksa(e);
    akar.appendChild(el("h2", { class: "judul-profil-bagian", id: "radar-risiko", text: "Radar Risiko" }));
    var ul = el("ul", { class: "sinyal-daftar" });
    s.forEach(function (x) {
      ul.appendChild(kartuSinyal(x));
    });
    akar.appendChild(ul);

    // Kabar terbaru (Arif & Raka, 1 Nov): maksimal 3, sisanya di kabar.html
    var kabarIni = daftarKabar(e.kode);
    if (kabarIni.length) {
      akar.appendChild(el("h2", { class: "judul-profil-bagian", id: "kabar-terbaru", text: "Kabar terbaru" }));
      var ulKabar = el("ul", { class: "kabar-daftar" });
      kabarIni.slice(0, 3).forEach(function (k) { ulKabar.appendChild(kartuKabar(k, false)); });
      akar.appendChild(ulKabar);
      akar.appendChild(el("p", { class: "catatan-metode" }, [el("a", { href: "kabar.html", text: "Semua kabar emiten" })]));
    }

    // Sumber
    akar.appendChild(el("h2", { class: "judul-profil-bagian", id: "sumber-data", text: "Sumber data" }));
    var sumber = el("ul", { class: "daftar-sumber" });
    (e.sumber || []).forEach(function (x) {
      sumber.appendChild(el("li", null, [el("a", { href: x.url, target: "_blank", rel: "noopener", text: x.judul, "aria-label": x.judul + " (tab baru)" })]));
    });
    akar.appendChild(sumber);
    akar.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px" }, [
      "Profil ini menyajikan data, bukan saran membeli atau menjual. Cara kami menghitung tiap angka ada di ",
      el("a", { href: "metodologi.html", text: "halaman Metodologi" }), ". ",
      el("a", { href: "peringkat.html", text: "Kembali ke Peringkat" }), "."
    ]));

    // Arif + Dewi (IDE.md #21, 4 Nov): baris "Lompat ke" di atas profil. Dibuat setelah semua bagian ada,
    // jadi hanya menaut ke judul yang benar-benar tampil (Kabar tidak muncul bila emiten belum punya kabar).
    var tujuan = [["angka-utama", "Angka utama"], ["judul-banding", "Bandingkan"], ["radar-risiko", "Radar Risiko emiten ini"],
      ["kabar-terbaru", "Kabar"], ["sumber-data", "Sumber data"]];
    var ulLompat = el("ul");
    tujuan.forEach(function (t) {
      if (akar.querySelector("#" + t[0])) ulLompat.appendChild(el("li", null, [el("a", { href: "#" + t[0], text: t[1] })]));
    });
    akar.insertBefore(el("nav", { class: "lompat-ke", "aria-label": "Lompat ke bagian profil" }, [
      el("span", { class: "lompat-ke-label", text: "Lompat ke:" }), ulLompat
    ]), akar.firstChild);
    pasangIstilah(akar);
  }

  /* ---------- Kabar emiten (Arif & Raka, 1 Nov) ----------
     Data dari data/kabar.js. Hanya kabar untuk emiten yang ada di data kita. Tanpa simpanan. */
  var BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  function tanggalId(t) {
    var p = String(t).split("-");
    return parseInt(p[2], 10) + " " + BULAN[parseInt(p[1], 10) - 1] + " " + p[0];
  }
  function daftarKabar(kode) {
    return (window.KABAR || []).filter(function (k) {
      return (!kode || k.kode === kode) && EMITEN.some(function (e) { return e.kode === k.kode; });
    }).slice().sort(function (a, b) { return a.tanggal < b.tanggal ? 1 : a.tanggal > b.tanggal ? -1 : a.kode.localeCompare(b.kode); });
  }
  /* Label "Baru" (IDE.md #19, Arif & Dewi, 2 Nov): kabar bertanggal 0–3 hari sebelum tanggal perangkat.
     Berupa teks (bukan warna saja), tanpa animasi, tanpa simpanan. Tanggal tidak valid = bukan baru. */
  function kabarBaru(t, kini) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(t));
    if (!p) return false;
    var d = new Date(+p[1], +p[2] - 1, +p[3]);
    var h = kini || new Date();
    var hariIni = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    var selisih = Math.round((hariIni - d) / 86400000);
    return selisih >= 0 && selisih <= 3;
  }
  function kartuKabar(k, denganKode) {
    var e = EMITEN.find(function (x) { return x.kode === k.kode; });
    var kepala = [el("time", { datetime: k.tanggal, text: tanggalId(k.tanggal) }), el("span", { class: "kabar-jenis", text: k.jenis })];
    if (kabarBaru(k.tanggal)) kepala.unshift(el("span", { class: "kabar-baru", text: "Baru", title: "Kabar 3 hari terakhir" }));
    return el("li", { class: "kabar" }, [
      el("p", { class: "kabar-kepala" }, kepala),
      denganKode ? el("h3", { class: "kabar-judul" }, [
        el("a", { class: "kode tautan-kode", href: "emiten.html?kode=" + e.kode, text: e.kode, "aria-label": e.kode + ", profil emiten" }),
        el("span", { class: "nama-emiten", text: e.nama })
      ]) : null,
      el("p", { class: "kabar-isi", text: k.ringkas }),
      el("p", { class: "kabar-sumber" }, [el("a", { href: k.sumber.url, target: "_blank", rel: "noopener", text: k.sumber.judul + " (tab baru)" })])
    ]);
  }
  function renderKabar() {
    var akar = document.getElementById("kabar");
    if (!akar) return;
    var semua = daftarKabar();
    var jenisAda = (window.KABAR_JENIS || []).filter(function (j) { return semua.some(function (k) { return k.jenis === j; }); });
    var pilih = el("select", { id: "pilih-jenis" });
    pilih.appendChild(el("option", { value: "", text: "Semua jenis" }));
    jenisAda.forEach(function (j) { pilih.appendChild(el("option", { value: j, text: j })); });
    var ket = el("p", { class: "saring-ket", id: "ket-jenis", "aria-live": "polite" });
    var ul = el("ul", { class: "kabar-daftar" });
    akar.appendChild(el("div", { class: "pita-sumber", role: "note" }, [
      el("p", null, ["Kabar disalin ringkas dari berita atau pengumuman resmi; angka ditulis seperti di sumbernya. ",
        el("strong", { text: "Kabar bukan saran membeli atau menjual." })])
    ]));
    akar.appendChild(el("div", { class: "saring-sektor" }, [el("label", { for: "pilih-jenis", text: "Saring jenis kabar" }), pilih, ket]));
    akar.appendChild(ul);
    /* 10 kabar dulu, lalu "Tampilkan 10 kabar lagi" (IDE.md #20, Arif & Dewi, 3 Nov).
       Saringan bekerja pada semua kabar; ganti saringan = kembali ke 10. Fokus pindah ke kabar pertama
       yang baru muncul agar pengguna keyboard & pembaca layar tidak tertinggal. Tanpa simpanan. */
    var PER_HAL = 10, batas = PER_HAL;
    var lagi = el("button", { type: "button", class: "tombol tombol-lagi", id: "kabar-lagi" });
    akar.appendChild(el("p", { class: "kabar-lagi-baris" }, [lagi]));
    function tampilkan(fokusDari) {
      var j = pilih.value;
      var hasil = semua.filter(function (k) { return !j || k.jenis === j; });
      var tampil = hasil.slice(0, batas);
      tutupIstilah(false);
      ul.textContent = "";
      tampil.forEach(function (k) { ul.appendChild(kartuKabar(k, true)); });
      // Arif (7 Nov 17.09): kartu yang muncul lewat saringan atau "Tampilkan lagi" juga ditandai istilah.
      pasangIstilah(ul);
      var sisa = hasil.length - tampil.length;
      ket.textContent = (sisa > 0 ? "Menampilkan " + tampil.length + " dari " : "") + hasil.length + " kabar" +
        (j ? " jenis " + j : "") + ", terbaru di atas.";
      lagi.hidden = sisa <= 0;
      lagi.textContent = "Tampilkan " + Math.min(PER_HAL, sisa) + " kabar lagi (" + sisa + " tersisa)";
      if (fokusDari != null && ul.children[fokusDari]) {
        var tujuan = ul.children[fokusDari];
        tujuan.setAttribute("tabindex", "-1");
        tujuan.focus();
      }
    }
    pilih.addEventListener("change", function () { batas = PER_HAL; tampilkan(); });
    lagi.addEventListener("click", function () { var awal = batas; batas += PER_HAL; tampilkan(awal); });
    tampilkan();
    pasangIstilah(akar);
    // Dewi + Arif (8 Nov 14.10): kalimat pembuka Kabar kini ditandai lewat pasangIstilahKepala() di akhir berkas,
    // sehingga istilah yang sudah ditandai di kartu kabar (mis. "laporan keuangan") tidak ditandai dua kali.
  }

  /* ---------- Kabar terbaru di beranda (Arif & Dewi, IDE.md #16, 1 Nov) ----------
     3 kabar terbaru dari data/kabar.js dengan kartu yang sama seperti halaman Kabar.
     Tanpa JavaScript atau data kosong → bagian tetap tersembunyi. Tanpa simpanan. */
  function renderKabarBeranda() {
    var wadah = document.getElementById("kabar-beranda");
    if (!wadah) return;
    var terbaru = daftarKabar().slice(0, 3);
    if (!terbaru.length) return;
    var ul = el("ul", { class: "kabar-daftar" });
    terbaru.forEach(function (k) { ul.appendChild(kartuKabar(k, true)); });
    wadah.appendChild(el("div", { class: "wadah" }, [
      el("h2", { id: "judul-kabar-beranda", text: "Kabar terbaru" }),
      el("p", { class: "pengantar" }, ["Ringkasan pengumuman emiten syariah dalam data kami, lengkap dengan sumbernya. ",
        el("strong", { text: "Kabar bukan saran membeli atau menjual." })]),
      ul,
      el("p", { style: "margin-top:20px" }, [el("a", { href: "kabar.html", text: "Semua kabar" })])
    ]));
    wadah.hidden = false;
    pasangIstilah(wadah);
  }

  /* ---------- Beranda: tanda istilah di hero dan kartu "Alat bantu analisis" (Arif + Dewi, 8 Nov 17.08) ----------
     Satu himpunan bersama: tiap istilah ditandai sekali saja dari hero sampai kartu terakhir, agar kartu tidak sesak di HP.
     Judul, tautan, tombol, dan tabel mini tidak disentuh. */
  function istilahBeranda() {
    var hero = document.querySelector(".hero-teks > p");
    var kartu = document.querySelectorAll(".alat .panel > p:not([class]):not([style])");
    if (!hero || !kartu.length) return;
    var sudah = {};
    var catat = function (akar) {
      Array.prototype.forEach.call(akar.querySelectorAll("button.istilah"), function (b) { sudah[b.dataset.istilah] = true; });
    };
    pasangIstilah(hero, sudah); catat(hero);
    Array.prototype.forEach.call(kartu, function (p) { pasangIstilah(p, sudah); catat(p); });
  }

  /* ---------- Rujukan belajar ---------- */
  function renderRujukan() {
    var akar = document.getElementById("rujukan");
    if (!akar || !window.RUJUKAN) return;
    window.RUJUKAN.forEach(function (k) {
      var ul = el("ul", { class: "rujukan-daftar" });
      k.item.forEach(function (r) {
        ul.appendChild(el("li", null, [
          el("a", { href: r.url, target: "_blank", rel: "noopener", text: r.judul, "aria-label": r.judul + " (tab baru)" }),
          el("p", { text: r.ket })
        ]));
      });
      akar.appendChild(el("div", { class: "rujukan-kelompok" }, [el("h3", { text: k.kelompok }), ul]));
    });
  }

  /* ---------- Asisten AI (tim Arif) ---------- */
  // Ubah teks jawaban (markdown sederhana) menjadi elemen yang aman: tanpa innerHTML dari server.
  function teksKeElemen(teks) {
    var wadah = el("div", { class: "jawaban-isi" });
    var daftar = null;
    function sebaris(str, tujuan) {
      str.split(/(\*\*[^*]+\*\*)/g).forEach(function (bag) {
        if (/^\*\*[^*]+\*\*$/.test(bag)) tujuan.appendChild(el("strong", { text: bag.slice(2, -2) }));
        else if (bag) tujuan.appendChild(document.createTextNode(bag));
      });
    }
    teks.split(/\n+/).forEach(function (baris) {
      baris = baris.trim();
      if (!baris) return;
      var poin = baris.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
      if (poin) {
        if (!daftar) { daftar = el("ul"); wadah.appendChild(daftar); }
        var li = el("li"); sebaris(poin[1], li); daftar.appendChild(li);
      } else {
        daftar = null;
        var p = el("p"); sebaris(baris.replace(/^#+\s*/, ""), p); wadah.appendChild(p);
      }
    });
    return wadah;
  }

  function renderAsisten() {
    var akar = document.getElementById("asisten");
    if (!akar) return;
    var riwayat = [];
    var contoh = [
      "Apa bedanya saham syariah dan saham biasa?",
      "Bagaimana cara menghitung ROE? Beri contoh angka.",
      "Laba naik tapi harga saham turun, kenapa bisa begitu?",
      "Apa yang perlu saya periksa sebelum membeli saham pertama?"
    ];

    // Dewi & Nina (17 Nov 20.xx, audit pesan status WCAG 4.1.3): wilayah role="status" selalu ada sejak halaman dimuat;
    // pita di dalamnya yang disembunyikan/ditampilkan. Dulu pita sendiri ber-role status dan ber-hidden, sehingga
    // wilayahnya baru masuk pohon aksesibilitas bersamaan dengan pesannya dan pembaca layar bisa tidak mengumumkan.
    var status = el("div", { class: "pita-demo", hidden: "hidden" });
    var wadahStatus = el("div", { class: "status-asisten", role: "status", "aria-live": "polite" }, [status]);
    var log = el("div", { class: "obrolan", "aria-live": "polite", "aria-label": "Percakapan dengan asisten" });
    var chips = el("div", { class: "contoh-tanya" });
    // Dewi & Nina (18 Nov 08.xx, WCAG 3.3.1/3.3.2): petunjuk batas karakter tertulis, dan pesan salah isian
    // (pertanyaan kosong) tampil sebagai teks yang terhubung ke kotak tanya lewat aria-describedby.
    var area = el("textarea", { id: "kotak-tanya", rows: "3", maxlength: "600", placeholder: "Tulis pertanyaan Anda",
      "aria-describedby": "petunjuk-tanya galat-tanya" });
    var petunjuk = el("p", { id: "petunjuk-tanya", class: "petunjuk-isian", text: "Paling banyak 600 karakter. Tekan Enter untuk mengirim, Shift+Enter untuk baris baru." });
    var galat = el("p", { id: "galat-tanya", class: "galat-isian", role: "status", "aria-live": "polite" });
    var tombol = el("button", { class: "tombol tombol-gelap", type: "submit", text: "Kirim pertanyaan" });
    var hitung = el("span", { class: "hitung-karakter", text: "0/600" });
    var form = el("form", { class: "form-tanya" }, [
      el("label", { for: "kotak-tanya", class: "label-tanya", text: "Pertanyaan Anda" }),
      petunjuk, area, galat, el("div", { class: "form-bawah" }, [hitung, tombol])
    ]);

    // Dewi 17 Nov (audit fokus tertutup): peramban hanya menggulir kursor teks ke layar, sehingga saat Shift+Tab bagian atas
    // kotak tanya bisa terpotong. Bila kotak tidak tampil utuh, gulir secukupnya (tanpa animasi paksa, ikut pengaturan CSS).
    area.addEventListener("focus", function () {
      var r = area.getBoundingClientRect();
      if ((r.top < 0 || r.bottom > window.innerHeight) && r.height < window.innerHeight && area.scrollIntoView) {
        area.scrollIntoView({ block: "nearest" });
      }
    });

    contoh.forEach(function (c) {
      var b = el("button", { type: "button", class: "chip", text: c });
      b.addEventListener("click", function () { area.value = c; area.focus(); perbaruiHitung(); });
      chips.appendChild(b);
    });

    akar.appendChild(wadahStatus);
    akar.appendChild(log);
    akar.appendChild(el("p", { class: "label-tanya", text: "Coba tanyakan:" }));
    akar.appendChild(chips);
    akar.appendChild(form);
    akar.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px",
      text: "Asisten AI bisa keliru. Selalu cek angka di laporan keuangan resmi. Jawaban asisten bukan rekomendasi membeli atau menjual efek. Jangan menuliskan data pribadi seperti nomor KTP atau rekening." }));

    var salahKosong = false;
    function perbaruiHitung() {
      hitung.textContent = area.value.length + "/600";
      if (salahKosong && area.value.trim()) { salahKosong = false; area.removeAttribute("aria-invalid"); }
      if (area.value.length >= 600) galat.textContent = "Sudah 600 karakter, batas paling banyak. Ringkas pertanyaan bila perlu.";
      else if (!salahKosong) galat.textContent = "";
    }
    area.addEventListener("input", perbaruiHitung);
    area.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });

    function tambahPesan(peran, isiEl) {
      var kelas = "pesan pesan-" + peran;
      var label = peran === "pengguna" ? "Anda" : "Asisten";
      var p = el("div", { class: kelas }, [el("span", { class: "pesan-label", text: label }), isiEl]);
      log.appendChild(p);
      p.scrollIntoView({ block: "nearest", behavior: "smooth" });
      return p;
    }

    function setAktif(aktif, pesan) {
      area.disabled = !aktif; tombol.disabled = !aktif;
      if (pesan) { status.hidden = false; status.textContent = ""; status.appendChild(el("strong", { text: "Asisten belum aktif. " })); status.appendChild(document.createTextNode(pesan)); }
      else status.hidden = true;
    }

    fetch("api/tanya", { method: "GET" })
      .then(function (r) { return r.ok ? r.json() : { aktif: false }; })
      .then(function (d) { if (!d.aktif) setAktif(false, "Kami sedang menyiapkan layanan ini. Sementara itu, silakan pelajari materi di halaman Belajar."); })
      .catch(function () { setAktif(false, "Layanan asisten tidak bisa dihubungi dari halaman ini."); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = area.value.trim();
      if (!q && !tombol.disabled) {
        salahKosong = true; area.setAttribute("aria-invalid", "true");
        galat.textContent = "Pertanyaan masih kosong. Tulis pertanyaan Anda dulu, lalu kirim.";
        area.focus();
      }
      if (!q || tombol.disabled) return;
      tambahPesan("pengguna", el("p", { text: q }));
      area.value = ""; perbaruiHitung();
      tombol.disabled = true; tombol.textContent = "Menunggu jawaban";
      var tunggu = tambahPesan("asisten", el("p", { class: "mengetik", text: "Sedang menyusun jawaban" }));

      fetch("api/tanya", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pertanyaan: q, riwayat: riwayat })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (h) {
          tunggu.remove();
          if (h.ok && h.d.jawaban) {
            tambahPesan("asisten", teksKeElemen(h.d.jawaban));
            riwayat.push({ peran: "pengguna", teks: q }, { peran: "asisten", teks: h.d.jawaban });
            riwayat = riwayat.slice(-6);
          } else {
            tambahPesan("asisten", el("p", { class: "pesan-galat", text: h.d.galat || "Asisten tidak bisa menjawab saat ini. Coba lagi sebentar lagi." }));
          }
        })
        .catch(function () {
          tunggu.remove();
          tambahPesan("asisten", el("p", { class: "pesan-galat", text: "Koneksi terputus. Periksa internet Anda lalu kirim ulang pertanyaan." }));
        })
        .then(function () { tombol.disabled = false; tombol.textContent = "Kirim pertanyaan"; area.focus(); });
    });
  }

  /* ---------- Kamus istilah di tempat (tim Arif, usulan Kirana #3) ---------- */
  var ISTILAH = window.ISTILAH || [];
  var JUDUL_MODUL = {};
  MODUL.forEach(function (m) { JUDUL_MODUL[m.id] = m.judul; });
  var LEWATI = /^(A|BUTTON|H1|H2|H3|SCRIPT|STYLE|CODE|SELECT|OPTION|TEXTAREA|LABEL)$/;
  var POLA = [];
  ISTILAH.forEach(function (t, i) {
    t.pola.forEach(function (p) {
      var aman = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      POLA.push({ i: i, re: new RegExp("(^|[^A-Za-z0-9À-ÿ])(" + aman + ")(?![A-Za-z0-9À-ÿ])", t.besarKecil ? "" : "i") });
    });
  });

  var kotak = null, aktif = null;
  function tutupIstilah(kembalikanFokus) {
    if (!aktif) return;
    var b = aktif; aktif = null;
    b.setAttribute("aria-expanded", "false");
    b.removeAttribute("aria-controls");
    kotak.hidden = true;
    if (kembalikanFokus) b.focus();
  }
  function letakkan() {
    if (aktif && !document.body.contains(aktif)) { aktif = null; if (kotak) kotak.hidden = true; }
    if (!aktif) return;
    var r = aktif.getBoundingClientRect(), lebar = Math.min(320, window.innerWidth - 32);
    kotak.style.width = lebar + "px";
    kotak.style.left = Math.max(16, Math.min(r.left, window.innerWidth - lebar - 16)) + "px";
    var tinggi = kotak.offsetHeight;
    var bawah = r.bottom + 8 + tinggi <= window.innerHeight || r.top - 8 - tinggi < 0;
    kotak.style.top = (bawah ? r.bottom + 8 : r.top - 8 - tinggi) + "px";
  }
  function bukaIstilah(b) {
    if (aktif === b) { tutupIstilah(false); return; }
    tutupIstilah(false);
    var t = ISTILAH[+b.dataset.istilah];
    if (!kotak) {
      kotak = el("div", { class: "kotak-istilah", id: "kotak-istilah", role: "region", "aria-label": "Penjelasan istilah" });
      kotak.addEventListener("keydown", function (ev) { if (ev.key === "Escape") tutupIstilah(true); });
    }
    kotak.innerHTML = "";
    kotak.appendChild(el("strong", { text: t.istilah }));
    kotak.appendChild(el("p", { text: t.arti }));
    if (t.pelajaran && JUDUL_MODUL[t.pelajaran]) kotak.appendChild(el("a", {
      href: "pelajaran.html?m=" + t.pelajaran, text: "Pelajari lebih lanjut: " + JUDUL_MODUL[t.pelajaran]
    }));
    // IDE.md #23: tautan ke Kamus lengkap, kecuali bila pembaca sudah di halaman Belajar
    if (!document.getElementById("kamus-istilah")) kotak.appendChild(el("a", {
      href: "belajar.html#kamus", class: "kotak-istilah-kamus", text: "Lihat semua istilah"
    }));
    // Kotak diletakkan tepat setelah tombol agar urutan Tab tetap wajar (tombol → tautan di kotak)
    b.parentNode.insertBefore(kotak, b.nextSibling);
    kotak.hidden = false;
    aktif = b;
    b.setAttribute("aria-expanded", "true");
    // Nina & Tegar (12 Nov 17.09): aria-controls hanya dipasang saat kotak ada & terbuka,
    // agar tidak menunjuk id yang belum ada (audit tools/audit-aksesibel.js).
    b.setAttribute("aria-controls", "kotak-istilah");
    letakkan();
  }

  // Pilih istilah yang muncul paling awal di teks. Bila dua istilah mulai di tempat yang sama,
  // pilih yang lebih panjang ("Pendapatan tidak halal" > "Pendapatan"). Diuji di tests/cek.mjs (Nina, 6 Nov).
  function pilihIstilah(pola, teks, dipakai) {
    var terbaik = null;
    pola.forEach(function (p) {
      if (dipakai[p.i]) return;
      var m = p.re.exec(teks);
      if (!m) return;
      var mulai = m.index + m[1].length;
      if (!terbaik || mulai < terbaik.mulai || (mulai === terbaik.mulai && m[2].length > terbaik.teks.length))
        terbaik = { i: p.i, mulai: mulai, teks: m[2] };
    });
    return terbaik;
  }

  // Beri tanda istilah di dalam wadah: setiap istilah hanya ditandai sekali per wadah.
  // Tandai kalimat pembuka di kepala halaman gelap; lewati istilah yang sudah ditandai di <main> di luar kepala.
  function pasangIstilahKepala() {
    var p = document.querySelector(".judul-halaman .wadah > p");
    if (!p) return;
    var sudah = {};
    Array.prototype.forEach.call(document.querySelectorAll("main button.istilah"), function (b) {
      if (!b.closest(".judul-halaman")) sudah[b.dataset.istilah] = true;
    });
    pasangIstilah(p, sudah);
  }

  function pasangIstilah(wadah, sudah) {
    if (!wadah || !POLA.length) return;
    var dipakai = {}, simpul = [];
    if (sudah) Object.keys(sudah).forEach(function (k) { dipakai[k] = true; });
    var jalan = document.createTreeWalker(wadah, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        for (var p = n.parentNode; p && p !== wadah; p = p.parentNode)
          if (LEWATI.test(p.nodeName) || (p.classList && p.classList.contains("kotak-istilah"))) return NodeFilter.FILTER_REJECT;
        return /\S/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    while (jalan.nextNode()) simpul.push(jalan.currentNode);
    simpul.forEach(function (n) {
      while (n) {
        var terbaik = pilihIstilah(POLA, n.nodeValue, dipakai);
        if (!terbaik) break;
        dipakai[terbaik.i] = true;
        var sisa = n.splitText(terbaik.mulai);
        var lanjut = sisa.splitText(terbaik.teks.length);
        var b = el("button", { type: "button", class: "istilah", "aria-expanded": "false",
          title: "Apa itu " + ISTILAH[terbaik.i].istilah + "?", text: terbaik.teks });
        b.dataset.istilah = String(terbaik.i);
        sisa.parentNode.replaceChild(b, sisa);
        n = lanjut;
      }
    });
    aturIstilahKepalaKartu(wadah);
  }

  // Arif + Nina (7 Nov 19.09): di HP, Peringkat tampil sebagai kartu dan kepala tabel disembunyikan.
  // Tombol istilah di kepala yang tersembunyi tidak boleh tetap bisa difokus keyboard (fokus jadi tak terlihat).
  var KARTU_HP = window.matchMedia ? window.matchMedia("(max-width: 600px)") : null;
  function aturIstilahKepalaKartu(akar) {
    var sembunyi = !!(KARTU_HP && KARTU_HP.matches);
    (akar || document).querySelectorAll(".tabel-kartu thead button.istilah").forEach(function (b) {
      if (sembunyi) b.setAttribute("tabindex", "-1"); else b.removeAttribute("tabindex");
    });
  }
  if (KARTU_HP) {
    var gantiKartu = function () { aturIstilahKepalaKartu(document); };
    if (KARTU_HP.addEventListener) KARTU_HP.addEventListener("change", gantiKartu);
    else if (KARTU_HP.addListener) KARTU_HP.addListener(gantiKartu);
  }

  document.addEventListener("click", function (ev) {
    var b = ev.target.closest && ev.target.closest("button.istilah");
    if (b) { bukaIstilah(b); return; }
    if (aktif && kotak && !kotak.contains(ev.target)) tutupIstilah(false);
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && aktif) tutupIstilah(true); });
  // Dewi & Nina (17 Nov 18.xx, WCAG 1.4.13): tautan "Langsung ke isi" muncul saat difokus dan menutupi logo.
  // Escape menyembunyikannya tanpa memindah fokus; muncul lagi saat difokus berikutnya.
  Array.prototype.forEach.call(document.querySelectorAll("a.lompat"), function (a) {
    a.addEventListener("keydown", function (ev) { if (ev.key === "Escape") a.classList.add("lompat-tutup"); });
    a.addEventListener("blur", function () { a.classList.remove("lompat-tutup"); });
  });
  // Dewi & Nina (17 Nov 10.xx, WCAG 2.4.11): kotak istilah melayang (fixed) bisa menutupi elemen berikutnya yang
  // dituju Tab. Bila fokus pindah keluar dari tombol istilah & kotaknya, kotak ditutup (fokus tidak dipindahkan).
  document.addEventListener("focusin", function (ev) {
    if (aktif && kotak && ev.target !== aktif && !kotak.contains(ev.target)) tutupIstilah(false);
  });
  window.addEventListener("resize", letakkan);
  window.addEventListener("scroll", letakkan, { passive: true });
  document.addEventListener("scroll", letakkan, { passive: true, capture: true });

  /* ---------- Beranda: Istilah hari ini (Arif, IDE.md #15; teks dari kamus yang sudah ditinjau Sari, Laras, Hana) ----------
     Satu istilah dari data/istilah.js, dipilih dari tanggal di perangkat (berganti tiap hari, sama sepanjang hari).
     Tanpa simpanan dan tanpa server. Tanpa JavaScript atau kamus kosong → bagian tetap tersembunyi. */
  function indeksHariIni(jumlah, tgl) {
    var d = tgl || new Date();
    var hari = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return ((hari % jumlah) + jumlah) % jumlah;
  }
  function renderIstilahHari() {
    var wadah = document.getElementById("istilah-hari");
    if (!wadah || !ISTILAH.length) return;
    var t = ISTILAH[indeksHariIni(ISTILAH.length)];
    var kartu = el("div", { class: "panel kartu-istilah-hari" }, [
      el("p", { class: "label-istilah-hari", text: "Istilah hari ini" }),
      el("h2", { id: "judul-istilah-hari", text: t.istilah }),
      el("p", { text: t.arti })
    ]);
    if (t.pelajaran && JUDUL_MODUL[t.pelajaran]) kartu.appendChild(el("p", { class: "tautan-istilah-hari" }, [
      el("a", { href: "pelajaran.html?m=" + t.pelajaran, text: "Pelajari lebih lanjut: " + JUDUL_MODUL[t.pelajaran] })
    ]));
    kartu.appendChild(el("p", { class: "catatan-istilah-hari", text: "Berganti setiap hari. Ketuk istilah bergaris putus-putus di halaman lain untuk penjelasan serupa." }));
    wadah.appendChild(el("div", { class: "wadah" }, [kartu]));
    wadah.hidden = false;
  }

  /* ---------- Belajar: Kamus istilah lengkap (Arif + Dewi, IDE.md #22) ----------
     Semua istilah dari data/istilah.js (tanpa salinan teks), urut abjad, dengan kotak cari sederhana. */
  function renderKamus() {
    var wadah = document.getElementById("kamus-istilah");
    if (!wadah || !ISTILAH.length) return;
    var urut = ISTILAH.slice().sort(function (a, b) { return a.istilah.localeCompare(b.istilah, "id"); });
    var nomor = {};
    MODUL.forEach(function (m, i) { nomor[m.id] = i + 1; });
    var cari = el("input", { type: "search", id: "cari-istilah", autocomplete: "off", placeholder: "Contoh: dividen" });
    var info = el("p", { class: "info-kamus", role: "status", "aria-live": "polite" });
    var daftar = el("dl", { class: "daftar-kamus" });
    var kosong = el("p", { class: "kosong-kamus", text: "Tidak ada istilah yang cocok. Coba kata lain." });
    kosong.hidden = true;
    var baris = urut.map(function (t) {
      var dt = el("dt", { text: t.istilah });
      var dd = el("dd", {}, [el("p", { text: t.arti })]);
      if (t.pelajaran && JUDUL_MODUL[t.pelajaran]) dd.appendChild(el("p", { class: "tautan-kamus" }, [
        el("a", { href: "pelajaran.html?m=" + t.pelajaran, text: "Pelajari di: Pelajaran " + nomor[t.pelajaran] + ", " + JUDUL_MODUL[t.pelajaran] })
      ]));
      daftar.appendChild(dt); daftar.appendChild(dd);
      return { dt: dt, dd: dd, teks: (t.istilah + " " + t.arti + " " + t.pola.join(" ")).toLowerCase() };
    });
    function saring() {
      var q = cari.value.trim().toLowerCase(), n = 0;
      baris.forEach(function (b) {
        var cocok = !q || b.teks.indexOf(q) !== -1;
        b.dt.hidden = b.dd.hidden = !cocok;
        if (cocok) n++;
      });
      kosong.hidden = n > 0;
      info.textContent = q ? n + " dari " + baris.length + " istilah cocok" : baris.length + " istilah";
    }
    cari.addEventListener("input", saring);
    wadah.textContent = "";
    wadah.appendChild(el("div", { class: "cari-kamus" }, [el("label", { for: "cari-istilah", text: "Cari istilah" }), cari]));
    wadah.appendChild(info);
    wadah.appendChild(daftar);
    wadah.appendChild(kosong);
    saring();
  }

  /* ---------- Metodologi: tandai istilah kamus di isi utama (Arif + Dewi, IDE.md #24) ----------
     Hanya artikel; judul, tautan, dan daftar isi dilewati (LEWATI). Setiap istilah sekali per halaman. */
  function istilahMetodologi() {
    if (!document.getElementById("isi-halaman")) return;
    pasangIstilah(document.querySelector("main .artikel"));
  }

  /* ---------- Metodologi: tandai bagian yang sedang dibaca (Dewi, IDE.md #8) ---------- */
  function renderIsiHalaman() {
    var nav = document.getElementById("isi-halaman");
    if (!nav || !("IntersectionObserver" in window)) return;
    var tautan = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var judul = tautan.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
      .filter(Boolean);
    function tandai(id) {
      tautan.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
    function perbarui() {
      // Bagian aktif = judul terakhir yang sudah melewati sepertiga atas layar
      var batas = window.innerHeight / 3, aktif = null;
      judul.forEach(function (h) { if (h.getBoundingClientRect().top <= batas) aktif = h.id; });
      if (aktif) tandai(aktif); else tautan.forEach(function (a) { a.removeAttribute("aria-current"); });
    }
    var io = new IntersectionObserver(perbarui, { rootMargin: "0px 0px -66% 0px" });
    judul.forEach(function (h) { io.observe(h); });
    window.addEventListener("hashchange", perbarui);
    perbarui();
  }

  /* ---------- Tandai menu aktif ---------- */
  /* Vercel memakai cleanUrls: alamat tayang "/belajar", bukan "/belajar.html". Akhiran .html dibuang di kedua sisi
     agar menu aktif tetap tertandai di situs (WCAG 2.4.8; Dewi & Nina, 19 Nov 18.xx). */
  function tandaiMenu() {
    var hal = (location.pathname.split("/").pop() || "index").replace(/\.html$/, "");
    if (hal === "pelajaran") hal = "belajar";
    document.querySelectorAll(".nav a").forEach(function (a) {
      if ((a.getAttribute("href") || "").replace(/\.html$/, "") === hal) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------- Agenda IPO & Dividen (Arif + Dewi, 19 Nov 2026; proyek prioritas Rafinza) ----------
     Data dari data/agenda.js. Kartu diurutkan dari tanggal penting berikutnya yang paling dekat.
     Acara yang semua tanggalnya sudah lewat pindah ke "Baru saja lewat" (maks. 14 hari), lebih lama disembunyikan.
     Hitung mundur memakai tanggal perangkat. Tanpa kirim data (tanda "baru" di menu memakai localStorage, lihat tandaAgendaBaru). Agenda = jadwal, bukan saran. */
  var AGENDA_LEWAT_MAKS = 14;
  var PENJELASAN_AGENDA = {
    penawaranAwal: ["Penawaran awal (bookbuilding)", "Calon investor menyampaikan minat dan harga yang diinginkan, dalam kisaran harga yang ditetapkan. Belum membayar."],
    penawaranUmum: ["Penawaran umum", "Masa pemesanan saham di harga final, misalnya lewat e-IPO melalui sekuritas. Dana pesanan disiapkan di RDN."],
    penjatahan: ["Penjatahan", "Saham dibagikan kepada pemesan. Bila pesanan melebihi saham yang ditawarkan, pemesan bisa mendapat lebih sedikit dari yang dipesan; sisa dana dikembalikan."],
    pencatatan: ["Pencatatan di bursa", "Hari pertama saham bisa diperdagangkan di Bursa Efek Indonesia."],
    cum: ["Cum date", "Hari terakhir membeli saham di pasar reguler agar tercatat berhak atas dividen ini."],
    ex: ["Ex date", "Mulai hari ini, pembeli saham tidak lagi berhak atas dividen ini. Harga saham biasanya menyesuaikan."],
    recording: ["Recording date", "Tanggal pencatatan pemegang saham yang berhak menerima dividen."],
    pembayaran: ["Tanggal pembayaran", "Dividen dikirim ke RDN pemegang saham yang berhak, setelah dipotong pajak."]
  };
  function hariDari(t, kini) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(t));
    if (!p) return null;
    var h = kini || new Date();
    var hariIni = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    return Math.round((new Date(+p[1], +p[2] - 1, +p[3]) - hariIni) / 86400000);
  }
  function teksMundur(n) {
    if (n === 0) return "hari ini";
    if (n === 1) return "besok";
    if (n === -1) return "kemarin";
    return n > 0 ? n + " hari lagi" : -n + " hari lalu";
  }
  // Ubah satu entri data jadi daftar tanggal [{kunci, tanggal}] berurutan.
  function tanggalAgenda(a, jenis) {
    var t = a.tanggal || {}, d = [];
    if (jenis === "ipo") {
      if (t.penawaranAwal) d.push({ kunci: "penawaranAwal", tanggal: t.penawaranAwal.mulai, sampai: t.penawaranAwal.selesai });
      if (t.penawaranUmum) d.push({ kunci: "penawaranUmum", tanggal: t.penawaranUmum.mulai, sampai: t.penawaranUmum.selesai });
      d.push({ kunci: "penjatahan", tanggal: t.penjatahan }, { kunci: "pencatatan", tanggal: t.pencatatan });
    } else {
      ["cum", "ex", "recording", "pembayaran"].forEach(function (k) { d.push({ kunci: k, tanggal: t[k] }); });
    }
    return d.filter(function (x) { return x.tanggal; });
  }
  function susunAgenda(kini) {
    var semua = [];
    (window.AGENDA_IPO || []).forEach(function (a) { semua.push({ jenis: "ipo", data: a, tgl: tanggalAgenda(a, "ipo") }); });
    (window.AGENDA_DIVIDEN || []).forEach(function (a) { semua.push({ jenis: "dividen", data: a, tgl: tanggalAgenda(a, "dividen") }); });
    var depan = [], lewat = [];
    semua.forEach(function (x) {
      if (!x.tgl.length) return;
      // Tanggal dianggap masih berjalan sampai hari "sampai" (untuk masa penawaran).
      var berikut = x.tgl.filter(function (d) { return hariDari(d.sampai || d.tanggal, kini) >= 0; })[0];
      if (berikut) { x.kunciUrut = berikut.tanggal; x.berikut = berikut; depan.push(x); return; }
      var akhir = x.tgl[x.tgl.length - 1], n = hariDari(akhir.sampai || akhir.tanggal, kini);
      if (n >= -AGENDA_LEWAT_MAKS) { x.kunciUrut = akhir.sampai || akhir.tanggal; lewat.push(x); }
    });
    depan.sort(function (a, b) { return a.kunciUrut < b.kunciUrut ? -1 : a.kunciUrut > b.kunciUrut ? 1 : 0; });
    lewat.sort(function (a, b) { return a.kunciUrut < b.kunciUrut ? 1 : a.kunciUrut > b.kunciUrut ? -1 : 0; });
    return { depan: depan, lewat: lewat };
  }
  /* Arif + Dewi (20 Nov 2026, IDE.md #37): tiap kartu Agenda punya id stabil (mis. dividen-toto-2026-interim, ipo-anda)
     agar satu jadwal bisa dibagikan lewat alamat halaman Agenda + "#" + id. Id hanya dari kode/nama/jenis/tahun buku di data. */
  function slugAgenda(t) {
    return String(t == null ? "" : t).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function idKartuAgenda(x) {
    var a = x.data || {};
    if (x.jenis === "ipo") return "ipo-" + (slugAgenda(a.kode || a.nama) || "tanpa-nama");
    return ["dividen", slugAgenda(a.kode) || "tanpa-kode", slugAgenda(a.tahunBuku), slugAgenda(a.jenis)].filter(Boolean).join("-");
  }
  // Tombol "Salin tautan" per kartu, pola sama dengan tombolSalin di profil (Clipboard API, cadangan kotak teks terpilih).
  // Tanpa id tetap (bisa banyak kartu), tanpa simpanan, tanpa layanan luar. Pesan tetap sampai tombol ditekan lagi.
  function tombolSalinKartu(alamat, papan, label) {
    var info = el("p", { class: "info-salin", role: "status", "aria-live": "polite" });
    var tombol = el("button", { type: "button", class: "tombol tombol-salin tombol-salin-kartu", text: "Salin tautan",
      "aria-label": "Salin tautan kartu ini: " + label });
    var kotak = el("input", { type: "text", class: "alamat-salin", readonly: "", hidden: "", "aria-label": "Alamat kartu " + label });
    kotak.value = alamat;
    function cadangan() {
      kotak.hidden = false;
      kotak.focus();
      kotak.select();
      info.textContent = "Tautan belum bisa disalin otomatis. Alamatnya sudah dipilih di kotak ini: salin dengan Ctrl+C, atau tekan lama lalu Salin.";
    }
    tombol.addEventListener("click", function () {
      if (!papan || typeof papan.writeText !== "function") { cadangan(); return; }
      var janji;
      try { janji = papan.writeText(alamat); } catch (err) { cadangan(); return; }
      Promise.resolve(janji).then(function () {
        kotak.hidden = true;
        info.textContent = "Tautan kartu " + label + " disalin.";
      }, cadangan);
    });
    return el("div", { class: "salin-profil salin-kartu" }, [tombol, kotak, info]);
  }
  /* Dewi + Sari (20 Nov 2026, IDE.md #38): satu baris contoh hitungan dividen per lot di kartu Agenda, dihitung dari `dps`
     yang sama dengan baris di atasnya. Dolar AS tetap US$ (tanpa konversi kurs). Hanya contoh hitungan, bukan perkiraan
     keuntungan dan bukan ajakan (ditinjau Hana). Kata "lot" dijadikan tombol istilah di setiap kartu. */
  var LEMBAR_PER_LOT = 100;
  var angkaContoh = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 4 });
  function contohDividenLot(a) {
    if (typeof a.dps !== "number" || !(a.dps > 0)) return null;
    var usd = a.mataUang === "USD", awal = usd ? "US$" : "Rp";
    var total = Math.round(a.dps * LEMBAR_PER_LOT * 1e6) / 1e6;
    var p = el("p", { class: "agenda-contoh" }, [el("span", { class: "agenda-contoh-label", text: "Contoh hitungan:" }),
      " 1 lot (" + LEMBAR_PER_LOT + " saham) \u00d7 " + awal + angkaContoh.format(a.dps) + " = " + awal + angkaContoh.format(total) + " sebelum pajak."]);
    // Hanya istilah "lot" yang ditandai di baris ini; istilah lain sudah ditandai di bagian kartu yang lain.
    var iLot = ISTILAH.findIndex(function (t) { return t.istilah === "Lot"; }), sudah = {};
    if (iLot >= 0) { ISTILAH.forEach(function (t, i) { if (i !== iLot) sudah[i] = true; }); pasangIstilah(p, sudah); }
    return p;
  }
  function kartuAgenda(x, kini, idK) {
    var a = x.data, ipo = x.jenis === "ipo";
    idK = idK || idKartuAgenda(x);
    var e = !ipo && (typeof EMITEN !== "undefined") && EMITEN.find(function (z) { return z.kode === a.kode; });
    var judul = ipo
      ? [el("span", { class: "kode", text: a.kode || "Kode belum ada" }), el("span", { class: "nama-emiten", text: a.nama })]
      : [e ? el("a", { class: "kode tautan-kode", href: "emiten.html?kode=" + e.kode, text: e.kode, "aria-label": e.kode + ", profil emiten" })
           : el("span", { class: "kode", text: a.kode }),
         el("span", { class: "nama-emiten", text: "Dividen " + a.jenis + " tahun buku " + a.tahunBuku })];
    var kepala = [el("span", { class: "kabar-jenis", text: ipo ? "IPO syariah" : "Dividen" })];
    if (x.berikut) {
      var n = hariDari(x.berikut.tanggal, kini);
      var namaB = PENJELASAN_AGENDA[x.berikut.kunci][0];
      kepala.push(el("span", { class: "agenda-mundur", text: n < 0 && x.berikut.sampai
        ? namaB + " sedang berjalan" : namaB + " " + teksMundur(n) }));
    } else kepala.push(el("span", { class: "agenda-mundur agenda-lewat", text: "Sudah lewat" }));
    var info = [];
    if (ipo) {
      var hg = a.harga || {};
      if (hg.final != null) info.push("Harga final Rp" + angka.format(hg.final) + " per saham.");
      else if (hg.kisaranBawah != null) info.push("Kisaran harga Rp" + angka.format(hg.kisaranBawah) + "–Rp" + angka.format(hg.kisaranAtas) + " per saham.");
      if (a.sektor) info.push("Sektor: " + a.sektor + ".");
    } else {
      info.push("Dividen " + (a.mataUang === "USD" ? "US$" + angka2.format(a.dps) : "Rp" + angka2.format(a.dps)) +
        " per saham (sebelum pajak). Tercatat di Daftar Efek Syariah periode berjalan, baris " + a.desBaris + ".");
    }
    var ul = el("ol", { class: "agenda-tanggal" });
    x.tgl.forEach(function (d) {
      var p = PENJELASAN_AGENDA[d.kunci], n = hariDari(d.sampai || d.tanggal, kini);
      var teksT = tanggalId(d.tanggal) + (d.sampai && d.sampai !== d.tanggal ? " – " + tanggalId(d.sampai) : "");
      ul.appendChild(el("li", { class: n < 0 ? "agenda-t-lewat" : null }, [
        el("p", { class: "agenda-t-kepala" }, [
          el("strong", { text: p[0] }), " ",
          el("time", { datetime: d.tanggal, text: teksT }),
          el("span", { class: "agenda-t-mundur", text: " · " + (n < 0 ? "sudah lewat" : hariDari(d.tanggal, kini) < 0 ? "sedang berjalan" : teksMundur(hariDari(d.tanggal, kini))) })
        ])
      ]));
    });
    var sumber = el("ul", { class: "agenda-sumber" });
    (ipo ? [a.buktiSyariah].concat(a.sumber || []) : a.sumber || []).forEach(function (s) {
      if (s && s.url) sumber.appendChild(el("li", null, [el("a", { href: s.url, target: "_blank", rel: "noopener", text: s.judul + " (tab baru)" })]));
    });
    return el("li", { class: "kabar agenda" + (x.berikut ? "" : " agenda-sudah"), id: idK, tabindex: "-1" }, [
      el("p", { class: "kabar-kepala" }, kepala),
      el("h3", { class: "kabar-judul" }, judul),
      el("p", { class: "kabar-isi", text: info.join(" ") }),
      ipo ? null : contohDividenLot(a),
      ul,
      /* Dewi + Kirana (20 Nov 2026, temuan tinjauan #37): kalender, "Salin tautan", dan "Sumber (n)" dalam satu baris aksi
         yang boleh turun baris (flex-wrap). Di layar lebar ketiganya sebaris; di 390px tombol kalender penuh satu baris lalu
         "Salin tautan" sejajar "Sumber (n)". Urutan DOM = urutan tampil = urutan Tab. */
      el("div", { class: "agenda-aksi" }, [
        tombolKalender(x, kini),
        tombolSalinKartu(dasarAlamatAgenda() + "#" + idK, papanKlipAgenda(),
          ipo ? (a.kode || a.nama) : a.kode + " dividen " + a.jenis + " " + a.tahunBuku),
        /* Arif + Dewi (21 Nov 2026, IDE.md #42): bila kode dividen ada di data 32 emiten kami, satu tautan biasa ke profil
           (laba, DPS tahun lalu, Radar Risiko). Bila tidak ada, tidak ditampilkan agar tidak ada tautan mati. */
        e ? el("a", { class: "tombol tombol-salin tautan-profil-kartu", href: "emiten.html?kode=" + e.kode,
          text: "Profil " + e.kode, "aria-label": "Profil emiten " + e.kode + (e.nama ? ", " + e.nama : "") }) : null,
        // Dewi (20 Nov 2026, IDE.md #36): daftar sumber dilipat agar kartu lebih pendek; jumlah sumber tetap terlihat.
        el("details", { class: "agenda-sumber-lipat" }, [
          el("summary", { class: "agenda-sumber-judul", text: "Sumber (" + sumber.children.length + ")" }),
          sumber
        ])
      ])
    ]);
  }
  /* ---------- Tambahkan ke kalender (Arif + Tegar, 20 Nov 2026; proyek prioritas Agenda) ----------
     Berkas .ics dibuat di peramban (Blob) dan langsung diunduh: tidak ada data yang dikirim ke mana pun, tanpa server,
     tanpa akun. Satu acara sehari penuh untuk tiap tanggal penting yang belum lewat, dengan pengingat sehari sebelumnya
     pukul 09.00 (waktu perangkat), sehingga aplikasi kalender di HP yang mengingatkan.
     Tegar: semua teks melewati escIcs() (RFC 5545: \ ; , dan baris baru di-escape, karakter kendali dibuang) dan setiap
     baris dilipat ≤75 oktet, sehingga isi data tidak bisa menyisipkan baris atau properti baru. UID hanya huruf/angka/-. */
  var ICS_ALAMAT = "https://candra-analis.vercel.app/agenda";
  function escIcs(s) {
    return String(s == null ? "" : s)
      .replace(/[\u0000-\u0009\u000b\u000c\u000e-\u001f\u007f]/g, "")
      .replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,")
      .replace(/\r\n|\r|\n/g, "\\n");
  }
  // Lipat satu baris konten menjadi potongan ≤75 oktet UTF-8 (baris lanjutan diawali satu spasi).
  function lipatIcs(baris) {
    var hasil = [], kini = "", oktet = 0, batas = 75;
    Array.from(baris).forEach(function (ch) {
      var c = ch.codePointAt(0), n = c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
      if (oktet + n > batas) { hasil.push(kini); kini = " "; oktet = 1; batas = 75; }
      kini += ch; oktet += n;
    });
    hasil.push(kini);
    return hasil.join("\r\n");
  }
  function tglIcs(t, tambah) {
    var p = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(t));
    if (!p) return null;
    var d = new Date(Date.UTC(+p[1], +p[2] - 1, +p[3] + (tambah || 0)));
    return d.getUTCFullYear() + ("0" + (d.getUTCMonth() + 1)).slice(-2) + ("0" + d.getUTCDate()).slice(-2);
  }
  function uidIcs(s) { return String(s).replace(/[^A-Za-z0-9-]/g, "-"); }
  // Susun isi berkas .ics untuk satu kartu agenda (x dari susunAgenda). Hanya tanggal yang belum lewat.
  function buatIcs(x, kini) {
    var a = x.data, ipo = x.jenis === "ipo", h = kini || new Date();
    var nama = ipo ? (a.kode ? a.kode + " (" + a.nama + ")" : a.nama) : a.kode;
    var cap = h.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    var sumber = (ipo ? [a.buktiSyariah].concat(a.sumber || []) : a.sumber || [])
      .filter(function (s) { return s && /^https:\/\//.test(s.url); }).map(function (s) { return s.judul + ": " + s.url; });
    var b = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Candra Analis//Agenda IPO dan Dividen//ID", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    x.tgl.forEach(function (d) {
      if (hariDari(d.sampai || d.tanggal, h) < 0) return;
      var p = PENJELASAN_AGENDA[d.kunci], mulai = tglIcs(d.tanggal), akhir = tglIcs(d.sampai || d.tanggal, 1);
      if (!p || !mulai || !akhir) return;
      var judul = nama + ": " + p[0] + (ipo ? " IPO" : " dividen " + a.jenis + " " + a.tahunBuku);
      var isi = p[1] + "\n\nSumber:\n" + sumber.join("\n") +
        "\n\nAgenda adalah jadwal, bukan saran membeli atau menjual. Cek ulang tanggalnya di sumber dan di " + ICS_ALAMAT;
      b.push("BEGIN:VEVENT",
        "UID:" + uidIcs([x.jenis, a.kode || a.nama, a.tahunBuku || "", d.kunci, mulai].join("-")) + "@candra-analis.vercel.app",
        "DTSTAMP:" + cap,
        "DTSTART;VALUE=DATE:" + mulai,
        "DTEND;VALUE=DATE:" + akhir,
        "SUMMARY:" + escIcs(judul),
        "DESCRIPTION:" + escIcs(isi),
        "URL:" + ICS_ALAMAT,
        "TRANSP:TRANSPARENT",
        "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + escIcs("Besok: " + judul), "TRIGGER:-PT15H", "END:VALARM",
        "END:VEVENT");
    });
    b.push("END:VCALENDAR");
    return b.map(lipatIcs).join("\r\n") + "\r\n";
  }
  function namaBerkasIcs(x) {
    var a = x.data;
    return ("agenda-" + (a.kode || a.nama) + "-" + (x.jenis === "ipo" ? "ipo" : "dividen-" + a.jenis + "-" + a.tahunBuku))
      .toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/-$/, "") + ".ics";
  }
  function tombolKalender(x, kini) {
    var sisa = x.tgl.filter(function (d) { return hariDari(d.sampai || d.tanggal, kini) >= 0; }).length;
    if (!sisa) return null;
    var label = x.jenis === "ipo" ? (x.data.kode || x.data.nama) : x.data.kode;
    var info = el("p", { class: "kalender-info", role: "status", "aria-live": "polite" });
    var tombol = el("button", { type: "button", class: "tombol tombol-gelap tombol-kalender",
      text: "Tambahkan ke kalender (" + sisa + " tanggal)",
      "aria-label": "Tambahkan ke kalender (" + sisa + " tanggal): " + label + ", berkas .ics" });
    var urlLama = null;
    tombol.addEventListener("click", function () {
      try {
        var blob = new Blob([buatIcs(x, new Date())], { type: "text/calendar;charset=utf-8" });
        // URL berkas sebelumnya dilepas saat tombol ditekan lagi (tanpa pengatur waktu).
        if (urlLama) URL.revokeObjectURL(urlLama);
        var url = urlLama = URL.createObjectURL(blob), t = document.createElement("a");
        t.href = url; t.download = namaBerkasIcs(x); t.hidden = true;
        document.body.appendChild(t); t.click(); t.remove();
        info.textContent = "Berkas " + namaBerkasIcs(x) + " diunduh. Buka berkasnya agar tanggal masuk ke aplikasi kalender.";
      } catch (err) {
        info.textContent = "Berkas kalender belum bisa dibuat di peramban ini. Tanggalnya tetap bisa dicatat manual dari kartu ini.";
      }
    });
    return el("div", { class: "agenda-kalender" }, [
      tombol,
      info
    ]);
  }

  /* Tanda "baru" di menu Agenda (Arif + Tegar, 20 Nov 2026): hanya kenyamanan. Daftar acara yang sudah dilihat disimpan
     di localStorage peramban ini (dibungkus try/catch; bila tidak bisa, tanda tidak muncul). Tanpa server, tanpa data pribadi. */
  var KUNCI_AGENDA_DILIHAT = "candra-agenda-dilihat";
  function idAgenda(x) { return [x.jenis, x.data.kode || x.data.nama, x.data.jenis || "", x.data.tahunBuku || ""].join(":"); }
  function tandaAgendaBaru() {
    if (!window.AGENDA_IPO && !window.AGENDA_DIVIDEN) return;
    var ids = susunAgenda(new Date()).depan.map(idAgenda), dilihat = null;
    try { dilihat = JSON.parse(localStorage.getItem(KUNCI_AGENDA_DILIHAT) || "null"); } catch (e) { return; }
    if (document.getElementById("agenda")) {
      try { localStorage.setItem(KUNCI_AGENDA_DILIHAT, JSON.stringify(ids)); } catch (e) { /* abaikan */ }
      return;
    }
    if (!Array.isArray(dilihat)) dilihat = [];
    var baru = ids.filter(function (i) { return dilihat.indexOf(i) < 0; }).length;
    if (!baru) return;
    document.querySelectorAll('.nav a[href="agenda.html"]').forEach(function (a) {
      a.appendChild(el("span", { class: "titik-baru", "aria-hidden": "true" }));
      a.appendChild(el("span", { class: "khusus-pembaca-layar", text: " (ada " + baru + " agenda baru)" }));
    });
  }

  /* ---------- Pemberitahuan Agenda di beranda, Radar, dan profil (Dewi + Galih, 20 Nov 2026; proyek prioritas Agenda) ----------
     Beranda: pita "Agenda terdekat" (maks. 3 acara yang belum lewat). Radar & profil: kartu tingkat "info" bila emiten itu
     punya tanggal dividen dalam 30 hari ke depan. Info jadwal, bukan tanda risiko dan bukan saran membeli atau menjual. */
  var AGENDA_INFO_HARI = 30;
  // Tanggal dividen terdekat (0–30 hari lagi) untuk satu kode, atau null.
  function dividenDekat(kode, kini) {
    var calon = null;
    susunAgenda(kini).depan.forEach(function (x) {
      if (calon || x.jenis !== "dividen" || x.data.kode !== kode) return;
      var n = hariDari(x.berikut.tanggal, kini);
      if (n >= 0 && n <= AGENDA_INFO_HARI) calon = { x: x, n: n };
    });
    return calon;
  }
  function infoAgendaEmiten(kode, kini) {
    var c = dividenDekat(kode, kini);
    if (!c) return null;
    var a = c.x.data, namaB = PENJELASAN_AGENDA[c.x.berikut.kunci][0];
    return el("div", { class: "info-agenda", role: "note" }, [
      el("p", { class: "info-agenda-kepala" }, [el("span", { class: "kabar-jenis", text: "Info" }), " ",
        el("strong", { text: namaB + " dividen " + a.jenis + " " + tanggalId(c.x.berikut.tanggal) + ", " + teksMundur(c.n) })]),
      el("p", { text: "Dividen " + (a.mataUang === "USD" ? "US$" + angka2.format(a.dps) : "Rp" + angka2.format(a.dps)) +
        " per saham (sebelum pajak), tahun buku " + a.tahunBuku + ". Ini jadwal, bukan tanda risiko dan bukan saran membeli atau menjual." }),
      el("p", null, [el("a", { href: "agenda.html", text: "Lihat semua tanggal dan sumbernya di Agenda" })])
    ]);
  }
  function renderAgendaBeranda() {
    var wadah = document.getElementById("agenda-beranda");
    if (!wadah) return;
    var kini = new Date(), sAg = susunAgenda(kini), dekat = sAg.depan.slice(0, 3);
    if (!dekat.length) return;
    var ul = el("ul", { class: "agenda-pita" });
    dekat.forEach(function (x) {
      var a = x.data, ipo = x.jenis === "ipo", n = hariDari(x.berikut.tanggal, kini);
      var namaB = PENJELASAN_AGENDA[x.berikut.kunci][0];
      ul.appendChild(el("li", null, [
        el("span", { class: "kode", text: a.kode || "IPO" }),
        el("span", { class: "agenda-pita-isi" }, [
          (ipo ? "IPO " + a.nama + ": " : "Dividen " + a.jenis + ": "),
          el("span", { class: "agenda-pita-tanggal", text: namaB }), " ",
          el("time", { datetime: x.berikut.tanggal, text: tanggalId(x.berikut.tanggal) })
        ]),
        el("span", { class: "agenda-mundur", text: n < 0 && x.berikut.sampai ? "sedang berjalan" : teksMundur(n) })
      ]));
    });
    wadah.appendChild(el("div", { class: "wadah" }, [
      el("h2", { id: "judul-agenda-beranda", text: "Agenda terdekat" }),
      el("p", { class: "pengantar" }, ["Jadwal IPO dan dividen saham syariah. ",
        el("strong", { text: "Agenda adalah jadwal, bukan saran membeli atau menjual." })]),
      // Dewi + Nina (20 Nov 2026, IDE.md #41): ringkasan "Minggu ini" memakai ringkasMingguIni yang sama dengan Agenda
      // (tanpa hitungan baru). Ikut tersembunyi bersama pita bila tidak ada acara (fungsi berhenti di atas).
      el("p", { class: "agenda-ringkas", id: "agenda-ringkas-beranda" }, [el("strong", { text: "Minggu ini" }), " " + ringkasMingguIni(sAg, kini)]),
      ul,
      el("p", { class: "agenda-pita-tautan" }, [el("a", { href: "agenda.html", text: "Semua agenda IPO & dividen" }),
        el("a", { href: "agenda.html#arti-tanggal", text: "Arti tanggal" })])
    ]));
  // Dewi + Nina (20 Nov 2026, IDE.md #39): nama tanggal di tiap baris (Cum date, Penawaran umum, dll.) bisa diketuk.
    // Hanya nama tanggal yang ditandai (nama emiten & jenis dividen tidak), di setiap baris agar tiap acara terjelaskan.
    ul.querySelectorAll(".agenda-pita-tanggal").forEach(function (s) { pasangIstilah(s); });
    wadah.hidden = false;
  }
  /* Arif + Dewi (21 Nov 2026): satu baris "Terakhir diperiksa tim" agar pengguna tahu seberapa baru Agenda.
     Bila pemeriksaan terakhir lebih dari AGENDA_BASI_HARI hari lalu, diberi catatan jujur bahwa jadwal mungkin berubah. */
  var AGENDA_BASI_HARI = 3;
  function teksDiperiksaAgenda(t, kini) {
    var n = hariDari(t, kini);
    if (n == null || n > 0) return "";
    var teks = "Terakhir diperiksa tim: " + tanggalId(t) + ".";
    if (-n > AGENDA_BASI_HARI) teks += " Sudah lebih dari " + AGENDA_BASI_HARI + " hari; jadwal di bawah mungkin sudah berubah, periksa juga sumbernya.";
    return teks;
  }
  var CATATAN_ICS = "Tombol \u201cTambahkan ke kalender\u201d di tiap kartu membuat berkas .ics untuk aplikasi kalender di HP atau komputer, dengan pengingat sehari sebelumnya pukul 09.00. Berkas dibuat di perangkat Anda; tidak ada data yang dikirim.";
  function dasarAlamatAgenda() {
    try { return String(location.href || "").split(/[?#]/)[0] || "agenda.html"; } catch (e) { return "agenda.html"; }
  }
  function papanKlipAgenda() {
    return typeof window !== "undefined" && window.isSecureContext && typeof navigator !== "undefined" && navigator.clipboard ? navigator.clipboard : null;
  }
  // Alamat Agenda berakhiran "#" + id kartu: kartu itu ditampilkan (pilihan kembali ke "Semua" bila kartunya tersembunyi), digulir ke layar,
  // difokus, dan disorot sebentar. Sorotan bergerak hanya bila prefers-reduced-motion: no-preference (lihat styles.css).
  function sorotKartuAgenda(akar, saring) {
    var id = "";
    try { id = decodeURIComponent(String(location.hash || "").slice(1)); } catch (e) { return null; }
    if (!/^(ipo|dividen)-[a-z0-9-]+$/.test(id)) return null;
    var k = document.getElementById(id);
    if (!k || !akar.contains(k)) return null;
    if (k.hidden || (k.parentNode && k.parentNode.hidden)) saring.terapkan("semua", true);
    var tenang = false;
    try { tenang = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* anggap boleh bergerak */ }
    akar.querySelectorAll(".agenda-sorot").forEach(function (z) { z.classList.remove("agenda-sorot"); });
    k.classList.add("agenda-sorot");
    k.addEventListener("animationend", function () { k.classList.remove("agenda-sorot"); }, { once: true });
    try { k.scrollIntoView({ block: "start", behavior: tenang ? "auto" : "smooth" }); } catch (e) { k.scrollIntoView(); }
    try { k.focus({ preventScroll: true }); } catch (e) { k.focus(); }
    return k;
  }
  // Kotak "Cara memeriksa status syariah sebuah IPO" di bagian IPO (Sari + Hana + Dewi, 20 Nov 2026, IDE.md #40).
  // Kalimat memakai isi pelajaran & kamus yang sudah ditinjau Hana. Terbuka bila belum ada IPO di daftar.
  var URL_DES_OJK = "https://ojk.go.id/id/berita-dan-kegiatan/pengumuman/Pages/Daftar-Efek-Syariah-KEP21D042026.aspx";
  function kotakCaraIpo(adaIpo) {
    var isi = el("div", { class: "agenda-cara-isi" }, [
      el("p", { text: "Berita IPO biasanya menulis jadwal dan harga, tetapi belum tentu menyebut status syariah. Anda bisa memeriksanya sendiri:" }),
      el("ol", null, [
        el("li", null, ["Baca prospektus perusahaan di ", el("span", { class: "tanpa-putus", text: "e-ipo.co.id" }), " atau situs perusahaan. Cari kalimat yang menyebut sahamnya termasuk efek syariah."]),
        el("li", null, ["Bila prospektus tidak menyebutnya, lihat ",
          el("a", { href: URL_DES_OJK, rel: "noopener", text: "pengumuman Daftar Efek Syariah dari OJK" }),
          ". OJK menerbitkan DES secara berkala, berlaku efektif 1 Juni dan 1 Desember; di antara jadwal itu OJK juga bisa menambahkan saham baru secara insidentil, misalnya emiten yang baru mencatatkan saham."]),
        el("li", { text: "Status syariah bisa berubah. Setelah saham tercatat di bursa, cek lagi di DES periode berikutnya." })
      ]),
      el("p", null, ["Candra Analis baru mencatat IPO di Agenda bila salah satu bukti di atas ada. Status syariah hanya satu hal yang diperiksa; ikut IPO atau tidak tetap keputusan Anda sendiri. Langkah ikut e-IPO dijelaskan di pelajaran ",
        el("a", { href: "pelajaran.html?m=praktik-beli-pertama", text: "Praktik: membeli saham pertama Anda" }), "."])
    ]);
    var a = { class: "agenda-arti agenda-cara-ipo", id: "cara-cek-ipo", "data-jenis": "ipo" };
    if (!adaIpo) a.open = "";
    return el("details", a, [el("summary", { text: "Cara memeriksa status syariah sebuah IPO" }), isi]);
  }
  function renderAgenda() {
    var akar = document.getElementById("agenda");
    if (!akar) return;
    var kini = new Date(), s = susunAgenda(kini);
    akar.appendChild(el("div", { class: "pita-sumber", role: "note" }, [
      el("p", null, ["Agenda disusun dari pengumuman emiten, prospektus, dan berita; tanggal dan angka ditulis seperti di sumbernya. Hitung mundur memakai tanggal di perangkat Anda. ",
        el("strong", { text: "Agenda adalah jadwal, bukan saran membeli atau menjual." })])
    ]));
    akar.appendChild(el("p", { class: "agenda-ringkas", id: "agenda-ringkas" }, [el("strong", { text: "Minggu ini" }), " " + ringkasMingguIni(s, kini)]));
    var diperiksa = teksDiperiksaAgenda(window.AGENDA_DIPERIKSA, kini);
    if (diperiksa) akar.appendChild(el("p", { class: "agenda-diperiksa", id: "agenda-diperiksa", text: diperiksa }));
    var saring = kotakSaringAgenda(akar);
    akar.appendChild(saring);
    var dipakai = {};
    // Tiap judul bagian dan daftarnya diberi data-jenis agar bisa disembunyikan tombol pilihan (IDE.md #35).
    function bagian(id, judulTeks, ketKosong, daftar, jenisBagian) {
      var ul = el("ul", { class: "kabar-daftar", "data-jenis": jenisBagian });
      daftar.forEach(function (x) {
        // Id ganda (dua entri sama) diberi akhiran -2, -3 agar tiap alamat menunjuk satu kartu.
        var dasar = idKartuAgenda(x), idK = dasar, n = 1;
        while (dipakai[idK]) idK = dasar + "-" + (++n);
        dipakai[idK] = true;
        var k = kartuAgenda(x, kini, idK); k.setAttribute("data-jenis", x.jenis); ul.appendChild(k);
      });
      akar.appendChild(el("h2", { class: "judul-profil-bagian", id: id, text: judulTeks, "data-jenis": jenisBagian }));
      akar.appendChild(daftar.length ? ul : el("p", { class: "agenda-kosong", text: ketKosong, "data-jenis": jenisBagian }));
    }
    var ipoDepan = s.depan.filter(function (x) { return x.jenis === "ipo"; });
    var divDepan = s.depan.filter(function (x) { return x.jenis === "dividen"; });
    bagian("agenda-ipo", "IPO saham syariah", "Belum ada IPO yang sumbernya menyebut sahamnya termasuk efek syariah. " +
      "Tim memeriksa e-IPO, pengumuman bursa, dan prospektus setiap hari kerja; perusahaan baru dicatat di sini setelah ada bukti status syariahnya.", ipoDepan, "ipo");
    bagian("agenda-dividen", "Dividen saham syariah", "Belum ada jadwal dividen dari saham syariah yang diumumkan untuk waktu dekat. " +
      "Tim memeriksa pengumuman emiten dan berita setiap hari kerja; hanya saham yang tercatat di Daftar Efek Syariah yang dicatat.", divDepan, "dividen");
    if (s.lewat.length) bagian("agenda-lewat", "Baru saja lewat", "", s.lewat, "campur");
    akar.appendChild(el("p", { class: "catatan-metode" }, ["Acara yang sudah lewat lebih dari " + AGENDA_LEWAT_MAKS +
      " hari tidak ditampilkan. Cara tim memilih data dijelaskan di ", el("a", { href: "metodologi.html", text: "halaman metodologi" }), "."]));
    // Istilah dipasang lebih dulu di kartu (nama tanggal bisa diketuk), baru kotak arti disisipkan di atas daftar.
    pasangIstilah(akar);
    akar.insertBefore(kotakArtiAgenda(), akar.querySelector("h2"));
    // Kotak cara cek IPO disisipkan sesudah daftar/keterangan kosong bagian IPO; istilah hanya di isinya, bukan di summary.
    var caraIpo = kotakCaraIpo(ipoDepan.length > 0), judulDiv = akar.querySelector("#agenda-dividen");
    akar.insertBefore(caraIpo, judulDiv);
    pasangIstilah(caraIpo.querySelector(".agenda-cara-isi"));
    var h2Awal = akar.querySelector("h2");
    // Penjelasan berkas .ics ditulis sekali di atas daftar, hanya bila ada tombol kalender (IDE.md #36).
    if (akar.querySelector(".tombol-kalender")) akar.insertBefore(el("p", { class: "agenda-catatan-ics", id: "catatan-ics", text: CATATAN_ICS }), h2Awal);
    saring.terapkan(jenisAwalAgenda());
    sorotKartuAgenda(akar, saring);
    bukaArtiTanggal(akar);
    window.addEventListener("hashchange", function () { sorotKartuAgenda(akar, saring); bukaArtiTanggal(akar); });
  }
  // Dewi + Nina (20 Nov 2026, IDE.md #39): tautan "Arti tanggal" dari beranda (agenda.html#arti-tanggal) membuka kotak arti
  // walau biasanya tertutup sesudah kunjungan pertama, lalu menggulir ke sana (tanpa gulir halus bila gerak dikurangi).
  function bukaArtiTanggal(akar) {
    if (String(location.hash || "") !== "#arti-tanggal") return null;
    var d = akar.querySelector("#arti-tanggal");
    if (!d) return null;
    d.open = true;
    var tenang = false;
    try { tenang = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { /* anggap boleh bergerak */ }
    try { d.scrollIntoView({ block: "start", behavior: tenang ? "auto" : "smooth" }); } catch (e) { d.scrollIntoView(); }
    var r = d.querySelector("summary");
    if (r) { try { r.focus({ preventScroll: true }); } catch (e) { r.focus(); } }
    return d;
  }
  /* Dewi + Arif (20 Nov 2026, IDE.md #35): ringkasan "Minggu ini" dan tombol pilihan Semua / IPO / Dividen.
     Ringkasan hanya menghitung tanggal dari data yang sama (hari ini sampai 6 hari lagi), tanpa kata ajakan.
     Pilihan tidak disimpan; alamat ikut berubah (?jenis=ipo / ?jenis=dividen) agar bisa dibagikan. */
  var AGENDA_JENIS = ["semua", "ipo", "dividen"];
  var NAMA_RINGKAS_AGENDA = { cum: "cum date", ex: "ex date", recording: "recording date", pembayaran: "pembayaran dividen" };
  function hitungMingguIni(s, kini) {
    var hitung = { cum: 0, ex: 0, recording: 0, pembayaran: 0, ipo: 0 };
    s.depan.forEach(function (x) {
      x.tgl.forEach(function (d) {
        var awal = hariDari(d.tanggal, kini), akhir = hariDari(d.sampai || d.tanggal, kini);
        if (awal == null || akhir == null || akhir < 0 || awal > 6) return;
        if (x.jenis === "ipo") hitung.ipo++; else if (hitung[d.kunci] != null) hitung[d.kunci]++;
      });
    });
    return hitung;
  }
  function ringkasMingguIni(s, kini) {
    var h = hitungMingguIni(s, kini), bagianT = [];
    ["cum", "ex", "recording", "pembayaran"].forEach(function (k) { if (h[k]) bagianT.push(h[k] + " " + NAMA_RINGKAS_AGENDA[k]); });
    bagianT.push(h.ipo + " tahap IPO");
    var d0 = new Date(kini.getFullYear(), kini.getMonth(), kini.getDate()), d6 = new Date(d0.getFullYear(), d0.getMonth(), d0.getDate() + 6);
    var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    return "(" + tanggalId(iso(d0)) + " – " + tanggalId(iso(d6)) + "): " + bagianT.join(", ") + ".";
  }
  function jenisAwalAgenda() {
    try {
      var j = new URLSearchParams(location.search).get("jenis");
      return AGENDA_JENIS.indexOf(j) > 0 ? j : "semua";
    } catch (e) { return "semua"; }
  }
  function kotakSaringAgenda(akar) {
    var label = { semua: "Semua", ipo: "IPO", dividen: "Dividen" };
    var status = el("p", { class: "khusus-pembaca-layar", "aria-live": "polite" });
    var tombol = {};
    var baris = el("div", { class: "agenda-saring", role: "group", "aria-label": "Tampilkan agenda" },
      AGENDA_JENIS.map(function (j) {
        var b = el("button", { type: "button", class: "agenda-saring-tombol", "aria-pressed": "false", text: label[j] });
        b.addEventListener("click", function () { wadah.terapkan(j, true); });
        tombol[j] = b;
        return b;
      }));
    var wadah = el("div", { class: "agenda-saring-wadah" }, [baris, status]);
    wadah.terapkan = function (jenis, dariKlik) {
      AGENDA_JENIS.forEach(function (j) { tombol[j].setAttribute("aria-pressed", j === jenis ? "true" : "false"); });
      var cocok = function (j) { return jenis === "semua" || j === jenis; };
      akar.querySelectorAll('[data-jenis="ipo"], [data-jenis="dividen"]').forEach(function (e) {
        if (!e.closest('[data-jenis="campur"]')) e.hidden = !cocok(e.getAttribute("data-jenis"));
      });
      // "Baru saja lewat" berisi campuran: sembunyikan kartu yang tidak cocok, dan bagiannya bila kosong.
      var lewatUl = akar.querySelector('ul[data-jenis="campur"]'), lewatH = akar.querySelector('h2[data-jenis="campur"]');
      if (lewatUl) {
        var ada = 0;
        lewatUl.querySelectorAll("li[data-jenis]").forEach(function (li) { li.hidden = !cocok(li.getAttribute("data-jenis")); if (!li.hidden) ada++; });
        lewatUl.hidden = !ada; if (lewatH) lewatH.hidden = !ada;
      }
      if (dariKlik) {
        status.textContent = "Menampilkan agenda: " + label[jenis] + ".";
        try {
          var u = new URL(location.href);
          if (jenis === "semua") u.searchParams.delete("jenis"); else u.searchParams.set("jenis", jenis);
          history.replaceState(null, "", u.pathname + u.search + u.hash);
        } catch (e) { /* alamat tidak diubah; pilihan tetap berlaku */ }
      }
    };
    return wadah;
  }
  /* Dewi + Arif (20 Nov 2026, IDE.md #34): penjelasan tiap tanggal ditulis sekali di kotak <details> di atas daftar,
     tidak diulang di setiap kartu, agar halaman lebih pendek di HP. Teks dari PENJELASAN_AGENDA, tidak diubah. */
  function kotakArtiAgenda() {
    function kelompok(judul, kunci) {
      var dl = el("dl", { class: "agenda-arti-daftar" });
      kunci.forEach(function (k) {
        dl.appendChild(el("dt", { text: PENJELASAN_AGENDA[k][0] }));
        dl.appendChild(el("dd", { text: PENJELASAN_AGENDA[k][1] }));
      });
      return el("div", { class: "agenda-arti-kelompok" }, [el("p", { class: "agenda-arti-judul", text: judul }), dl]);
    }
    // Terbuka di kunjungan pertama ke Agenda, tertutup sesudahnya (localStorage dalam try/catch; gagal = tertutup).
    var pertama = false;
    try { pertama = !localStorage.getItem("ca-arti-agenda"); localStorage.setItem("ca-arti-agenda", "1"); } catch (e) { pertama = false; }
    return el("details", pertama ? { class: "agenda-arti", id: "arti-tanggal", open: "" } : { class: "agenda-arti", id: "arti-tanggal" }, [
      el("summary", { text: "Arti tanggal-tanggal ini" }),
      kelompok("Tahap IPO", ["penawaranAwal", "penawaranUmum", "penjatahan", "pencatatan"]),
      kelompok("Tanggal dividen", ["cum", "ex", "recording", "pembayaran"])
    ]);
  }

  tandaiMenu();
  renderJalur("jalur-ringkas", false);
  renderLanjutkan();
  renderIstilahHari();
  renderJalur("jalur-lengkap", true);
  renderKamus();
  renderPelajaran();
  renderMini();
  musimBeranda();
  renderPeringkat();
  renderRadar();
  renderProfil();
  renderKabar();
  renderAgenda();
  renderAgendaBeranda();
  tandaAgendaBaru();
  renderKabarBeranda();
  istilahBeranda();
  renderRujukan();
  renderAsisten();
  istilahMetodologi();
  renderIsiHalaman();
  // Dewi + Arif (8 Nov 13.08; Kabar ikut sejak 14.10): kalimat pembuka kepala halaman ikut ditandai,
  // tetapi istilah yang sudah ditandai di isi halaman dilewati agar tidak ganda.
  if (!document.querySelector(".judul-halaman button.istilah")) pasangIstilahKepala();
  pasangTandaBahasa();

  /* ---------- Bahasa bagian (WCAG 3.1.2) ---------- */
  // Dewi + Arif (18 Nov 07.xx): istilah berbahasa Inggris di teks Indonesia dibungkus <span lang="en">
  // agar pembaca layar mengucapkannya dengan lafal Inggris. Berjalan sesudah istilah ditandai
  // (agar pola istilah tidak terpotong) dan memantau isi yang dibuat ulang lewat JavaScript.
  function pasangTandaBahasa() {
    var KATA = ["Sharia Online Trading System", "Sharia Virtual Trading", "Single Investor Identification",
      "Jakarta Islamic Index", "Price to Earnings Ratio", "Debt to Equity Ratio", "Return on Equity",
      "year on year", "limited review", "core profit", "dividend payout", "payout ratio", "Dividend yield",
      "Capital gain", "Capital loss", "Short selling", "buyback", "payout", "Matched", "fee"];
    var RE = new RegExp("(?<!\\p{L})(" + KATA.join("|") + ")(?!\\p{L})", "giu");
    var TOLAK = /^(SCRIPT|STYLE|TEXTAREA|SELECT|OPTION|TITLE|CODE|svg)$/;
    function tandai(akar) {
      if (!akar || akar.nodeType !== 1 && akar.nodeType !== 3) return;
      var simpul = [];
      if (akar.nodeType === 3) simpul.push(akar);
      else {
        var jalan = document.createTreeWalker(akar, NodeFilter.SHOW_TEXT);
        while (jalan.nextNode()) simpul.push(jalan.currentNode);
      }
      simpul.forEach(function (n) {
        var induk = n.parentNode;
        if (!induk || induk.nodeType !== 1) return;
        for (var p = induk; p && p.nodeType === 1; p = p.parentNode) if (TOLAK.test(p.nodeName)) return;
        var bhs = induk.closest("[lang]");
        if (bhs && !/^id\b/i.test(bhs.getAttribute("lang"))) return;
        RE.lastIndex = 0;
        if (!RE.test(n.nodeValue)) return;
        var potong = document.createDocumentFragment(), teks = n.nodeValue, akhir = 0, m;
        RE.lastIndex = 0;
        while ((m = RE.exec(teks))) {
          if (m.index > akhir) potong.appendChild(document.createTextNode(teks.slice(akhir, m.index)));
          potong.appendChild(el("span", { lang: "en", text: m[0] }));
          akhir = m.index + m[0].length;
        }
        if (akhir < teks.length) potong.appendChild(document.createTextNode(teks.slice(akhir)));
        induk.replaceChild(potong, n);
      });
    }
    tandai(document.body);
    if (window.MutationObserver) new MutationObserver(function (daftar) {
      daftar.forEach(function (d) {
        if (d.type === "characterData") tandai(d.target);
        else Array.prototype.forEach.call(d.addedNodes, tandai);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
})();
