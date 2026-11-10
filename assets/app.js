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
    return el("td", null, [el("a", { class: "kode tautan-kode", href: "emiten.html?kode=" + e.kode, text: e.kode, "aria-label": "Profil " + e.kode }), el("span", { class: "nama-emiten", text: e.nama })]);
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
    var umpan = [];
    m.kuis.forEach(function (q, i) {
      var fs = el("fieldset", { class: "kuis-soal" });
      fs.appendChild(el("legend", { text: (i + 1) + ". " + q.soal }));
      q.pilihan.forEach(function (p, j) {
        var idIn = "kuis-" + i + "-" + j;
        fs.appendChild(el("div", { class: "kuis-pilihan" }, [
          el("input", { type: "radio", name: "soal-" + i, id: idIn, value: String(j) }),
          el("label", { for: idIn, text: p })
        ]));
      });
      var u = el("p", { class: "kuis-umpan", hidden: "" });
      umpan.push(u); fs.appendChild(u);
      form.appendChild(fs);
    });
    var hasil = el("p", { class: "kuis-hasil", role: "status", "aria-live": "polite" });
    var ulang = el("button", { type: "button", class: "tombol kuis-ulang", text: "Ulangi kuis", hidden: "" });
    form.appendChild(el("div", { class: "kuis-aksi" }, [
      el("button", { type: "submit", class: "tombol tombol-gelap", text: "Periksa jawaban" }), ulang
    ]));
    form.appendChild(hasil);

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var benar = 0, kosong = 0;
      m.kuis.forEach(function (q, i) {
        var pilih = form.querySelector('input[name="soal-' + i + '"]:checked');
        var u = umpan[i];
        u.hidden = false;
        if (!pilih) { kosong++; u.className = "kuis-umpan kuis-kosong"; u.textContent = "Belum dijawab."; return; }
        var tepat = Number(pilih.value) === q.benar;
        if (tepat) benar++;
        u.className = "kuis-umpan " + (tepat ? "kuis-tepat" : "kuis-salah");
        u.textContent = (tepat ? "✓ Benar. " : "✗ Belum tepat. Jawaban: " + q.pilihan[q.benar] + ". ") + q.jelas;
      });
      hasil.textContent = benar + " dari " + m.kuis.length + " benar" +
        (kosong ? " (" + kosong + " soal belum dijawab)." : benar === m.kuis.length ? ". Bagus, Anda siap ke pelajaran berikutnya." : ". Baca lagi bagian yang belum tepat, lalu coba ulangi.");
      ulang.hidden = false;
    });
    ulang.addEventListener("click", function () {
      form.reset();
      umpan.forEach(function (u) { u.hidden = true; u.textContent = ""; });
      hasil.textContent = ""; ulang.hidden = true;
      var pertama = form.querySelector("input");
      if (pertama) pertama.focus();
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
      panel.appendChild(el("div", { class: "tabel-wadah" }, [
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
    { tingkat: "tinggi", warna: "Merah", arti: "Tanda berat, misalnya rugi, laba turun lebih dari separuh, atau tidak lagi tercatat sebagai saham syariah." },
    { tingkat: "sedang", warna: "Kuning", arti: "Tanda yang perlu dicermati, misalnya laba atau pendapatan menurun, atau utang lebih dari dua kali modal." },
    { tingkat: "info", warna: "Biru", arti: "Keterangan tambahan, misalnya catatan data dari tim kami atau laba 9 bulan yang naik." },
    { tingkat: "aman", warna: "Hijau", arti: "Tidak ada tanda risiko dari pemeriksaan ini. Tetap pantau laporan berikutnya." }
  ];
  function panduanRadar() {
    var ul = el("ul", { class: "panduan-radar" });
    PANDUAN_RADAR.forEach(function (x) {
      ul.appendChild(el("li", { class: "panduan-baris" }, [
        el("span", { class: "lampu lampu-" + x.tingkat, "aria-hidden": "true" }),
        el("p", null, [el("strong", { text: x.warna + ": " }), document.createTextNode(x.arti)])
      ]));
    });
    return el("div", { class: "kotak-panduan" }, [
      el("h2", { class: "panduan-judul", text: "Cara membaca hasil Radar" }),
      el("p", { class: "catatan-metode", text: "Setiap temuan diberi warna. Warna menunjukkan jenis temuan, bukan saran membeli atau menjual." }),
      ul
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
    var form = el("div", { class: "radar-form" }, [
      el("label", { for: "pilih-saham", text: "Saham yang Anda pegang" }), pilih
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
      var ul = el("ul", { class: "sinyal-daftar" });
      s.forEach(function (x) {
        ul.appendChild(el("li", { class: "sinyal sinyal-" + x.tingkat }, [
          el("h4", { text: x.judul }), el("p", { text: x.isi }), el("p", { class: "bukti", text: x.bukti })
        ]));
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

    // Status syariah
    akar.appendChild(el("div", { class: "status-syariah " + (syariahAktif(e) ? "status-ya" : "status-tidak"), role: "note" }, [
      el("strong", { text: syariahAktif(e) ? "Tercatat sebagai saham syariah" : "Tidak lagi tercatat sebagai saham syariah" }),
      el("p", { text: syariahAktif(e)
        ? "Bukti: " + DES_LABEL + ", baris " + e.desBaris + ". Masuk daftar bukan berarti disarankan untuk dibeli."
        : "Emiten ini tidak ada di Daftar Efek Syariah periode terbaru." })
    ]));
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
      return el("div", { class: "ubin" }, [el("span", { class: "ubin-label", text: label }), el("strong", { class: "ubin-nilai", text: nilai }), ket ? el("span", { class: "ubin-ket", text: ket }) : null]);
    }
    var gl = tumbuhLaba(e), gp = tumbuhPendapatan(e), g9 = tumbuh(N[2025], N[2026]);
    akar.appendChild(el("h2", { class: "judul-profil-bagian", id: "angka-utama", text: "Angka utama" }));
    akar.appendChild(el("div", { class: "kisi-ubin" }, [
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
      ul.appendChild(el("li", { class: "sinyal sinyal-" + x.tingkat }, [
        el("h3", { class: "sinyal-judul", text: x.judul }), el("p", { text: x.isi }), el("p", { class: "bukti", text: x.bukti })
      ]));
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
    var tujuan = [["angka-utama", "Angka utama"], ["judul-banding", "Bandingkan"], ["radar-risiko", "Radar Risiko"],
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
        el("a", { class: "kode tautan-kode", href: "emiten.html?kode=" + e.kode, text: e.kode, "aria-label": "Profil " + e.kode }),
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

    var status = el("div", { class: "pita-demo", role: "status", hidden: "hidden" });
    var log = el("div", { class: "obrolan", "aria-live": "polite", "aria-label": "Percakapan dengan asisten" });
    var chips = el("div", { class: "contoh-tanya" });
    var area = el("textarea", { id: "kotak-tanya", rows: "3", maxlength: "600", placeholder: "Tulis pertanyaan Anda" });
    var tombol = el("button", { class: "tombol tombol-gelap", type: "submit", text: "Kirim pertanyaan" });
    var hitung = el("span", { class: "hitung-karakter", text: "0/600" });
    var form = el("form", { class: "form-tanya" }, [
      el("label", { for: "kotak-tanya", class: "label-tanya", text: "Pertanyaan Anda" }),
      area, el("div", { class: "form-bawah" }, [hitung, tombol])
    ]);

    contoh.forEach(function (c) {
      var b = el("button", { type: "button", class: "chip", text: c });
      b.addEventListener("click", function () { area.value = c; area.focus(); perbaruiHitung(); });
      chips.appendChild(b);
    });

    akar.appendChild(status);
    akar.appendChild(log);
    akar.appendChild(el("p", { class: "label-tanya", text: "Coba tanyakan:" }));
    akar.appendChild(chips);
    akar.appendChild(form);
    akar.appendChild(el("p", { class: "catatan-metode", style: "margin-top:16px",
      text: "Asisten AI bisa keliru. Selalu cek angka di laporan keuangan resmi. Jawaban asisten bukan rekomendasi membeli atau menjual efek. Jangan menuliskan data pribadi seperti nomor KTP atau rekening." }));

    function perbaruiHitung() { hitung.textContent = area.value.length + "/600"; }
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
        var b = el("button", { type: "button", class: "istilah", "aria-expanded": "false", "aria-controls": "kotak-istilah",
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
  function tandaiMenu() {
    var hal = location.pathname.split("/").pop() || "index.html";
    if (hal === "pelajaran.html") hal = "belajar.html";
    document.querySelectorAll(".nav a").forEach(function (a) {
      if (a.getAttribute("href") === hal) a.setAttribute("aria-current", "page");
    });
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
  renderKabarBeranda();
  istilahBeranda();
  renderRujukan();
  renderAsisten();
  istilahMetodologi();
  renderIsiHalaman();
  // Dewi + Arif (8 Nov 13.08; Kabar ikut sejak 14.10): kalimat pembuka kepala halaman ikut ditandai,
  // tetapi istilah yang sudah ditandai di isi halaman dilewati agar tidak ganda.
  if (!document.querySelector(".judul-halaman button.istilah")) pasangIstilahKepala();
})();
